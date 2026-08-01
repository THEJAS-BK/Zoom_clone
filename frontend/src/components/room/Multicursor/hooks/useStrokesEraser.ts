import { useEffect, useRef } from "react";
import type { Stroke, Point } from "../types.ts";
import { getCanvasPoint, isPointNearStroke } from "../canvas.ts";
import { socket } from "../../../../services/socket.ts";
import { useHistory } from "../../../../context/LocalHistoryContext.tsx";
export function useStrokeEraser(
  roomId: string,
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  camera: React.RefObject<any>,
  strokes: React.RefObject<Stroke[]>,
  activeTool: string | null,
  doRedraw: () => void,
) {
  const { pushUndo } = useHistory();

  const eraseAtPoint = (point: Point) => {
    const removed = strokes.current.filter((stroke) =>
      isPointNearStroke(point, stroke),
    );
    if (removed.length === 0) return;

    strokes.current = strokes.current.filter(
      (stroke) => !isPointNearStroke(point, stroke),
    );

    for (const stroke of removed) {
      pushUndo({ type: "stroke-delete", stroke });
    }

    socket.emit("stroke-delete", { point, roomId });
    doRedraw();
  };
  const isEraserSelected = useRef<boolean>(false);
  const lastPoint = useRef<Point | null>(null);

  useEffect(() => {
    if (activeTool !== "eraser") {
      isEraserSelected.current = false;
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const mouseDown = () => {
      if (activeTool === "eraser") {
        isEraserSelected.current = true;
        lastPoint.current = null;
      }
    };

    const mouseMove = (e: MouseEvent) => {
      if (!isEraserSelected.current) return;
      const point = getCanvasPoint(e, canvas, camera);

      if (lastPoint.current) {
        const steps = Math.max(
          1,
          Math.ceil(
            Math.hypot(
              point.x - lastPoint.current.x,
              point.y - lastPoint.current.y,
            ) / 5,
          ),
        );
        for (let i = 1; i <= steps; i++) {
          const t = i / steps;
          eraseAtPoint({
            x: lastPoint.current.x + (point.x - lastPoint.current.x) * t,
            y: lastPoint.current.y + (point.y - lastPoint.current.y) * t,
          });
        }
      } else {
        eraseAtPoint(point);
      }

      lastPoint.current = point;
    };
    const mouseUp = () => {
      if (!isEraserSelected.current) return;
      isEraserSelected.current = false;
      lastPoint.current = null;
    };

    //touch events
    const handleTouchMove=(e:TouchEvent)=>{
      if(e.touches.length!==1) return;
      e.preventDefault()
      mouseMove(e.touches[0] as unknown as MouseEvent);
    }

    canvas.addEventListener("mousedown", mouseDown);
    canvas.addEventListener("mousemove", mouseMove);
    window.addEventListener("mouseup", mouseUp);
    //touch events
    canvas.addEventListener("touchstart", mouseDown);
    canvas.addEventListener("touchmove", handleTouchMove);
    canvas.addEventListener("touchend", mouseUp);
    canvas.addEventListener("touchcancel", mouseUp);
    return () => {
      socket.off("stroke-delete");
      canvas.removeEventListener("mousedown", mouseDown);
      canvas.removeEventListener("mousemove", mouseMove);
      window.removeEventListener("mouseup", mouseUp);
      //touch event
      canvas.removeEventListener("touchstart", mouseDown);
      canvas.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("touchend", mouseUp);
      canvas.removeEventListener("touchcancel", mouseUp);
    };
  }, [activeTool]);
}
