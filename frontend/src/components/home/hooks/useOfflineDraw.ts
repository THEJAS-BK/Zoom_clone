import React, { useEffect } from "react";
import type {
  ActiveStroke,
  Point,
  Stroke,
} from "../../room/Multicursor/types.ts";

import {
  getCanvasPoint,
  isPointNearStroke,
} from "../../room/Multicursor/canvas.ts";
import { useToolSettings } from "../../../context/ToolBarLeftContext.tsx";

export function useOfflineDraw(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  camera: React.RefObject<any>,
  activeStrokes: React.RefObject<Record<string, ActiveStroke>>,
  currentStroke: React.RefObject<Point[]>,
  strokes: React.RefObject<Stroke[]>,
  userIdRef: React.RefObject<string>,
  isDrawing: React.RefObject<boolean>,
  setCursorPos: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>,
  selectedImgIdx: React.RefObject<number>,
  activeTool: string | null,
  strokeColor: string,
  doRedraw: () => void,
) {
  const { strokeWidth, opacity } = useToolSettings();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const startDrawing = (e: MouseEvent) => {
      if (selectedImgIdx.current !== -1) return;

      if (activeTool === "pen") {
        isDrawing.current = true;
      }

      if (activeTool === "square") {
        isDrawing.current = false;
        return;
      }

      const { x, y } = getCanvasPoint(e, canvas, camera);
      currentStroke.current = [{ x, y }];

      activeStrokes.current[userIdRef.current] = {
        color: strokeColor,
        strokeWidth,
        opacity,
        points: [{ x, y }],
      };

      doRedraw();
    };

    const draw = (e: MouseEvent) => {
      setCursorPos({
        x: e.clientX,
        y: e.clientY,
      });

      if (!isDrawing.current) return;

      const { x, y } = getCanvasPoint(e, canvas, camera);
      currentStroke.current.push({ x, y });

      if (!activeStrokes.current[userIdRef.current]) {
        activeStrokes.current[userIdRef.current] = {
          color: strokeColor,
          strokeWidth,
          opacity,
          points: [],
        };
      }

      activeStrokes.current[userIdRef.current].points.push({ x, y });
      doRedraw();
    };

    const stopDrawing = () => {
      if (currentStroke.current.length > 0) {
        const completedStroke: Stroke = {
          points: [...currentStroke.current],
          userId: userIdRef.current,
          color: strokeColor,
          opacity,
          strokeWidth,
        };

        strokes.current.push(completedStroke);
      }

      delete activeStrokes.current[userIdRef.current];
      currentStroke.current = [];
      isDrawing.current = false;

      doRedraw();
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      e.preventDefault();
      startDrawing(e.touches[0] as unknown as MouseEvent);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      e.preventDefault();
      draw(e.touches[0] as unknown as MouseEvent);
    };
    const handleTouchEnd = () => {
      stopDrawing();
    };

    canvas.addEventListener("mousedown", startDrawing);
    canvas.addEventListener("mousemove", draw);
    window.addEventListener("mouseup", stopDrawing);
    //touch
    canvas.addEventListener("touchstart", handleTouchStart);
    canvas.addEventListener("touchmove", handleTouchMove);
    canvas.addEventListener("touchend", handleTouchEnd);
    canvas.addEventListener("touchcancel", handleTouchEnd);

    return () => {
      canvas.removeEventListener("mousedown", startDrawing);
      canvas.removeEventListener("mousemove", draw);
      window.removeEventListener("mouseup", stopDrawing);
      //touch
      canvas.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("touchend", handleTouchEnd);
      canvas.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, [
    activeTool,
    doRedraw,
    strokeWidth,
    opacity,
    strokeColor,
    canvasRef,
    camera,
    activeStrokes,
    currentStroke,
    strokes,
    userIdRef,
    isDrawing,
    setCursorPos,
    selectedImgIdx,
  ]);

  const deleteStroke = (point: Point) => {
    strokes.current = strokes.current.filter(
      (stroke) => !isPointNearStroke(point, stroke),
    );
    doRedraw();
  };

  return { deleteStroke };
}
