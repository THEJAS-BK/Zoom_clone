import React, { useEffect } from "react";

import { socket } from "../../../../services/socket";
import type { ActiveStroke, Point, Stroke } from "../types";

import { getCanvasPoint, isPointNearStroke } from "../canvas";
import { useToolSettings } from "../../../../context/ToolBarLeftContext";

export function useSocketDraw(
  roomId: string,
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  camera: React.RefObject<any>,
  activeStrokes: React.RefObject<Record<string, ActiveStroke>>,
  currentStroke: React.RefObject<Point[]>,
  strokes: React.RefObject<Stroke[]>,
  userIdRef: React.RefObject<string>,
  isDrawing: React.RefObject<boolean>,
  selectedImgIdx: React.RefObject<number>,
  activeTool: string | null,
  strokeColor: string,
  doRedraw: () => void,
) {
  const { strokeWidth, opacity, selectedEle } = useToolSettings();

  useEffect(() => {
    //handle drawing
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const startDrawing = (e: MouseEvent) => {
      if (selectedImgIdx.current !== -1) return;
      if (activeTool == "pen") {
        isDrawing.current = true;
      }
      if (activeTool == "square") {
        isDrawing.current = false;
        return;
      }

      const { x, y } = getCanvasPoint(e, canvas, camera);
      currentStroke.current = [{ x, y }];

      socket.emit("stroke-start", {
        userId: userIdRef.current,
        roomId,
        strokeColor,
        strokeWidth,
        opacity,
      });
      doRedraw();
    };

    const draw = (e: MouseEvent) => { 
      if (!isDrawing.current || selectedEle) return;
      const { x, y } = getCanvasPoint(e, canvas, camera);
      currentStroke.current.push({ x, y });
      socket.emit("stroke-points", {
        userId: userIdRef.current,
        roomId,
        point: { x, y },
      });
      doRedraw();
    };

    //stop drawing
    const stopDrawing = () => {
      if (currentStroke.current.length > 0) {
        const completedStrokes: Stroke = {
          points: [...currentStroke.current],
          userId: userIdRef.current,
          color: strokeColor,
          opacity,
          strokeWidth,
        };

        strokes.current.push(completedStrokes);
        socket.emit("stroke-end", {
          userId: userIdRef.current,
          roomId,
          strokes: completedStrokes,
          strokeWidth,
          opacity,
        });
      }
      currentStroke.current = [];
      isDrawing.current = false;

      doRedraw();
    };

    //received data from the backend
    socket.on(
      "stroke-start",
      ({ userId, strokeColor, strokeWidth, opacity }) => {
        activeStrokes.current[userId] = {
          color: strokeColor,
          strokeWidth,
          opacity,
          points: [],
        };
      },
    );

    socket.on(
      "stroke-points",
      ({ userId, point, color: incomingColor, strokeWidth, opacity }) => {
        if (!activeStrokes.current[userId]) {
          activeStrokes.current[userId] = {
            color: incomingColor,
            strokeWidth,
            opacity,
            points: [],
          };
        }
        activeStrokes.current[userId].points.push(point);

        doRedraw();
      },
    );

    socket.on("stroke-end", ({ userId, strokes: strokeData }) => {
      let activeStroke = activeStrokes.current[userId];
      if (!activeStroke) return;
      strokes.current.push({
        userId,
        color: activeStroke.color,
        strokeWidth: strokeData.strokeWidth,
        opacity: strokeData.opacity,
        points: activeStroke.points,
      });

      delete activeStrokes.current[userId];
      doRedraw();
    });
    socket.on("stroke-delete", (point: Point) => {
      strokes.current = strokes.current.filter(
        (stroke) => !isPointNearStroke(point, stroke),
      );
      doRedraw();
    });

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
      socket.off("stroke-start");
      socket.off("stroke-points");
      socket.off("stroke-end");
      socket.off("stroke-delete");
      canvas.removeEventListener("mousedown", startDrawing);
      canvas.removeEventListener("mousemove", draw);
      window.removeEventListener("mouseup", stopDrawing);
      //touch
      canvas.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("touchend", handleTouchEnd);
      canvas.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, [activeTool, doRedraw, strokeWidth, opacity, strokeColor]);
}
