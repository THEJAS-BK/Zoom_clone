import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { RefObject } from "react";
const COLORS = ["#1f2937", "#f87171", "#22c55e", "#3b82f6", "#d97706"];
//helper function
import { redraw } from "../room/Multicursor/canvas";

//types
import type {
  BoardImage,
  Stroke,
  Point,
  ActiveStroke,
  TextBox,
} from "../room/Multicursor/types";
//tools
import { autoPanIfNeeded } from "../room/Multicursor/tools/autoPanTextBox";
import { useToolSettings } from "../../context/ToolBarLeftContext";
import { getCursorStyle } from "../room/Multicursor/tools/CustomCursor";
import { resolveFontFamily } from "../room/Multicursor/canvas";
import { measureTextBox } from "../room/Multicursor/canvas";
//hooks
import { useOfflineCanvasZoom } from "./hooks/useOfflineCanvasZoom";
import { useOfflineStrokeEraser } from "./hooks/useOfflineStrokeEraser";
import { useOfflineHandTool } from "./hooks/useOfflineHandTool";
import { useOfflineSelection } from "./hooks/useOfflineSelection";
import { useOfflineTextBox } from "./hooks/useOfflineTextBox";
import { useOfflineShapes } from "./hooks/useOfflineShape";
import { useOfflineDraw } from "./hooks/useOfflineDraw";
import { useOfflineLines } from "./hooks/useOfflineLines";
import { useOfflineDeleteElement } from "./hooks/useOfflineDeleteElement";
import { useLayers } from "../room/Multicursor/hooks/useLayers";
import ZoomAndRedoUndo from "../room/Multicursor/ZoomAndUndoRedo";

