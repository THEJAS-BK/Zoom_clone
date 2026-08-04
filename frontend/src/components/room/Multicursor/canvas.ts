import type React from "react";
import type {
  BoardImage,
  ActiveStroke,
  Point,
  Stroke,
  Shape,
  Line,
  TextBox,
} from "./types";

const getCanvasPoint = (
  e: MouseEvent,
  canvas: HTMLCanvasElement,
  camera: React.RefObject<any>,
) => {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  const screenX = (e.clientX - rect.left) * dpr;
  const screenY = (e.clientY - rect.top) * dpr;
  return {
    x: (screenX - camera.current.x * dpr) / (camera.current.scale * dpr),
    y: (screenY - camera.current.y * dpr) / (camera.current.scale * dpr),
  };
};
type FontFamily = "hand-drawn" | "normal" | "code";

//redraw
const redraw = (
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  camera: React.RefObject<any>,
  images: React.RefObject<BoardImage[]>,
  imageCache: React.RefObject<Map<string, HTMLImageElement>>,
  activeStrokes: React.RefObject<Record<string, ActiveStroke>>,
  currentStroke: React.RefObject<Point[]>,
  strokes: React.RefObject<Stroke[]>,
  userId: string,
  color: string,
  shapesRef: React.RefObject<Shape[]>,
  activeShape: React.RefObject<Shape | null>,
  linesRef: React.RefObject<Line[]>,
  activeLine: React.RefObject<Line | null>,
  selectedId: React.RefObject<string | null>,
  textBoxesRef: React.RefObject<TextBox[]>,
  activeTextBox: React.RefObject<TextBox | null>,
  strokeWidth: number,
  opacity: number,
  fillColor: string,
  isDashedBorderNeeded: boolean,
) => {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const dpr = window.devicePixelRatio || 1;
  ctx.setTransform(
    camera.current.scale * dpr,
    0,
    0,
    camera.current.scale * dpr,
    camera.current.x * dpr,
    camera.current.y * dpr,
  );

  const allShapes = [
    ...shapesRef.current,
    ...(activeShape?.current ? [activeShape.current] : []),
  ];
  const allLines = [
    ...linesRef.current,
    ...(activeLine?.current ? [activeLine.current] : []),
  ];
  const allTextBoxesForDraw = [
    ...(textBoxesRef?.current ?? []).filter(
      (tb) => tb.id !== activeTextBox?.current?.id,
    ),
    ...(activeTextBox?.current ? [activeTextBox.current] : []),
  ];
  const allActive = Object.entries(activeStrokes.current).map(
    ([userId, activeStroke]) => ({
      userId,
      color: activeStroke.color,
      strokeWidth: activeStroke.strokeWidth,
      opacity: activeStroke.opacity,
      points: activeStroke.points,
    }),
  );
  const allStrokes = [
    ...strokes.current,
    { userId, points: currentStroke.current, color, strokeWidth, opacity },
    ...allActive,
  ];

  type Sortable =
    | { kind: "shape"; zIndex: number; el: Shape }
    | { kind: "line"; zIndex: number; el: Line }
    | { kind: "textbox"; zIndex: number; el: TextBox }
    | { kind: "image"; zIndex: number; el: BoardImage }
    | { kind: "stroke"; zIndex: number; el: (typeof allStrokes)[number] };

  const merged: Sortable[] = [
    ...images.current.map((el) => ({
      kind: "image" as const,
      zIndex: el.zIndex ?? 0,
      el,
    })),
    ...allShapes.map((el) => ({
      kind: "shape" as const,
      zIndex: el.zIndex ?? 0,
      el,
    })),
    ...allLines.map((el) => ({
      kind: "line" as const,
      zIndex: el.zIndex ?? 0,
      el,
    })),
    ...allTextBoxesForDraw.map((el) => ({
      kind: "textbox" as const,
      zIndex: el.zIndex ?? 0,
      el,
    })),
    ...allStrokes.map((el) => ({
      kind: "stroke" as const,
      zIndex: (el as any).zIndex ?? 0,
      el,
    })),
  ].sort((a, b) => a.zIndex - b.zIndex);

  for (const item of merged) {
    switch (item.kind) {
      case "image": {
        const imageData = item.el;
        const cached = imageCache.current.get(imageData.id);

        if (cached) {
          const centerX = imageData.x + imageData.width / 2;
          const centerY = imageData.y + imageData.height / 2;
          const rotation = imageData.rotation || 0;

          ctx.save();
          ctx.translate(centerX, centerY);
          ctx.rotate(rotation);
          ctx.drawImage(
            cached,
            -imageData.width / 2,
            -imageData.height / 2,
            imageData.width,
            imageData.height,
          );
          ctx.restore();
        } else {
          const img = new Image();
          img.onload = () => {
            imageCache.current.set(imageData.id, img);
            redraw(
              canvas,
              ctx,
              camera,
              images,
              imageCache,
              activeStrokes,
              currentStroke,
              strokes,
              userId,
              color,
              shapesRef,
              activeShape,
              linesRef,
              activeLine,
              selectedId,
              textBoxesRef,
              activeTextBox,
              strokeWidth,
              opacity,
              fillColor,
              isDashedBorderNeeded,
            );
          };
          img.src = imageData.image;
        }
        break;
      }

      case "shape":
        drawShape(ctx, item.el);
        break;

      case "line":
        drawLine(ctx, item.el);
        break;

      case "textbox":
        drawTextBox(ctx, item.el);
        break;
      case "stroke": {
        const stroke = item.el;
        if (stroke.points.length === 0) break;
        ctx.save();
        ctx.globalAlpha = (stroke.opacity ?? 100) / 100;
        ctx.beginPath();
        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = stroke.strokeWidth ?? 4;
        stroke.points.forEach((p, i) => {
          if (i === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        });
        ctx.stroke();
        ctx.restore();
        break;
      }
    }
  }

  //selection
  // ---- selection indicators ----
  if (selectedId?.current) {
    const id = selectedId.current;
    const scale = camera.current.scale;

    const drawSelectionBox = (
      left: number,
      top: number,
      right: number,
      bottom: number,
      rotation = 0,
      isDashedBorderNeeded = false,
    ) => {
      const w = right - left;
      const h = bottom - top;
      const PAD = 6 / scale;
      const cx = (left + right) / 2;
      const cy = (top + bottom) / 2;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rotation);

      // outline
      ctx.strokeStyle = "#7C6FF0";
      ctx.lineWidth = 2 / scale;
      ctx.setLineDash(isDashedBorderNeeded ? [6 / scale, 4 / scale] : []);
      ctx.strokeRect(-w / 2 - PAD, -h / 2 - PAD, w + PAD * 2, h + PAD * 2);
      ctx.setLineDash([]);

      // rotation handle
      ctx.beginPath();
      ctx.arc(0, -h / 2 - PAD - 20 / scale, 8 / scale, 0, Math.PI * 2);
      ctx.fillStyle = "#7C6FF0";
      ctx.fill();
      ctx.strokeStyle = "#C4B5FD";
      ctx.lineWidth = 2 / scale;
      ctx.stroke();

      // corner handles

      const corners = [
        { x: -w / 2 - PAD, y: -h / 2 - PAD },
        { x: w / 2 + PAD, y: -h / 2 - PAD },
        { x: -w / 2 - PAD, y: h / 2 + PAD },
        { x: w / 2 + PAD, y: h / 2 + PAD },
      ];
      const hs = 5 / scale;
      corners.forEach((c) => {
        ctx.beginPath();
        ctx.rect(c.x - hs, c.y - hs, hs * 2, hs * 2);
        ctx.fillStyle = "#7C6FF0";
        ctx.fill();
        ctx.strokeStyle = "#C4B5FD";
        ctx.stroke();
      });

      ctx.restore();
    };

    const selectedShape = shapesRef?.current?.find((s) => s.id === id);
    if (selectedShape) {
      const left = Math.min(
        selectedShape.x,
        selectedShape.x + selectedShape.width,
      );
      const top = Math.min(
        selectedShape.y,
        selectedShape.y + selectedShape.height,
      );
      const right = Math.max(
        selectedShape.x,
        selectedShape.x + selectedShape.width,
      );
      const bottom = Math.max(
        selectedShape.y,
        selectedShape.y + selectedShape.height,
      );
      drawSelectionBox(left, top, right, bottom, selectedShape.rotation || 0);
    }

    const selectedLine = linesRef?.current?.find((l) => l.id === id);
    if (selectedLine) {
      ctx.save();
      ctx.strokeStyle = "#C4B5FD";
      ctx.lineWidth = 2 / scale;
      ctx.setLineDash([]);

      // endpoint handles
      for (const pt of [
        { x: selectedLine.x1, y: selectedLine.y1 },
        { x: selectedLine.x2, y: selectedLine.y2 },
      ]) {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 5 / scale, 0, Math.PI * 2);
        ctx.fillStyle = "#7C6FF0";
        ctx.fill();
        ctx.stroke();
      }

      // center handle — sits on the curve at t=0.5
      if (selectedLine.arrowType !== "elbow") {
        const handleX =
          selectedLine.cpx !== undefined
            ? 0.25 * selectedLine.x1 +
              0.5 * selectedLine.cpx +
              0.25 * selectedLine.x2
            : (selectedLine.x1 + selectedLine.x2) / 2;
        const handleY =
          selectedLine.cpy !== undefined
            ? 0.25 * selectedLine.y1 +
              0.5 * selectedLine.cpy +
              0.25 * selectedLine.y2
            : (selectedLine.y1 + selectedLine.y2) / 2;
        ctx.beginPath();
        ctx.arc(handleX, handleY, 5 / scale, 0, Math.PI * 2);
        ctx.strokeStyle = "#7C6FF0";
        ctx.fill();
        ctx.stroke();
      }

      ctx.restore();
    }

    const selectedText = textBoxesRef?.current?.find((t) => t.id === id);
    if (selectedText) {
      const { width, height } = measureTextBox(
        selectedText.text,
        selectedText.fontSize,
        selectedText.fontFamily,
      );

      drawSelectionBox(
        selectedText.x,
        selectedText.y,
        selectedText.x + width,
        selectedText.y + height,
        selectedText.rotation || 0,
        isDashedBorderNeeded,
      );
    }
    const selectedImage = images?.current?.find((img) => img.id === id);
    if (selectedImage) {
      const left = Math.min(
        selectedImage.x,
        selectedImage.x + selectedImage.width,
      );
      const top = Math.min(
        selectedImage.y,
        selectedImage.y + selectedImage.height,
      );
      const right = Math.max(
        selectedImage.x,
        selectedImage.x + selectedImage.width,
      );
      const bottom = Math.max(
        selectedImage.y,
        selectedImage.y + selectedImage.height,
      );
      drawSelectionBox(left, top, right, bottom, selectedImage.rotation || 0);
    }
  }
};

