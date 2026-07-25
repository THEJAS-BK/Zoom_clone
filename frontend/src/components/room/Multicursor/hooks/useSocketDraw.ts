import React, { useEffect, useRef } from "react";

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
  setCursorPos: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>,
  selectedImgIdx: React.RefObject<number>,
  activeTool: string | null,
  strokeColor: string,
  doRedraw: () => void,
) {
  const { strokeWidth,opacity,selectedEle } = useToolSettings();

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
        opacity
      });
      doRedraw();
    };

    const draw = (e: MouseEvent) => {
      setCursorPos({
        x: e.clientX,
        y: e.clientY,
      });
      if (!isDrawing.current||selectedEle) return;
    
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
          opacity
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

    canvas.addEventListener("mousedown", startDrawing);
    canvas.addEventListener("mousemove", draw);
    window.addEventListener("mouseup", stopDrawing);
    return () => {
      socket.off("stroke-start");
      socket.off("stroke-points");
      socket.off("stroke-end");
      socket.off("stroke-delete");
      canvas.removeEventListener("mousedown", startDrawing);
      canvas.removeEventListener("mousemove", draw);
      window.removeEventListener("mouseup", stopDrawing);
    };
  }, [activeTool, doRedraw, strokeWidth,opacity,strokeColor]);
}
