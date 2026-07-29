import { useEffect, useRef } from "react";
import type { Stroke, Point } from "../../room/Multicursor/types.ts";
import { getCanvasPoint, isPointNearStroke } from "../../room/Multicursor/canvas.ts";

export function useOfflineStrokeEraser(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  camera: React.RefObject<any>,
  strokes: React.RefObject<Stroke[]>,
  activeTool: string | null,
  doRedraw: () => void,
) {
  const eraseAtPoint = (point: Point) => {
    const before = strokes.current.length;
    strokes.current = strokes.current.filter(
      (stroke) => !isPointNearStroke(point, stroke),
    );

    if (strokes.current.length !== before) {
      doRedraw();
    }
  };

  const isEraserSelected = useRef(false);
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

    canvas.addEventListener("mousedown", mouseDown);
    canvas.addEventListener("mousemove", mouseMove);
    window.addEventListener("mouseup", mouseUp);

    return () => {
      canvas.removeEventListener("mousedown", mouseDown);
      canvas.removeEventListener("mousemove", mouseMove);
      window.removeEventListener("mouseup", mouseUp);
    };
  }, [activeTool]);
}