const FONT_FAMILY_MAP: Record<FontFamily, string> = {
  "hand-drawn": "'Caveat', cursive",
  normal: "'Inter', sans-serif",
  code: "'Cascadia Code', monospace",
};

function resolveFontFamily(value: string | undefined): string {
  const key = (value ?? "normal") as FontFamily;
  return FONT_FAMILY_MAP[key] ?? FONT_FAMILY_MAP.normal;
}

function drawTextBox(ctx: CanvasRenderingContext2D, tb: TextBox) {
  ctx.save();
  ctx.globalAlpha = (tb.opacity ?? 100) / 100;
  ctx.globalCompositeOperation = "source-over";

  const { width, height, lineHeight, lines } = measureTextBox(
    tb.text,
    tb.fontSize,
    tb.fontFamily,
  );
  const fontStr = `normal ${tb.fontSize}px ${resolveFontFamily(tb.fontFamily)}`;
  ctx.font = fontStr;

  const cx = tb.x + width / 2;
  const cy = tb.y + height / 2;
  ctx.translate(cx, cy);
  ctx.rotate(tb.rotation || 0);
  ctx.translate(-cx, -cy);

  ctx.fillStyle = tb.color;
  const align = tb.textAlign || "left";

  lines.forEach((line, i) => {
    const lineWidth = ctx.measureText(line).width;
    let drawX = tb.x;
    if (align === "center") drawX = tb.x + (width - lineWidth) / 2;
    else if (align === "right") drawX = tb.x + (width - lineWidth);
    ctx.fillText(line, drawX, tb.y + tb.fontSize + i * lineHeight);
  });

  ctx.restore();
}

