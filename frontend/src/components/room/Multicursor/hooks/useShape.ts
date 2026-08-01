import { useEffect, useRef } from "react";
import { socket } from "../../../../services/socket";
import type { RefObject } from "react";
import type { Shape, CanvasElement, Line, TextBox } from "../types";
import { useToolSettings } from "../../../../context/ToolBarLeftContext";
import { getNextZIndex } from "../tools/zIndex";

// maps the active tool name to the shape type stored on the element
const TOOL_TO_SHAPE: Record<string, "square" | "circle" | "diamond"> = {
  square: "square",
  circle: "circle",
  diamond: "diamond",
};

export function useShapes(
  roomId: string,
  canvasRef: RefObject<HTMLCanvasElement | null>,
  camera: RefObject<{ x: number; y: number; scale: number }>,
  shapesRef: RefObject<Shape[]>,
  activeShape: RefObject<Shape | null>,
  userIdRef: RefObject<string>,
  activeTool: string | null,
  color: string,
  linesRef: React.RefObject<Line[]>,
  textBoxesRef: React.RefObject<TextBox[]>,
  doRedraw: () => void,
) {
  const isDragging = useRef(false);

  const toCanvas = (clientX: number, clientY: number) => ({
    x: (clientX - camera.current.x) / camera.current.scale,
    y: (clientY - camera.current.y) / camera.current.scale,
  });

  const {
    fillColor,
    edgeStyle,
    shapeFillType,
    strokeWidth,
    strokeStyle,
    selectedEle,
    opacity
  } = useToolSettings();
  useEffect(() => {
    if (activeTool !== "mouse" || !selectedEle || selectedEle.type != "shape")
      return;
    const selectedShape = shapesRef.current.find(
      (l) => l.id === selectedEle.id,
    );
    if (!selectedShape) return;
    selectedShape.strokeWidth = strokeWidth;
    selectedShape.strokeStyle = strokeStyle;
    selectedShape.opacity=opacity;
    socket.emit("element-update", {
      roomId,
      id: selectedShape.id,
      changes: { strokeWidth, strokeStyle,opacity },
    });

    doRedraw();
  }, [selectedEle, strokeWidth, strokeStyle,opacity]);
  // ---- native mouse listeners on canvas ----
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const shapeType = activeTool ? TOOL_TO_SHAPE[activeTool] : undefined;

    const onMouseDown = (e: MouseEvent) => {
      if (!shapeType) return;
      const { x, y } = toCanvas(e.clientX, e.clientY);
      isDragging.current = true;
      activeShape.current = {
        id: crypto.randomUUID(),
        type: "shape",
        shapeType: activeTool as "square" | "circle" | "diamond",
        x,
        y,
        width: 0,
        height: 0,
        color,
        rotation: 0,
        fillColor,
        edgeStyle,
        strokeWidth,
        strokeStyle,
        opacity, 
        zIndex: getNextZIndex(shapesRef, linesRef, textBoxesRef),
        userId: userIdRef.current,
      };

      const shape = activeShape.current;
      socket.emit("element-add", { roomId, element: shape });
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || !activeShape.current) return;
      const { x, y } = toCanvas(e.clientX, e.clientY);
      activeShape.current = {
        ...activeShape.current,
        width: x - activeShape.current.x,
        height: y - activeShape.current.y,
      };

      const shape = activeShape.current;
      socket.emit("element-update", {
        roomId,
        id: shape.id,
        changes: { width: shape.width, height: shape.height },
      });
      requestAnimationFrame(doRedraw);
    };

    const onMouseUp = () => {
      if (!isDragging.current || !activeShape.current) return;
      isDragging.current = false;

      const shape = activeShape.current;
      activeShape.current = null;

      if (Math.abs(shape.width) < 5 && Math.abs(shape.height) < 5) {
        doRedraw();
        return;
      }

      shapesRef.current = [...shapesRef.current, shape];
      doRedraw();
    };
    //touch events
    const handleTouchStart=(e: TouchEvent)=>{
      if(e.touches.length!==1) return;
      e.preventDefault();
      onMouseDown(e.touches[0] as unknown as MouseEvent);
    }
    const handleTouchMove=(e: TouchEvent)=>{
      if(e.touches.length!==1) return;
      e.preventDefault();
      onMouseMove(e.touches[0] as unknown as MouseEvent);
    }

    canvas.addEventListener("mousedown", onMouseDown);
    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseup", onMouseUp);
    //touch events
    canvas.addEventListener("touchstart", handleTouchStart);
    canvas.addEventListener("touchmove", handleTouchMove);
    canvas.addEventListener("touchend", onMouseUp);
    canvas.addEventListener("touchcancel", onMouseUp);

    return () => {
      canvas.removeEventListener("mousedown", onMouseDown);
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mouseup", onMouseUp);
      //touch events
      canvas.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("touchend", onMouseUp);
      canvas.removeEventListener("touchcancel", onMouseUp);
    };
  }, [
    activeTool,
    color,
    doRedraw,
    fillColor,
    edgeStyle,
    shapeFillType,
    strokeStyle,
  ]);

  // ---- socket listeners ----
  useEffect(() => {
    const onElementAdd = (el: CanvasElement) => {
      if (el.type !== "shape") return;
      shapesRef.current = [...shapesRef.current, el];
      doRedraw();
    };

    const onElementUpdate = ({
      id,
      changes,
    }: {
      id: string;
      changes: Partial<Shape>;
    }) => {
      shapesRef.current = shapesRef.current.map((s) =>
        s.id === id ? { ...s, ...changes } : s,
      );
      doRedraw();
    };

    const onElementDelete = (id: string) => {
      shapesRef.current = shapesRef.current.filter((s) => s.id !== id);
      doRedraw();
    };

    const onElementState = (elements: CanvasElement[]) => {
      shapesRef.current = elements.filter(
        (e): e is Shape => e.type === "shape",
      );
      doRedraw();
    };

    socket.on("element-add", onElementAdd);
    socket.on("element-update", onElementUpdate);
    socket.on("element-delete", onElementDelete);
    socket.on("element-state", onElementState);

    return () => {
      socket.off("element-add", onElementAdd);
      socket.off("element-update", onElementUpdate);
      socket.off("element-delete", onElementDelete);
      socket.off("element-state", onElementState);
    };
  }, [doRedraw, activeTool, fillColor, edgeStyle, shapeFillType]);

  const deleteShape = (id: string) => {
    shapesRef.current = shapesRef.current.filter((s) => s.id !== id);
    socket.emit("element-delete", { roomId, id });
    doRedraw();
  };

  return { deleteShape };
}
