import { useEffect, useRef } from "react";
import { socket } from "../../../../services/socket";
import type { RefObject } from "react";
import type { Line, CanvasElement, Shape, TextBox } from "../types";
import { useToolSettings } from "../../../../context/ToolBarLeftContext";
import { getNextZIndex } from "../tools/zIndex";
export function useLines(
  roomId: string,
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
    socket.emit("element-update", {
      roomId,
      id: selectedLine.id,
      changes: {
        arrowHead,
        arrowType,
        strokeWidth,
        lineStyle: strokeStyle,
        opacity,
      },
    });

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
        line = { ...line, points: line.points.slice(0, -1) };
      }

      const dx = line.x2 - line.x1;
      const dy = line.y2 - line.y1;
      if (!line.points && dx * dx + dy * dy < 25) {
        socket.emit("element-delete", { roomId, id: line.id });
        doRedraw();
        return;
      }

      socket.emit("element-update", {
        roomId,
        id: line.id,
        changes: {
          points: line.points,
          x1: line.x1,
          x2: line.x2,
          y1: line.y1,
          y2: line.y2,
        },
      });
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
        socket.emit("element-update", {
          roomId,
          id: activeLine.current.id,
          changes: { points: pts, x2: x, y2: y },
        });
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
      const line = activeLine.current;
      socket.emit("element-add", { roomId, element: line });
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
      socket.emit("element-update", {
        roomId,
        id: line.id,
        changes: {
          x1: line.x1,
          x2: x,
          y1: line.y1,
          y2: y,
          ...(points ? { points } : {}),
        },
      });
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
        socket.emit("element-delete", { roomId, id: activeLine.current.id });
        isPlacing.current = false;
        activeLine.current = null;
        doRedraw();
      } else if (e.key === "Enter") {
        finalizeLine();
      }
    };

    canvas.addEventListener("mousedown", onMouseDown);
    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseup", onMouseUp);
    window.addEventListener("keydown", onKeyDown);

    return () => {
      canvas.removeEventListener("mousedown", onMouseDown);
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("keydown", onKeyDown);
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

  // ---- socket listeners ----
  useEffect(() => {
    const onElementAdd = (el: CanvasElement) => {
      if (el.type !== "line") return;
      linesRef.current = [...linesRef.current, el];
      doRedraw();
    };

    const onElementUpdate = ({
      id,
      changes,
    }: {
      id: string;
      changes: Partial<Line>;
    }) => {
      linesRef.current = linesRef.current.map((l) =>
        l.id === id ? { ...l, ...changes } : l,
      );
      doRedraw();
    };

    const onElementDelete = (id: string) => {
      linesRef.current = linesRef.current.filter((l) => l.id !== id);
      doRedraw();
    };

    const onElementState = (elements: CanvasElement[]) => {
      linesRef.current = elements.filter((e): e is Line => e.type === "line");
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
  }, [doRedraw]);

  const deleteLine = (id: string) => {
    linesRef.current = linesRef.current.filter((l) => l.id !== id);
    socket.emit("element-delete", { roomId, id });
    doRedraw();
  };

  return { deleteLine };
}
