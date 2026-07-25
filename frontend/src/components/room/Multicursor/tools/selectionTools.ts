import type { RefObject } from "react";
import type { Line, Shape, TextBox, ToolSetters } from "../types";
import { socket } from "../../../../services/socket";
import { measureTextBox } from "../canvas";
const handleElementDelete = (
  e: KeyboardEvent,
  selectedId: React.RefObject<string | null>,
  shapesRef: RefObject<Shape[]>,
  linesRef: RefObject<Line[]>,
  textBoxesRef: React.RefObject<TextBox[]>,
  setSelectedEle: React.Dispatch<React.SetStateAction<Shape | Line | TextBox | null>>,
  doRedrawRef:()=>void,
  roomId: string,
  activeTool:string|null
) => {

  if (e.key !== "Delete" && e.key !== "Backspace") return;
  if (activeTool !== "mouse") return;

  const target = e.target as HTMLElement;
  if (target?.tagName === "TEXTAREA" || target?.tagName === "INPUT") return;

  const id = selectedId.current;
  if (!id) return;

  if (shapesRef.current.some((s) => s.id === id)) {
    shapesRef.current = shapesRef.current.filter((s) => s.id !== id);
  } else if (linesRef.current.some((l) => l.id === id)) {
    linesRef.current = linesRef.current.filter((l) => l.id !== id);
  } else if (textBoxesRef.current.some((t) => t.id === id)) {
    textBoxesRef.current = textBoxesRef.current.filter((t) => t.id !== id);
  } else {
    return;
  }

  socket.emit("element-delete", { roomId, id });
  selectedId.current = null;
  setSelectedEle(null);
  doRedrawRef();
};

interface InteractionRefs {
  isDragging: React.RefObject<boolean>;
  isResizing: React.RefObject<boolean>;
  isRotating: React.RefObject<boolean>;
  dragType: React.RefObject<"shape" | "line" | "textbox" | null>;
  dragOffset: React.RefObject<{ x: number; y: number }>;
  lineDragOffset: React.RefObject<{
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  }>;
  resizeCorner: React.RefObject<string | null>;
  resizeOrigin: React.RefObject<{ x: number; y: number } | null>;
  lineEndpoint: React.RefObject<"p1" | "p2" | "mid" | null>;
}

// ---- 1. resize-origin math, extracted as a pure function ----
function computeResizeOrigin(shape: Shape, corner: string) {
  const left = Math.min(shape.x, shape.x + shape.width);
  const top = Math.min(shape.y, shape.y + shape.height);
  const right = Math.max(shape.x, shape.x + shape.width);
  const bottom = Math.max(shape.y, shape.y + shape.height);
  const w = right - left;
  const h = bottom - top;
  const centerX = (left + right) / 2;
  const centerY = (top + bottom) / 2;
  const rotation = shape.rotation || 0;

  const localOx = corner.includes("l") ? w / 2 : -w / 2;
  const localOy = corner.includes("t") ? h / 2 : -h / 2;

  const worldOx = localOx * Math.cos(rotation) - localOy * Math.sin(rotation);
  const worldOy = localOx * Math.sin(rotation) + localOy * Math.cos(rotation);

  return { x: centerX + worldOx, y: centerY + worldOy };
}

// ---- 2. try to grab a handle on the currently selected shape ----
// returns true if the click was consumed (caller should return early)
function tryStartShapeHandleInteraction(
  shape: Shape,
  x: number,
  y: number,
  scale: number,
  refs: InteractionRefs,
  hitTestRotationHandle: typeof import("./hitTests").hitTestRotationHandle,
  hitTestCorner: typeof import("./hitTests").hitTestCorner,
): boolean {
  if (hitTestRotationHandle(shape, x, y, scale)) {
    refs.isRotating.current = true;
    return true;
  }

  const corner = hitTestCorner(shape, x, y, scale);
  if (corner) {
    refs.isResizing.current = true;
    refs.resizeCorner.current = corner;
    refs.resizeOrigin.current = computeResizeOrigin(shape, corner);
    return true;
  }

  return false;
}

