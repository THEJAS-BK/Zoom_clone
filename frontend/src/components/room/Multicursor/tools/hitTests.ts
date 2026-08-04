// ---- hit tests ----

import { measureTextBox, resolveFontFamily } from "../canvas";
import type { Shape, TextBox,Line,BoardImage } from "../types";

function hitTestShape(shape: Shape, x: number, y: number): boolean {
  const left = Math.min(shape.x, shape.x + shape.width);
  const top = Math.min(shape.y, shape.y + shape.height);
  const right = Math.max(shape.x, shape.x + shape.width);
  const bottom = Math.max(shape.y, shape.y + shape.height);

  const cx = (left + right) / 2;
  const cy = (top + bottom) / 2;
  const rotation = shape.rotation || 0;

  const dx = x - cx;
  const dy = y - cy;
  const localX = dx * Math.cos(-rotation) - dy * Math.sin(-rotation) + cx;
  const localY = dx * Math.sin(-rotation) + dy * Math.cos(-rotation) + cy;

  switch (shape.shapeType) {
    case "square":
      return localX >= left && localX <= right && localY >= top && localY <= bottom;
    case "circle": {
      const rx = (right - left) / 2;
      const ry = (bottom - top) / 2;
      if (rx === 0 || ry === 0) return false;
      return (localX - cx) ** 2 / rx ** 2 + (localY - cy) ** 2 / ry ** 2 <= 1;
    }
    case "diamond": {
      const rx = (right - left) / 2;
      const ry = (bottom - top) / 2;
      if (rx === 0 || ry === 0) return false;
      return Math.abs(localX - cx) / rx + Math.abs(localY - cy) / ry <= 1;
    }
  }
}

function hitTestLine(line: Line, x: number, y: number, scale: number): boolean {
  const tolerance = 6 / scale;

  const distToSegment = (px: number, py: number, ax: number, ay: number, bx: number, by: number) => {
    const dx = bx - ax;
    const dy = by - ay;
    const lenSq = dx * dx + dy * dy;
    if (lenSq === 0) return Math.hypot(px - ax, py - ay);
    const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / lenSq));
    const cx = ax + t * dx;
    const cy = ay + t * dy;
    return Math.hypot(px - cx, py - cy);
  };

  if (line.arrowType === "elbow") {
    const dx = line.x2 - line.x1;
    const dy = line.y2 - line.y1;
    if (dx === 0 && dy === 0) return false;
    const r = Math.min(20, Math.abs(dx) / 2 || 20, Math.abs(dy) / 2 || 20);
    const sx = dx >= 0 ? 1 : -1;
    const sy = dy >= 0 ? 1 : -1;

    let segments: [number, number, number, number][];
    if (Math.abs(dx) >= Math.abs(dy)) {
      const midX = (line.x1 + line.x2) / 2;
      segments = [
        [line.x1, line.y1, midX - sx * r, line.y1],
        [midX, line.y1 + sy * r, midX, line.y2 - sy * r],
        [midX + sx * r, line.y2, line.x2, line.y2],
      ];
    } else {
      const midY = (line.y1 + line.y2) / 2;
      segments = [
        [line.x1, line.y1, line.x1, midY - sy * r],
        [line.x1 + sx * r, midY, line.x2 - sx * r, midY],
        [line.x2, midY + sy * r, line.x2, line.y2],
      ];
    }
    return segments.some(([ax, ay, bx, by]) => distToSegment(x, y, ax, ay, bx, by) < tolerance);
  }

  if (line.points && line.points.length > 2) {
    const pts = line.points;
    for (let i = 0; i < pts.length - 1; i++) {
      if (distToSegment(x, y, pts[i].x, pts[i].y, pts[i + 1].x, pts[i + 1].y) < tolerance) {
        return true;
      }
    }
    return false;
  }

  if (line.cpx !== undefined && line.cpy !== undefined) {
    for (let t = 0; t <= 1; t += 0.05) {
      const bx = (1-t)*(1-t)*line.x1 + 2*(1-t)*t*line.cpx + t*t*line.x2;
      const by = (1-t)*(1-t)*line.y1 + 2*(1-t)*t*line.cpy + t*t*line.y2;
      if (Math.hypot(x - bx, y - by) < tolerance) return true;
    }
    return false;
  }

  // straight line — existing logic
  return distToSegment(x, y, line.x1, line.y1, line.x2, line.y2) < tolerance;
}
function hitTestImage(img: BoardImage, x: number, y: number): boolean {
  const centerX = img.x + img.width / 2;
  const centerY = img.y + img.height / 2;
  const rotation = img.rotation || 0;

  const dx = x - centerX;
  const dy = y - centerY;
  const localX = dx * Math.cos(-rotation) - dy * Math.sin(-rotation);
  const localY = dx * Math.sin(-rotation) + dy * Math.cos(-rotation);

  const halfWidth = img.width / 2;
  const halfHeight = img.height / 2;

  return (
    localX >= -halfWidth &&
    localX <= halfWidth &&
    localY >= -halfHeight &&
    localY <= halfHeight
  );
}

