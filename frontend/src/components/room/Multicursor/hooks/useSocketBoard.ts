import React, { useEffect } from "react";

import { socket } from "../../../../services/socket";
import type { Stroke } from "../types";
import { useToolSettings } from "../../../../context/ToolBarLeftContext";

export function useSocketBoard(
  roomId: string,
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  strokes: React.RefObject<Stroke[]>,
  doRedraw: () => void,
) {
  const { setBoardColor } = useToolSettings();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    //setup board start
    socket.emit("board-state", roomId);
    socket.on("board-state", (savedStrokes: Stroke[]) => {
      strokes.current = savedStrokes;
      doRedraw();
    });

    //board background color
    socket.emit("board-color-request", roomId);
    socket.on("board-color", (color) => {
      setBoardColor(color || "#27272A");
    });

    return () => {
      socket.off("board-state");
      socket.off("board-color");
    };
  }, [doRedraw]);
}