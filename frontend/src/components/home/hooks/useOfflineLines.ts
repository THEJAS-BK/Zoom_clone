import { useEffect, useRef } from "react";
import type { RefObject } from "react";
import type { Line, Shape, TextBox } from "../../room/Multicursor/types";
import { useToolSettings } from "../../../context/ToolBarLeftContext";
import { getNextZIndex } from "../../room/Multicursor/tools/zIndex";

export function useOfflineLines(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  camera: RefObject<{ x: number; y: number; scale: number }>,
  linesRef: RefObject<Line[]>,
  activeLine: RefObject<Line | null>,
  userIdRef: React.RefObject<string>,
  activeTool: string | null,
  strokeColor: string,
  shapesRef: RefObject<Shape[]>,
  textBoxesRef: React.RefObject<TextBox[]>,
  doRedraw: () => void,
) {
  const isDragging = useRef(false);
  const isPlacing = useRef(false);

  const toCanvas = (clientX: number, clientY: number) => ({
    x: (clientX - camera.current.x) / camera.current.scale,
    y: (clientY - camera.current.y) / camera.current.scale,
  });

  const {
    strokeWidth,
    opacity,
    strokeStyle,
    arrowType,
    arrowHead,
    selectedEle,
  } = useToolSettings();

  useEffect(() => {
    if (activeTool !== "mouse" || !selectedEle || selectedEle.type != "line")
      return;
    const selectedLine = linesRef.current.find((l) => l.id === selectedEle.id);
    if (!selectedLine) return;
    selectedLine.arrowHead = arrowHead;
    selectedLine.arrowType = arrowType;
    selectedLine.lineStyle = strokeStyle;
    selectedLine.opacity = opacity;

    doRedraw();
  }, [selectedEle, arrowHead, arrowType, strokeStyle, opacity]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const finalizeLine = () => {
      if (!activeLine.current) return;
      isPlacing.current = false;

      let line = activeLine.current;
      activeLine.current = null;

      if (line.points && line.points.length > 2) {
        const trimmedPoints = line.points.slice(0, -1);
        const lastPoint = trimmedPoints[trimmedPoints.length - 1];

        line = {
          ...line,
          points: trimmedPoints,
          x2: lastPoint.x,
          y2: lastPoint.y,
        };
      }

      const dx = line.x2 - line.x1;
      const dy = line.y2 - line.y1;
      if (!line.points && dx * dx + dy * dy < 25) {
        doRedraw();
        return;
      }

      linesRef.current = [...linesRef.current, line];
      doRedraw();
    };

    const onMouseDown = (e: MouseEvent) => {
      if (activeTool !== "line" && activeTool !== "arrow" && activeLine) {
        finalizeLine();
        return;
      }
      if (isPlacing.current && activeLine.current) {
        const { x, y } = toCanvas(e.clientX, e.clientY);

        if (arrowType === "elbow") {
          activeLine.current = { ...activeLine.current, x2: x, y2: y };
          finalizeLine();
          return;
        }

        // straight/curve: this click fixes the previewed point and opens a new segment
        const pts = activeLine.current.points ?? [
          { x: activeLine.current.x1, y: activeLine.current.y1 },
          { x: activeLine.current.x2, y: activeLine.current.y2 },
        ];
        pts[pts.length - 1] = { x, y };
        pts.push({ x, y }); // new trailing point, follows cursor until next click/Enter/Escape

        activeLine.current = {
          ...activeLine.current,
          points: pts,
          x2: x,
          y2: y,
        };
        doRedraw();
        return;
      }

      if (activeTool !== "line" && activeTool !== "arrow") return;
      const { x, y } = toCanvas(e.clientX, e.clientY);
      isDragging.current = true;
      activeLine.current = {
        id: crypto.randomUUID(),
        type: "line",
        lineType: activeTool === "arrow" ? "arrow" : "straight",
        x1: x,
        y1: y,
        x2: x,
        y2: y,
        color: strokeColor,
        strokeWidth,
        lineStyle: strokeStyle,
        arrowType,
        arrowHead,
        opacity,
        zIndex: getNextZIndex(shapesRef, linesRef, textBoxesRef),
        userId: userIdRef.current,
      };
      doRedraw();
    };

    const onMouseMove = (e: MouseEvent) => {
      if ((!isDragging.current && !isPlacing.current) || !activeLine.current)
        return;
      const { x, y } = toCanvas(e.clientX, e.clientY);
      const line = activeLine.current;

      const points = line.points
        ? line.points.map((p, i) =>
            i === line.points!.length - 1 ? { x, y } : p,
          )
        : undefined;

      activeLine.current = {
        ...line,
        x2: x,
        y2: y,
        ...(points ? { points } : {}),
      };
      requestAnimationFrame(doRedraw);
    };

    const onMouseUp = () => {
      if (!isDragging.current || !activeLine.current) return;
      isDragging.current = false;

      const line = activeLine.current;
      const dx = line.x2 - line.x1;
      const dy = line.y2 - line.y1;

      if (dx * dx + dy * dy < 25) {
        isPlacing.current = true;
        return;
      }

      activeLine.current = null;
      linesRef.current = [...linesRef.current, line];
      doRedraw();
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (!isPlacing.current || !activeLine.current) return;
      if (e.key === "Escape") {
        isPlacing.current = false;
        activeLine.current = null;
        doRedraw();
      } else if (e.key === "Enter") {
        finalizeLine();
      }
    };

      //touch evetns
        const handleTouchStart = (e: TouchEvent) => {
          if (e.touches.length !== 1) return;
          e.preventDefault();
          onMouseDown(e.touches[0] as unknown as MouseEvent);
        };
        const handleTouchMove = (e: TouchEvent) => {
          if (e.touches.length !== 1) return;
          e.preventDefault();
          if (isPlacing.current && activeLine.current) {
            finalizeLine();
            isPlacing.current = false;
            return;
          }
          onMouseMove(e.touches[0] as unknown as MouseEvent);
        };
        const handleTouchEnd = () => {
          if (!isDragging.current || !activeLine.current) return;
          isDragging.current = false;
    
          const line = activeLine.current;
          const dx = line.x2 - line.x1;
          const dy = line.y2 - line.y1;
    
          if (dx * dx + dy * dy < 25) {
            // too small a drag on touch — discard instead of entering placing mode
            activeLine.current = null;
            doRedraw();
            return;
          }
    
          activeLine.current = null;
          linesRef.current = [...linesRef.current, line];
          doRedraw();
        };

    canvas.addEventListener("mousedown", onMouseDown);
    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseup", onMouseUp);
    window.addEventListener("keydown", onKeyDown);
       //touch events
    canvas.addEventListener("touchstart", handleTouchStart);
    canvas.addEventListener("touchmove", handleTouchMove);
    canvas.addEventListener("touchend", handleTouchEnd);
    canvas.addEventListener("touchcancel", handleTouchEnd);

    return () => {
      canvas.removeEventListener("mousedown", onMouseDown);
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("keydown", onKeyDown);
           //touch events
      canvas.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("touchend", handleTouchEnd);
      canvas.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, [
    activeTool,
    strokeColor,
    doRedraw,
    strokeWidth,
    strokeStyle,
    arrowType,
    arrowHead,
  ]);

  const deleteLine = (id: string) => {
    linesRef.current = linesRef.current.filter((l) => l.id !== id);
    doRedraw();
  };

  return { deleteLine };
}