const isPointNearStroke = (
  point: Point,
  stroke: Stroke,
  threshold = 10,
): boolean => {
  for (const p of stroke.points) {
    const dx = p.x - point.x;
    const dy = p.y - point.y;
    if (dx * dx + dy * dy <= threshold * threshold) {
      return true;
    }
  }
  return false;
};

function drawShape(ctx: CanvasRenderingContext2D, shape: Shape) {
  const left = Math.min(shape.x, shape.x + shape.width);
  const top = Math.min(shape.y, shape.y + shape.height);
  const right = Math.max(shape.x, shape.x + shape.width);
  const bottom = Math.max(shape.y, shape.y + shape.height);
  const cx = (left + right) / 2;
  const cy = (top + bottom) / 2;
  const w = right - left;
  const h = bottom - top;
  const rotation = shape.rotation || 0;

  const shouldFill = shape.fillColor !== "transparent";
  const isRounded = shape.edgeStyle === "rounded";
  ctx.save();
  ctx.globalAlpha = (shape.opacity ?? 100) / 100;
  ctx.translate(cx, cy);
  ctx.rotate(rotation);
  ctx.strokeStyle = shape.color;
  ctx.lineWidth = shape.strokeWidth;

  switch (shape.strokeStyle) {
    case "dashed":
      ctx.setLineDash([10, 6]);
      break;
    case "dotted":
      ctx.setLineDash([2, 6]);
      ctx.lineCap = "round";
      break;
    default:
      ctx.setLineDash([]);
  }

  switch (shape.shapeType) {
    case "square": {
      const radius = isRounded ? Math.min(w, h) * 0.15 : 0;

      ctx.beginPath();
      if (radius > 0) {
        ctx.roundRect(-w / 2, -h / 2, w, h, radius);
      } else {
        ctx.rect(-w / 2, -h / 2, w, h);
      }
      if (shouldFill) {
        ctx.fillStyle = shape.fillColor;
        ctx.fill();
      }
      ctx.stroke();
      break;
    }

    case "circle":
      ctx.beginPath();
      ctx.ellipse(0, 0, w / 2, h / 2, 0, 0, Math.PI * 2);
      if (shouldFill) {
        ctx.fillStyle = shape.fillColor;
        ctx.fill();
      }
      ctx.stroke();
      break;

    case "diamond": {
      const points = [
        { x: 0, y: -h / 2 },
        { x: w / 2, y: 0 },
        { x: 0, y: h / 2 },
        { x: -w / 2, y: 0 },
      ];
      const radius = isRounded ? Math.min(w, h) * 0.15 : 0;

      ctx.beginPath();
      if (radius > 0) {
        drawRoundedPolygon(ctx, points, radius);
      } else {
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
          ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.closePath();
      }
      if (shouldFill) {
        ctx.fillStyle = shape.fillColor;
        ctx.fill();
      }
      ctx.stroke();
      break;
    }
  }

  ctx.restore();
}

