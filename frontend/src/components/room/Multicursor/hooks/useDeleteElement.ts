import React, { useEffect, useRef, type RefObject } from "react";
import type { Line, Shape, TextBox } from "../types";
import { hitTestLine, hitTestShape, hitTestTextBox } from "../tools/hitTests";
import { socket } from "../../../../services/socket";
import { useHistory } from "../../../../context/LocalHistoryContext";

export function useDeleteElement(
  roomId: string,
  canvasRef: RefObject<HTMLCanvasElement | null>,
  camera: RefObject<{ x: number; y: number; scale: number }>,
  shapesRef: RefObject<Shape[]>,
  activeTool: string | null,
  linesRef: React.RefObject<Line[]>,
  textBoxesRef: React.RefObject<TextBox[]>,
  doRedraw: () => void,
) {

  const {pushUndo}=useHistory();

  const toCanvas = (clientX: number, clientY: number) => ({
    x: (clientX - camera.current.x) / camera.current.scale,
    y: (clientY - camera.current.y) / camera.current.scale,
  });
  const isShapeEraser = useRef<boolean>(false);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const onMouseDown = () => {
      if (activeTool !== "eraser") return;
      isShapeEraser.current = true;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isShapeEraser.current || activeTool !== "eraser") return;
      const { x, y } = toCanvas(e.clientX, e.clientY);

      // reverse so topmost (last drawn) wins
      const hitShape = [...shapesRef.current]
        .reverse()
        .find((s) => hitTestShape(s, x, y));
      const hitLine = [...linesRef.current]
        .reverse()
        .find((l) => hitTestLine(l, x, y, camera.current.scale));
      const hitText = [...(textBoxesRef?.current ?? [])]
        .reverse()
        .find((t) => hitTestTextBox(t, x, y, ctx));

      let id = "";

      if (hitShape) {
        id = hitShape.id;
        shapesRef.current = shapesRef.current.filter(
          (s) => s.id !== hitShape.id,
        );
        pushUndo({ type: "shape-delete", shape: hitShape });
      }
      if (hitLine) {
        id = hitLine.id;
        linesRef.current = linesRef.current.filter((l) => l.id !== hitLine.id);
        pushUndo({ type: "line-delete", line: hitLine });
      }
      if (hitText) {
        id = hitText.id;
        textBoxesRef.current = textBoxesRef.current.filter(
          (t) => t.id !== hitText.id,
        );
        pushUndo({ type: "textbox-delete", textBox: hitText });
      }
      doRedraw();
      socket.emit("element-delete", { roomId, id });
    };

    const onMouseUp = () => {
      isShapeEraser.current = false;
    };

    //touch events
    const handleTouchMove=(e:TouchEvent)=>{
      if(e.touches.length!==1) return;
      e.preventDefault();
      onMouseMove(e.touches[0] as unknown as MouseEvent);
    }

    canvas.addEventListener("mousedown", onMouseDown);
    canvas.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    //touch events
    canvas.addEventListener("touchstart", onMouseDown);
    canvas.addEventListener("touchmove", handleTouchMove);
    canvas.addEventListener("touchend", onMouseUp);
    canvas.addEventListener("touchcancel", onMouseUp);
    return () => {
      canvas.removeEventListener("mousedown", onMouseDown);
      canvas.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      //touch events
      canvas.removeEventListener("touchstart", onMouseDown);
      canvas.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("touchend", onMouseUp);
      canvas.removeEventListener("touchcancel", onMouseUp);
    };
  }, [activeTool,doRedraw]);
}