// ---- 3. try to grab an endpoint/midpoint on the currently selected line ----
function tryStartLineHandleInteraction(
  line: Line,
  x: number,
  y: number,
  scale: number,
  refs: InteractionRefs,
): boolean {
  const tolerance = 8 / scale;
  const distP1 = Math.hypot(x - line.x1, y - line.y1);
  const distP2 = Math.hypot(x - line.x2, y - line.y2);

  if (distP1 <= tolerance) {
    refs.lineEndpoint.current = "p1";
    refs.isResizing.current = true;
    return true;
  }
  if (distP2 <= tolerance) {
    refs.lineEndpoint.current = "p2";
    refs.isResizing.current = true;
    return true;
  }

  const midX =
    line.cpx !== undefined
      ? 0.25 * line.x1 + 0.5 * line.cpx + 0.25 * line.x2
      : (line.x1 + line.x2) / 2;
  const midY =
    line.cpy !== undefined
      ? 0.25 * line.y1 + 0.5 * line.cpy + 0.25 * line.y2
      : (line.y1 + line.y2) / 2;

  if (Math.hypot(x - midX, y - midY) <= tolerance) {
    refs.lineEndpoint.current = "mid";
    refs.isResizing.current = true;
    if (line.cpx === undefined) {
      line.cpx = midX;
      line.cpy = midY;
    }
    return true;
  }

  return false;
}

// ---- 4. hit-test all element collections for a NEW selection ----
interface HitResult {
  hitShape?: Shape;
  hitLine?: Line;
  hitText?: TextBox;
}

function findElementAt(
  x: number,
  y: number,
  ctx: CanvasRenderingContext2D,
  scale: number,
  shapes: Shape[],
  lines: Line[],
  textBoxes: TextBox[],
  hitTestShape: typeof import("./hitTests").hitTestShape,
  hitTestLine: typeof import("./hitTests").hitTestLine,
  hitTestTextBox: typeof import("./hitTests").hitTestTextBox,
): HitResult {
  // reverse so topmost (last drawn) wins
  const hitShape = [...shapes].reverse().find((s) => hitTestShape(s, x, y));
  const hitLine = [...lines].reverse().find((l) => hitTestLine(l, x, y, scale));
  const hitText = [...textBoxes]
    .reverse()
    .find((t) => hitTestTextBox(t, x, y, ctx));
  return { hitShape, hitLine, hitText };
}

function syncToolSettingsToShape(shape: Shape, s: ToolSetters) {
  s.setFillColor(shape.fillColor);
  s.setStrokeWidth(shape.strokeWidth);
  s.setStrokeStyle(shape.strokeStyle);
  s.setEdgeStyle(shape.edgeStyle);
  s.setOpacity(shape.opacity ?? 100);
}

function syncToolSettingsToText(text: TextBox, s: ToolSetters) {
  s.setFontFamily(text.fontFamily);
  s.setFontSize(text.fontSize);
  s.setTextAlign(text.textAlign);
  s.setOpacity(text.opacity ?? 100);
}

function syncToolSettingsToLine(line: Line, s: ToolSetters) {
  s.setStrokeStyle(line.lineStyle);
  s.setStrokeWidth(line.strokeWidth);
  s.setOpacity(line.opacity ?? 100);
  if (line.lineType === "arrow") {
    s.setArrowType(line.arrowType);
    s.setArrowHead(line.arrowHead);
  }
}

export {
  computeResizeOrigin,
  tryStartShapeHandleInteraction,
  tryStartLineHandleInteraction,
  findElementAt,
  syncToolSettingsToShape,
  syncToolSettingsToText,
  syncToolSettingsToLine,
  handleElementDelete,
};
export type { InteractionRefs, HitResult, ToolSetters };