export default function OfflineMultiCursor({images}: {images: RefObject<BoardImage[]>}) {
  const camera = useRef({ x: 0, y: 0, scale: 1 });
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const currentStroke = useRef<Point[]>([]);
  const activeStrokes = useRef<Record<string, ActiveStroke>>({});
  const imageCache = useRef<Map<string, HTMLImageElement>>(new Map());
  const userIdRef = useRef("");
  const isDrawing = useRef(false);
  const color = useRef(COLORS[Math.floor(Math.random() * 5)]).current;
  const selectedImgIdx = useRef<number>(-1);

  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState("");
  const measureRef = useRef<HTMLSpanElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [panTick, setPanTick] = useState(0);

  const editingExistingRef = useRef(false);

  const [, forceUpdate] = useState(0);
  const triggerUpdate = () => forceUpdate((n) => n + 1);


  //shapes,textBoxes and lines
  const {
    shapesRef,
    activeShape,
    textBoxesRef,
    activeTextBox,
    linesRef,
    activeLine,
    doRedrawRef,
    strokeWidth,
    opacity,
    fillColor,
    strokeColor,
    setStrokeColor,
    activeTool,
    selectedId,
    setIsOffline,
    tabSize,
    boardColor,
    strokes
  } = useToolSettings();

  useEffect(() => {
    setIsOffline(true);
    return () => setIsOffline(false);
  }, []);

  useEffect(() => {
    setStrokeColor(color);
  }, []);

  const doRedraw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    redraw(
      canvas,
      ctx,
      camera,
      images,
      imageCache,
      activeStrokes,
      currentStroke,
      strokes,
      userIdRef.current,
      strokeColor,
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
    );
  }, [strokeColor, strokeWidth, opacity, fillColor]);

  useEffect(() => {
    doRedrawRef.current = doRedraw;
  }, [doRedraw]);

  useLayers();

  useOfflineSelection(
    canvasRef,
    camera,
    shapesRef,
    linesRef,
    images,
    strokeColor,
    activeTool,
    textBoxesRef,
    activeTextBox,
    triggerUpdate,
    doRedraw,
  );

  const { placeTextBox, finalizeTextBox, updateTextBoxContent } =
    useOfflineTextBox(
      camera,
      userIdRef.current,
      strokeColor,
      textBoxesRef,
      activeTextBox,
      linesRef,
      shapesRef,
      doRedraw,
    );

  const hasTextElements =
    activeTextBox !== null || textBoxesRef.current.length > 0;

  const handleCameraChange = useCallback(() => {
    if (hasTextElements) setPanTick((t) => t + 1);
  }, [hasTextElements]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTool === "text") {
      placeTextBox(e.clientX, e.clientY);
      triggerUpdate();
    }
  };

  useOfflineShapes(
    canvasRef,
    camera,
    shapesRef,
    activeShape,
    userIdRef,
    activeTool,
    linesRef,
    textBoxesRef,
    strokeColor,
    doRedraw,
  );
  useOfflineHandTool(canvasRef, camera, activeTool, doRedraw);

  useOfflineDraw(
    canvasRef,
    camera,
    activeStrokes,
    currentStroke,
    strokes,
    userIdRef,
    isDrawing,
    setCursorPos,
    selectedImgIdx,
    activeTool,
    strokeColor,
    doRedraw,
  );

  useOfflineStrokeEraser(canvasRef, camera, strokes, activeTool, doRedraw);
  useOfflineCanvasZoom(
    wrapperRef,
    canvasRef,
    camera,
    handleCameraChange,
    doRedraw,
  );

  useOfflineLines(
    canvasRef,
    camera,
    linesRef,
    activeLine,
    userIdRef,
    activeTool,
    strokeColor,
    shapesRef,
    textBoxesRef,
    doRedraw,
  );

  useOfflineDeleteElement(
    canvasRef,
    camera,
    shapesRef,
    activeTool,
    linesRef,
    textBoxesRef,
    doRedraw,
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    ctx.scale(dpr, dpr);

    ctx.lineWidth = 5;
    ctx.lineCap = "round";

    const id = crypto.randomUUID();
    setUserName("You");
    setUserId(id);
    userIdRef.current = id;
  }, []);

  function TextBoxEditor({
    box,
    camera,
    onInput,
    onBlur,
    textareaRef,
  }: {
    box: TextBox;
    camera: React.RefObject<{ x: number; y: number; scale: number }>;
    onInput: (text: string) => void;
    onBlur: (text: string) => void;
    textareaRef: RefObject<HTMLTextAreaElement | null>;
  }) {
    const scale = camera.current.scale;

    const resizeTextarea = (el: HTMLTextAreaElement) => {
      const { width, height } = measureTextBox(
        el.value,
        box.fontSize,
        box.fontFamily,
      );

      el.style.width = width * scale + 20 + "px";
      el.style.height = height * scale + 6 + "px";
      el.style.transformOrigin = `${(width * scale) / 2}px ${(height * scale) / 2}px`;

      // keep textarea position synced to the same centering the ref undergoes
      el.style.left = box.x * scale + camera.current.x + "px";
      el.style.top = box.y * scale + camera.current.y + "px";
    };

    useLayoutEffect(() => {
      const el = textareaRef.current;
      if (!el) return;
      resizeTextarea(el);
      const len = el.value.length;
      el.focus();
      el.setSelectionRange(len, len);
    }, [box.id]); // re-run when switching to a different box (key already remounts, this covers first paint)

    return (
      <textarea
        ref={textareaRef}
        key={box.id}
        defaultValue={box.text}
        rows={1}
        spellCheck={false}
        style={{
          color: "transparent",
          caretColor: box.color,
          position: "absolute",
          left: box.x * scale + camera.current.x,
          top: box.y * scale + camera.current.y,
          transform: `rotate(${box.rotation ?? 0}rad)`,

          border: "none",
          outline: "none",
          boxShadow: "none",
          fontSize: box.fontSize * scale,
          fontFamily: resolveFontFamily(box.fontFamily),
          textAlign: box.textAlign as CanvasTextAlign,
          fontWeight: "normal",
          resize: "none",
          overflow: "hidden",
          padding: 0,
          margin: 0,
          boxSizing: "border-box",
          lineHeight: `${box.fontSize * scale * 1.4}px`,
          verticalAlign: "top",
          background: "transparent",
        }}
        onInput={(e) => {
          const el = e.currentTarget;
          onInput(el.value);
          resizeTextarea(el);
        }}
        onBlur={(e) => onBlur(e.target.value)}
      />
    );
  }

  return (
    <div
      ref={wrapperRef}
      style={{
        position: "relative",
        touchAction: "none",
        overscrollBehavior: "none",
        width: "100%",
        height: "100%",
      }}
    >
      <ZoomAndRedoUndo canvasRef={canvasRef} camera={camera} doRedraw={doRedraw} />

      <canvas
        ref={canvasRef}
        style={{
          cursor: getCursorStyle(activeTool),
          overscrollBehavior: "none",
          overflow: "hidden",
          backgroundColor: boardColor,
        }}
        onClick={handleCanvasClick}
      />

      {activeTextBox.current && (
        <TextBoxEditor
          key={activeTextBox.current.id}
          box={activeTextBox.current}
          camera={camera}
          onInput={(text) => {
            updateTextBoxContent(text);
            const rect = textareaRef.current!.getBoundingClientRect();
            autoPanIfNeeded(
              camera,
              rect.right,
              rect.bottom,
              () => setPanTick((t) => t + 1),
              doRedraw,
            );
            doRedraw();
          }}
          onBlur={(text) => {
            finalizeTextBox(text);
            editingExistingRef.current = false;
            triggerUpdate();
          }}
          textareaRef={textareaRef}
        />
      )}
    </div>
  );
}