function hitTestTextBox(
  tb: TextBox,
  x: number,
  y: number,
  ctx: CanvasRenderingContext2D,
): boolean {
  ctx.font = `${tb.fontSize}px ${resolveFontFamily(tb.fontFamily)}`;
  const lines = tb.text.split("\n");
  const lineHeight = tb.fontSize * 1.2;
  const width = Math.max(...lines.map((l) => ctx.measureText(l).width));
  const height = lines.length * lineHeight;

  const left = tb.x;
  const top = tb.y;
  const right = tb.x + width;
  const bottom = tb.y + height;
  const cx = (left + right) / 2;
  const cy = (top + bottom) / 2;
  const rotation = tb.rotation || 0;

  const dx = x - cx;
  const dy = y - cy;
  const localX = dx * Math.cos(-rotation) - dy * Math.sin(-rotation) + cx;
  const localY = dx * Math.sin(-rotation) + dy * Math.cos(-rotation) + cy;

  return localX >= left && localX <= right && localY >= top && localY <= bottom;
}



interface Positionable {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
}

function hitTestRotationHandle(
  shape: Positionable,
  x: number,
  y: number,
  scale: number,
): boolean {
  const left = Math.min(shape.x, shape.x + shape.width);
  const top = Math.min(shape.y, shape.y + shape.height);
  const right = Math.max(shape.x, shape.x + shape.width);
  const bottom = Math.max(shape.y, shape.y + shape.height);
  const PAD = 6 / scale;

  const centerX = (left + right) / 2;
  const centerY = (top + bottom) / 2;
  const rotation = shape.rotation || 0;
  const hh = (bottom - top) / 2 + PAD;

  const dx = x - centerX;
  const dy = y - centerY;
  const localX = dx * Math.cos(-rotation) - dy * Math.sin(-rotation);
  const localY = dx * Math.sin(-rotation) + dy * Math.cos(-rotation);

  const handleX = 0;
  const handleY = -hh - 20 / scale;

  const ddx = localX - handleX;
  const ddy = localY - handleY;
  return ddx * ddx + ddy * ddy <= (10 / scale) * (10 / scale);
}
function hitTestCorner(
  shape: Positionable,
  x: number,
  y: number,
  scale: number,
): "tl" | "tr" | "bl" | "br" | null {
  const left = Math.min(shape.x, shape.x + shape.width);
  const top = Math.min(shape.y, shape.y + shape.height);
  const right = Math.max(shape.x, shape.x + shape.width);
  const bottom = Math.max(shape.y, shape.y + shape.height);
  const w = right - left;
  const h = bottom - top;
  const PAD = 6 / scale;

  const centerX = (left + right) / 2;
  const centerY = (top + bottom) / 2;

  const rotation = shape.rotation || 0;
  const dx = x - centerX;
  const dy = y - centerY;
  const localX = dx * Math.cos(-rotation) - dy * Math.sin(-rotation);
  const localY = dx * Math.sin(-rotation) + dy * Math.cos(-rotation);

  const corners: { name: "tl" | "tr" | "bl" | "br"; x: number; y: number }[] = [
    { name: "tl", x: -w / 2 - PAD, y: -h / 2 - PAD },
    { name: "tr", x: w / 2 + PAD, y: -h / 2 - PAD },
    { name: "bl", x: -w / 2 - PAD, y: h / 2 + PAD },
    { name: "br", x: w / 2 + PAD, y: h / 2 + PAD },
  ];

  const hitRadius = (8 / scale) * (8 / scale);
  for (const corner of corners) {
    const ddx = localX - corner.x;
    const ddy = localY - corner.y;
    if (ddx * ddx + ddy * ddy <= hitRadius) {
      return corner.name;
    }
  }
  return null;
}
function hitTestTextBoxCorner(
  tb: TextBox,
  x: number,
  y: number,
  scale: number,
): "tl" | "tr" | "bl" | "br" | null {
  const { width: w, height: h } = measureTextBox(tb.text, tb.fontSize, tb.fontFamily);
  const PAD = 6 / scale;

  const centerX = tb.x + w / 2;
  const centerY = tb.y + h / 2;

  const rotation = tb.rotation || 0;
  const dx = x - centerX;
  const dy = y - centerY;
  const localX = dx * Math.cos(-rotation) - dy * Math.sin(-rotation);
  const localY = dx * Math.sin(-rotation) + dy * Math.cos(-rotation);

  const corners: { name: "tl" | "tr" | "bl" | "br"; x: number; y: number }[] = [
    { name: "tl", x: -w / 2 - PAD, y: -h / 2 - PAD },
    { name: "tr", x: w / 2 + PAD, y: -h / 2 - PAD },
    { name: "bl", x: -w / 2 - PAD, y: h / 2 + PAD },
    { name: "br", x: w / 2 + PAD, y: h / 2 + PAD },
  ];

  const hitRadius = (8 / scale) * (8 / scale);
  for (const corner of corners) {
    const ddx = localX - corner.x;
    const ddy = localY - corner.y;
    if (ddx * ddx + ddy * ddy <= hitRadius) return corner.name;
  }
  return null;
}
function hitTestTextBoxRotationHandle(
  tb: TextBox,
  x: number,
  y: number,
  width: number,
  height: number,
  scale: number,
): boolean {
  const PAD = 6 / scale;
  const centerX = tb.x + width / 2;
  const centerY = tb.y + height / 2;
  const rotation = tb.rotation || 0;
  const hh = height / 2 + PAD;

  const dx = x - centerX;
  const dy = y - centerY;
  const localX = dx * Math.cos(-rotation) - dy * Math.sin(-rotation);
  const localY = dx * Math.sin(-rotation) + dy * Math.cos(-rotation);

  const ddx = localX;
  const ddy = localY - (-hh - 20 / scale);
  return ddx * ddx + ddy * ddy <= (10 / scale) * (10 / scale);
}

export {hitTestLine,hitTestShape,hitTestTextBox,hitTestImage,hitTestRotationHandle,hitTestCorner,hitTestTextBoxCorner,hitTestTextBoxRotationHandle}