function drawRoundedPolygon(
  ctx: CanvasRenderingContext2D,
  points: { x: number; y: number }[],
  radius: number,
) {
  const n = points.length;

  // Clamp radius so it never exceeds half of any edge's length
  let r = radius;
  for (let i = 0; i < n; i++) {
    const p1 = points[i];
    const p2 = points[(i + 1) % n];
    const edgeLen = Math.hypot(p2.x - p1.x, p2.y - p1.y);
    r = Math.min(r, edgeLen / 2);
  }

  ctx.moveTo((points[0].x + points[1].x) / 2, (points[0].y + points[1].y) / 2);
  for (let i = 0; i < n; i++) {
    const corner = points[(i + 1) % n];
    const next = points[(i + 2) % n];
    ctx.arcTo(corner.x, corner.y, next.x, next.y, r);
  }
  ctx.closePath();
}

function drawLine(ctx: CanvasRenderingContext2D, line: Line) {
  ctx.save();
  ctx.globalAlpha = (line.opacity ?? 100) / 100;
  ctx.strokeStyle = line.color;
  ctx.lineWidth = line.strokeWidth;

  switch (line.lineStyle) {
    case "dashed":
      ctx.setLineDash([10, 6]);
      break;
    case "dotted":
      ctx.setLineDash([2, 6]);
      ctx.lineCap = "round";
      break;
    default:
      ctx.setLineDash([]);
  }

  const pts = line.points;
  const dx = line.x2 - line.x1;
  const dy = line.y2 - line.y1;

  ctx.beginPath();

  if (line.arrowType === "elbow") {
    if (dx === 0 && dy === 0) {
      ctx.restore();
      return;
    }
    const r = Math.min(20, Math.abs(dx) / 2 || 20, Math.abs(dy) / 2 || 20);
    const sx = dx >= 0 ? 1 : -1;
    const sy = dy >= 0 ? 1 : -1;

    ctx.moveTo(line.x1, line.y1);

    if (Math.abs(dx) >= Math.abs(dy)) {
      // horizontal -> vertical -> horizontal, bend column at the midpoint x
      const midX = (line.x1 + line.x2) / 2;
      ctx.lineTo(midX - sx * r, line.y1);
      ctx.quadraticCurveTo(midX, line.y1, midX, line.y1 + sy * r);
      ctx.lineTo(midX, line.y2 - sy * r);
      ctx.quadraticCurveTo(midX, line.y2, midX + sx * r, line.y2);
      ctx.lineTo(line.x2, line.y2);
    } else {
      // vertical -> horizontal -> vertical, bend row at the midpoint y
      const midY = (line.y1 + line.y2) / 2;
      ctx.lineTo(line.x1, midY - sy * r);
      ctx.quadraticCurveTo(line.x1, midY, line.x1 + sx * r, midY);
      ctx.lineTo(line.x2 - sx * r, midY);
      ctx.quadraticCurveTo(line.x2, midY, line.x2, midY + sy * r);
      ctx.lineTo(line.x2, line.y2);
    }
  } else if (pts && pts.length > 2) {
    ctx.moveTo(pts[0].x, pts[0].y);

    if (line.arrowType === "curve") {
      // smooth through each point using quadratic curves to segment midpoints
      for (let i = 1; i < pts.length - 1; i++) {
        const midX = (pts[i].x + pts[i + 1].x) / 2;
        const midY = (pts[i].y + pts[i + 1].y) / 2;
        ctx.quadraticCurveTo(pts[i].x, pts[i].y, midX, midY);
      }
      ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
    } else {
      // sharp — unchanged, hard corners
      for (let i = 1; i < pts.length; i++) {
        ctx.lineTo(pts[i].x, pts[i].y);
      }
    }
 } else {
    ctx.moveTo(line.x1, line.y1);
    if (line.cpx !== undefined && line.cpy !== undefined) {
      ctx.quadraticCurveTo(line.cpx, line.cpy, line.x2, line.y2);
    } else if (line.lineType === "arrow") {
      const headLength = Math.max(12, line.strokeWidth * 4);
      const angle = Math.atan2(dy, dx);
      const backX = line.x2 - headLength * Math.cos(angle);
      const backY = line.y2 - headLength * Math.sin(angle);
      ctx.lineTo(backX, backY);
    } else {
      ctx.lineTo(line.x2, line.y2);
    }
  }
  ctx.stroke();

  if (line.lineType === "arrow") {
    let angle: number;
    let startAngle: number;

    if (line.arrowType === "elbow") {
      if (Math.abs(dx) >= Math.abs(dy)) {
        angle = dx >= 0 ? 0 : Math.PI;
        startAngle = dx >= 0 ? Math.PI : 0;
      } else {
        angle = dy >= 0 ? Math.PI / 2 : -Math.PI / 2;
        startAngle = dy >= 0 ? -Math.PI / 2 : Math.PI / 2;
      }
    } else if (pts && pts.length > 2) {
      angle = Math.atan2(
        pts[pts.length - 1].y - pts[pts.length - 2].y,
        pts[pts.length - 1].x - pts[pts.length - 2].x,
      );
      startAngle = Math.atan2(pts[0].y - pts[1].y, pts[0].x - pts[1].x);
    } else if (line.cpx !== undefined && line.cpy !== undefined) {
      angle = Math.atan2(line.y2 - line.cpy, line.x2 - line.cpx);
      startAngle = Math.atan2(line.y1 - line.cpy, line.x1 - line.cpx);
    } else {
      angle = Math.atan2(dy, dx);
      startAngle = Math.atan2(line.y1 - line.y2, line.x1 - line.x2);
    }

    const headLength = Math.max(12, line.strokeWidth * 4);
    ctx.setLineDash([]);

    ctx.beginPath();
    ctx.moveTo(line.x2, line.y2);
    ctx.lineTo(
      line.x2 - headLength * Math.cos(angle - Math.PI / 6),
      line.y2 - headLength * Math.sin(angle - Math.PI / 6),
    );
    ctx.lineTo(
      line.x2 - headLength * Math.cos(angle + Math.PI / 6),
      line.y2 - headLength * Math.sin(angle + Math.PI / 6),
    );
    ctx.closePath();
    ctx.fillStyle = line.color;
    ctx.fill();

    if (line.arrowHead === "classic") {
      ctx.beginPath();
      ctx.moveTo(line.x1, line.y1);
      ctx.lineTo(
        line.x1 - headLength * Math.cos(startAngle - Math.PI / 6),
        line.y1 - headLength * Math.sin(startAngle - Math.PI / 6),
      );
      ctx.lineTo(
        line.x1 - headLength * Math.cos(startAngle + Math.PI / 6),
        line.y1 - headLength * Math.sin(startAngle + Math.PI / 6),
      );
      ctx.closePath();
      ctx.fillStyle = line.color;
      ctx.fill();
    }

    ctx.restore();
    return;
  }

  ctx.restore();
}

let measureCtx: CanvasRenderingContext2D | null = null;
function getMeasureCtx(): CanvasRenderingContext2D {
  if (!measureCtx) {
    measureCtx = document.createElement("canvas").getContext("2d")!;
  }
  return measureCtx;
}

export interface TextBoxMetrics {
  width: number;
  height: number;
  lineHeight: number;
  lines: string[];
}

// All values are in WORLD units (unscaled) — same space as tb.fontSize, tb.x, tb.y.
function measureTextBox(
  text: string,
  fontSize: number,
  fontFamily: string,
): TextBoxMetrics {
  const ctx = getMeasureCtx();
  ctx.font = `${fontSize}px ${resolveFontFamily(fontFamily)}`;
  const lines = text.length ? text.split("\n") : [""];
  const lineHeight = fontSize * 1.4;
  const rawWidth = Math.max(...lines.map((l) => ctx.measureText(l).width));
  const width = Math.max(rawWidth, fontSize * 0.5); // floor so empty/new box has caret room
  const height = lines.length * lineHeight;
  return { width, height, lineHeight, lines };
}

export {
  getCanvasPoint,
  redraw,
  isPointNearStroke,
  drawShape,
  drawLine,
  resolveFontFamily,
  measureTextBox,
};
