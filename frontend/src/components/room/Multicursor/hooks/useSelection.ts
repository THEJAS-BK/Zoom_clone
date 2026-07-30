import { useEffect, useRef, useState } from "react";
import type { Dispatch, RefObject, SetStateAction } from "react";
import type { Shape, Line, TextBox, ToolSetters, BoardImage } from "../types";
import {
  hitTestLine,
  hitTestShape,
  hitTestTextBox,
  hitTestImage,
} from "../tools/hitTests";
import { socket } from "../../../../services/socket";
import {
  hitTestCorner,
  hitTestRotationHandle,
  hitTestTextBoxRotationHandle,
} from "../tools/hitTests";
import { useToolSettings } from "../../../../context/ToolBarLeftContext";
//tools

import { measureTextBox } from "../canvas";

type DragType = "shape" | "textbox" | "line" | "image" | null;

//mousedown
import {
  computeDragPosition,
  computeLineDragPosition,
  computeLineEndpointChanges,
  computeShapeResize,
  computeShapeRotation,
  emitElementUpdate,
  handleElementDelete,
  computeTextResize,
  type InteractionRefs,
  

} from "../tools/selectionTools";

//mouse move
import {
  tryStartShapeHandleInteraction,
  tryStartLineHandleInteraction,
  tryStartImageHandleInteraction,
  findElementAt,
  syncToolSettingsToShape,
  syncToolSettingsToText,
  syncToolSettingsToLine,
  computeTextBoxRotation,
  tryStartTextBoxHandleInteraction,
} from "../tools/selectionTools";
export function useSelection(
  roomId: string,
  canvasRef: RefObject<HTMLCanvasElement | null>,
  camera: RefObject<{ x: number; y: number; scale: number }>,
  shapesRef: RefObject<Shape[]>,
  linesRef: RefObject<Line[]>,
  images: RefObject<BoardImage[]>,
  color: string,
  activeTool: string | null,
  textBoxesRef: React.RefObject<TextBox[]>,
  activeTextBox: React.RefObject<TextBox | null>,
  onEditTextBox: () => void,
  doRedraw: () => void,
) {
  const isDragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const lineDragOffset = useRef({ x1: 0, x2: 0, y1: 0, y2: 0 });
  const dragType = useRef<"shape" | "textbox" | "line" | "image" | null>(null);
  const toCanvas = (clientX: number, clientY: number) => ({
    x: (clientX - camera.current.x) / camera.current.scale,
    y: (clientY - camera.current.y) / camera.current.scale,
  });

  //resize code
  const isResizing = useRef(false);
  const resizeCorner = useRef<"tl" | "tr" | "bl" | "br" | null>(null);
  const resizeOrigin = useRef({ x: 0, y: 0 });
  const textResizeOrigin = useRef<{
    x: number;
    y: number;
    fontSize: number;
    width: number;
    height: number;
    initialDist: number;
  } | null>(null);

  //resize code for lines
  const lineEndpoint = useRef<"p1" | "p2" | "mid" | null>(null);

  //isRotation
  const isRotating = useRef(false);

  //edit mode
  const {
    selectedEle,
    setArrowHead,
    setArrowType,
    setOpacity,
    setFontFamily,
    setFontSize,
    setTextAlign,
    setStrokeWidth,
    setSelectedEle,
    setFillColor,
    setStrokeStyle,
    setEdgeStyle,
    selectedId,
    setIsDashedBorderNeeded,
  } = useToolSettings();
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onMouseDown = (e: MouseEvent) => {
      if (activeTool !== "mouse") return;
      const { x, y } = toCanvas(e.clientX, e.clientY);
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const refs: InteractionRefs = {
        isDragging,
        isResizing,
        isRotating,
        dragType,
        dragOffset,
        lineDragOffset,
        resizeCorner,
        resizeOrigin,
        lineEndpoint,
      };
      const setters: ToolSetters = {
        setFillColor,
        setStrokeWidth,
        setStrokeStyle,
        setEdgeStyle,
        setOpacity,
        setFontFamily,
        setFontSize,
        setTextAlign,
        setArrowType,
        setArrowHead,
      };

      // 1. try to grab a handle on whatever is already selected
      if (selectedId.current) {
        const selectedText = textBoxesRef.current.find(
          (t) => t.id === selectedId.current,
        );
        if (
          selectedText &&
          tryStartTextBoxHandleInteraction(
            selectedText,
            x,
            y,
            camera.current.scale,
            refs,
            hitTestTextBoxRotationHandle,
            textResizeOrigin,
          )
        )
          return;

        const selectedShape = shapesRef.current.find(
          (s) => s.id === selectedId.current,
        );
        if (
          selectedShape &&
          tryStartShapeHandleInteraction(
            selectedShape,
            x,
            y,
            camera.current.scale,
            refs,
            hitTestRotationHandle,
            hitTestCorner,
          )
        )
          return;

        const selectedLine = linesRef.current.find(
          (l) => l.id === selectedId.current,
        );
        if (
          selectedLine &&
          tryStartLineHandleInteraction(
            selectedLine,
            x,
            y,
            camera.current.scale,
            refs,
          )
        )
          return;

        const selectedImage = images.current.find(
          (img) => img.id === selectedId.current,
        );

        if (
          selectedImage &&
          tryStartImageHandleInteraction(
            selectedImage,
            x,
            y,
            camera.current.scale,
            refs,
            hitTestRotationHandle,
            hitTestCorner,
          )
        ) {
          dragType.current = "image";
          return;
        }
      }

      // 2. otherwise, look for a new hit among all elements
      const { hitShape, hitLine, hitText, hitImage } = findElementAt(
        x,
        y,
        ctx,
        camera.current.scale,
        shapesRef.current,
        linesRef.current,
        textBoxesRef.current,
        images.current,
        hitTestShape,
        hitTestLine,
        hitTestTextBox,
        hitTestImage,
      );

      // 3. start dragging + sync toolbar to the hit element
      if (hitShape) {
        isDragging.current = true;
        dragType.current = "shape";
        canvas.style.cursor = "move";
        dragOffset.current = { x: x - hitShape.x, y: y - hitShape.y };
        syncToolSettingsToShape(hitShape, setters);
      } else if (hitText) {
        isDragging.current = true;
        dragType.current = "textbox";
        setIsDashedBorderNeeded(false);
        dragOffset.current = { x: x - hitText.x, y: y - hitText.y };
        syncToolSettingsToText(hitText, setters);
      } else if (hitLine) {
        isDragging.current = true;
        dragType.current = "line";
        lineDragOffset.current = {
          x1: x - hitLine.x1,
          x2: x - hitLine.x2,
          y1: y - hitLine.y1,
          y2: y - hitLine.y2,
        };
        syncToolSettingsToLine(hitLine, setters);
      } else if (hitImage) {
        isDragging.current = true;
        dragType.current = "image";
        dragOffset.current = { x: x - hitImage.x, y: y - hitImage.y };
      }

      const hit = hitShape ?? hitLine ?? hitText ?? hitImage;
      if (!hit) return;
      selectedId.current = hit.id;
      setSelectedEle(hit);
      doRedraw();
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!selectedId.current) return;
      const { x, y } = toCanvas(e.clientX, e.clientY);

      //!rotate
      if (isRotating.current) {
        if (dragType.current === "textbox") {
          const tb = textBoxesRef.current.find(
            (t) => t.id === selectedId.current,
          );
          const ctx = canvasRef.current?.getContext("2d");
          if (!tb || !ctx) return;

          tb.rotation = computeTextBoxRotation(tb, x, y);
          emitElementUpdate(roomId, tb.id, { rotation: tb.rotation });
          doRedraw();
          return;
        }
        if (dragType.current === "image") {
          const image = images.current.find(
            (img) => img.id === selectedId.current,
          );
          if (!image) return;
          image.rotation = computeShapeRotation(image, x, y); // same math works, shares Positionable shape
          emitElementUpdate(roomId, image.id, { rotation: image.rotation });
          doRedraw();
          return;
        }

        const shape = shapesRef.current.find(
          (s) => s.id === selectedId.current,
        );
        if (!shape) return;

        shape.rotation = computeShapeRotation(shape, x, y);
        emitElementUpdate(roomId, shape.id, { rotation: shape.rotation });
        doRedraw();
        return;
      }

      if (!isDragging.current && !isResizing.current) return;
      //resize image

      //!resize lines
      if (isResizing.current && lineEndpoint.current) {
        const line = linesRef.current.find((l) => l.id === selectedId.current);
        if (!line) return;

        const changes = computeLineEndpointChanges(
          line,
          lineEndpoint.current,
          x,
          y,
        );
        Object.assign(line, changes);
        emitElementUpdate(roomId, line.id, changes);
        doRedraw();
        return;
      }

      //!resize images
      if (isResizing.current && resizeCorner.current && resizeOrigin.current) {
        const corner = resizeCorner.current;
        const origin = resizeOrigin.current;

        if (dragType.current === "image") {
          const image = images.current.find(
            (img) => img.id === selectedId.current,
          );
          if (!image) return;

          const changes = computeShapeResize(image, corner, origin, x, y);
          Object.assign(image, changes);
          emitElementUpdate(roomId, image.id, changes);
          doRedraw();
          return;
        }

        //!resize textbox
       if (dragType.current === "textbox") {
  const tb = textBoxesRef.current.find((t) => t.id === selectedId.current);
  const origin = textResizeOrigin.current;
  if (!tb || !origin || !corner) return;

  const changes = computeTextResize(tb, corner, { x: origin.x, y: origin.y }, x, y, origin);
  Object.assign(tb, changes);
  emitElementUpdate(roomId, tb.id, changes);
  doRedraw();
  return;
}
        //!resize shapes
        const shape = shapesRef.current.find(
          (s) => s.id === selectedId.current,
        );
        if (!shape) return;

        const changes = computeShapeResize(shape, corner, origin, x, y);
        Object.assign(shape, changes);
        emitElementUpdate(roomId, shape.id, changes);
        doRedraw();
        return;
      }

      //!moving shape/textbox
      if (dragType.current === "image") {
        const image = images.current.find(
          (img) => img.id === selectedId.current,
        );
        const pos = computeDragPosition(x, y, dragOffset.current);
        if (image) Object.assign(image, pos);
        emitElementUpdate(roomId, selectedId.current, pos);
      }
      if (dragType.current === "shape" || dragType.current === "textbox") {
        const pos = computeDragPosition(x, y, dragOffset.current);

        if (dragType.current === "shape") {
          const shape = shapesRef.current.find(
            (s) => s.id === selectedId.current,
          );
          if (shape) Object.assign(shape, pos);
        } else {
          const tb = textBoxesRef.current.find(
            (t) => t.id === selectedId.current,
          );
          if (tb) Object.assign(tb, pos);
        }

        emitElementUpdate(roomId, selectedId.current, pos);
      }

      //!moving line
      if (dragType.current === "line") {
        const line = linesRef.current.find((l) => l.id === selectedId.current);
        const pos = computeLineDragPosition(x, y, lineDragOffset.current);
        if (line) Object.assign(line, pos);
        emitElementUpdate(roomId, selectedId.current, pos);
      }

      //move image

      doRedraw();
    };

    const onMouseUp = () => {
      if (activeTool !== "mouse") return;
      if (isResizing.current) {
        isResizing.current = false;
        resizeCorner.current = null;
        lineEndpoint.current = null;
        doRedraw();
        return;
      }
      if (isRotating.current) {
        isRotating.current = false;
        doRedraw();
        return;
      }

      if (!isDragging.current || !selectedId.current) return;
      isDragging.current = false;
      dragType.current = null;
      doRedraw();
    };

    const onDblClick = (e: MouseEvent) => {
      if (activeTool !== "mouse") return;
      const { x, y } = toCanvas(e.clientX, e.clientY);
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const hitText = [...(textBoxesRef?.current ?? [])]
        .reverse()
        .find((t) => hitTestTextBox(t, x, y, ctx));

      if (hitText) {
        activeTextBox.current = { ...hitText };
        onEditTextBox?.();
        setIsDashedBorderNeeded(true);
        doRedraw();
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      handleElementDelete(
        e,
        selectedId,
        shapesRef,
        linesRef,
        textBoxesRef,
        images,
        setSelectedEle,
        doRedraw,
        roomId,
        activeTool,
      );
    };

    canvas.addEventListener("mousedown", onMouseDown);
    canvas.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    canvas.addEventListener("dblclick", onDblClick);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      canvas.removeEventListener("mousedown", onMouseDown);
      canvas.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      canvas.removeEventListener("dblclick", onDblClick);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activeTool, color, doRedraw]);

  const { strokeColor, setStrokeColor } = useToolSettings();

  //edit mode
  useEffect(() => {
    if (selectedEle === null) {
      selectedId.current = null;
      doRedraw();
      return;
    }

    const handleClick = () => {
      if (activeTool !== "mouse") {
        setSelectedEle(null);
        selectedId.current = null;
        return;
      }
    };
    if (activeTool === "mouse" && selectedEle.type !== "image") {
      setStrokeColor(selectedEle.color);
    }

    window.addEventListener("click", handleClick);
    return () => {
      window.removeEventListener("click", handleClick);
    };
  }, [selectedEle, activeTool]);
}