//mouse move

// ---- shared: dedupe the repeated emit pattern ----
function emitElementUpdate(roomId: string, id: string, changes: Record<string, unknown>) {
  socket.emit("element-update", { roomId, id, changes });
}

// ---- rotation math ----
function computeTextBoxRotation(tb: TextBox, x: number, y: number): number {
  const { width, height } = measureTextBox(tb.text, tb.fontSize, tb.fontFamily);
  const centerX = tb.x + width / 2;
  const centerY = tb.y + height / 2;
  return Math.atan2(y - centerY, x - centerX) + Math.PI / 2;
}

function computeShapeRotation(shape: Shape, x: number, y: number): number {
  const left = Math.min(shape.x, shape.x + shape.width);
  const top = Math.min(shape.y, shape.y + shape.height);
  const right = Math.max(shape.x, shape.x + shape.width);
  const bottom = Math.max(shape.y, shape.y + shape.height);
  const centerX = (left + right) / 2;
  const centerY = (top + bottom) / 2;
  return Math.atan2(y - centerY, x - centerX) + Math.PI / 2;
}

// ---- line endpoint / midpoint drag math ----
type LineEndpoint = "p1" | "p2" | "mid";

function computeLineEndpointChanges(
  line: Line,
  endpoint: LineEndpoint,
  x: number,
  y: number,
): Partial<Line> {
  if (endpoint === "p1") return { x1: x, y1: y };
  if (endpoint === "p2") return { x2: x, y2: y };
  // mid
  return {
    cpx: 2 * x - 0.5 * (line.x1 + line.x2),
    cpy: 2 * y - 0.5 * (line.y1 + line.y2),
  };
}

// ---- shape resize math (rotation-aware) ----
function computeShapeResize(
  shape: Shape,
  corner: string,
  anchor: { x: number; y: number },
  x: number,
  y: number,
): { x: number; y: number; width: number; height: number } {
  const rotation = shape.rotation || 0;
  const minSize = 10;

  const dx = x - anchor.x;
  const dy = y - anchor.y;
  const localDx = dx * Math.cos(-rotation) - dy * Math.sin(-rotation);
  const localDy = dx * Math.sin(-rotation) + dy * Math.cos(-rotation);

  const signX = corner.includes("r") ? 1 : -1;
  const signY = corner.includes("b") ? 1 : -1;

  const newWidth = Math.max(minSize, signX * localDx);
  const newHeight = Math.max(minSize, signY * localDy);

  const anchorLocalX = -signX * (newWidth / 2);
  const anchorLocalY = -signY * (newHeight / 2);

  const offsetX = anchorLocalX * Math.cos(rotation) - anchorLocalY * Math.sin(rotation);
  const offsetY = anchorLocalX * Math.sin(rotation) + anchorLocalY * Math.cos(rotation);

  const newCenterX = anchor.x - offsetX;
  const newCenterY = anchor.y - offsetY;

  return {
    x: newCenterX - newWidth / 2,
    y: newCenterY - newHeight / 2,
    width: newWidth,
    height: newHeight,
  };
}

// ---- drag/move math ----
function computeDragPosition(
  x: number,
  y: number,
  offset: { x: number; y: number },
): { x: number; y: number } {
  return { x: x - offset.x, y: y - offset.y };
}

function computeLineDragPosition(
  x: number,
  y: number,
  offset: { x1: number; y1: number; x2: number; y2: number },
): { x1: number; y1: number; x2: number; y2: number } {
  return {
    x1: x - offset.x1,
    y1: y - offset.y1,
    x2: x - offset.x2,
    y2: y - offset.y2,
  };
}

export {
  emitElementUpdate,
  computeTextBoxRotation,
  computeShapeRotation,
  computeLineEndpointChanges,
  computeShapeResize,
  computeDragPosition,
  computeLineDragPosition,
};
export type { LineEndpoint };