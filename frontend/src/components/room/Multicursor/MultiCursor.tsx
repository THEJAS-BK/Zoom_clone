import React, {
  useCallback,
  useLayoutEffect,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import { socket } from "../../../services/socket";
import { useNavigate } from "react-router-dom";
const COLORS = ["#1f2937", "#f87171", "#22c55e", "#3b82f6", "#d97706"];
//helper function
import { redraw, resolveFontFamily } from "./canvas";

import VideoTab from "../VideoTab";
//types
import type { BoardImage, TextBox, Stroke, Point, ActiveStroke } from "./types";
import { useSocketBoard } from "./hooks/useSocketBoard";
import { useSocketDraw } from "./hooks/useSocketDraw";
import { useCanvasZoom } from "./hooks/useCanvasZoom";
import { useImageTransform } from "./hooks/useImageTransform";
import { getCursorStyle } from "./tools/CustomCursor";
import { useTextBox } from "./hooks/useTextBox";
import { useHandTool } from "./hooks/useHandTool";
//tools
import { autoPanIfNeeded } from "./tools/autoPanTextBox";
import { useShapes } from "./hooks/useShape";
import { useLines } from "./hooks/useLines";
import { useSelection } from "./hooks/useSelection";
import { useDeleteElement } from "./hooks/useDeleteElement";
import { measureTextBox } from "./canvas";

//leftSide tools
import { useToolSettings } from "../../../context/ToolBarLeftContext";
import { useEraser } from "./hooks/useEraser";
import { useWebRtcContext } from "../../../context/WebRtcContext";
import ZoomControls from "./ZoomControls";
import { useLayers } from "./hooks/useLayers";
import OptionsFooter from "../OptionsFooter";
import { useFollowUserCamera } from "./hooks/useFollowUserCamera";

export default function MultiCursor({
  images,
  imageUpdate,
  roomId,
  openCursor,
  setOpenCursor,
  setIsViewMode,
}: {
  images: React.RefObject<BoardImage[]>;
  imageUpdate: number;
  roomId: string;
  openCursor: boolean;
  setOpenCursor: React.Dispatch<React.SetStateAction<boolean>>;
  setIsViewMode: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const camera = useRef({ x: 0, y: 0, scale: 1 });
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const strokes = useRef<Stroke[]>([]);
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

  const navigate = useNavigate();

  const measureRef = useRef<HTMLSpanElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [panTick, setPanTick] = useState(0);

  const editingExistingRef = useRef(false);

  const [, forceUpdate] = useState(0);
  const triggerUpdate = () => forceUpdate((n) => n + 1);

  //edit stroke color
  const { strokeColor, setStrokeColor, viewMode } = useToolSettings();
  useEffect(() => {
    setStrokeColor(color);
  }, []);
  const { activeTool, selectedId } = useToolSettings();

  //view mode
  useEffect(() => {
    setIsViewMode(viewMode);
  }, [viewMode]);

  //shapes,textBoxes and lines
  const {
    shapesRef,
    activeShape,
    textBoxesRef,
    activeTextBox,
    linesRef,
    activeLine,
    doRedrawRef,
    setRoomId,
    strokeWidth,
    opacity,
    fillColor,
    tabSize,
  } = useToolSettings();

  useEffect(() => {
    if (roomId) {
      setRoomId(roomId);
    }
  }, [roomId]);

  useEffect(() => {
    const families = ["hand-drawn", "normal", "code"].map((f) =>
      resolveFontFamily(f),
    );

    Promise.all(families.map((f) => document.fonts.load(`16px ${f}`))).then(
      () => {
        document.fonts.ready.then(() => {
          doRedraw();
        });
      },
    );
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

  useFollowUserCamera(camera, doRedraw, roomId);

  useSelection(
    roomId ?? "",
    canvasRef,
    camera,
    shapesRef,
    linesRef,
    selectedId,
    strokeColor,
    activeTool,
    textBoxesRef,
    activeTextBox,
    triggerUpdate,
    doRedraw,
  );
  const { placeTextBox, finalizeTextBox, updateTextBoxContent } = useTextBox(
    roomId ?? "",
    camera,
    userIdRef.current,
    strokeColor,
    textBoxesRef,
    activeTextBox,
    shapesRef,
    linesRef,
    doRedraw,
  );
  const hasTextElements =
    activeTextBox !== null || textBoxesRef.current.length > 0;

  // stable callback so useCanvasZoom's effect doesn't tear down/reattach every render
  const handleCameraChange = useCallback(() => {
    if (hasTextElements) setPanTick((t) => t + 1);
  }, [hasTextElements]);

  useEffect(() => {
    if (!roomId) navigate("/dashboard");
  }, [roomId]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTool === "text") {
      placeTextBox(e.clientX, e.clientY);
      triggerUpdate();
    }
  };

  useLayers();

  useShapes(
    roomId ?? "",
    canvasRef,
    camera,
    shapesRef,
    activeShape,
    userIdRef,
    activeTool,
    strokeColor,
    linesRef,
    textBoxesRef,
    doRedraw,
  );
  useHandTool(canvasRef, camera, activeTool, doRedraw, roomId);
  useSocketBoard(roomId ?? "", canvasRef, images, strokes, doRedraw);
  useSocketDraw(
    roomId ?? "",
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

  useEraser(roomId ?? "", canvasRef, camera, strokes, activeTool, doRedraw);
  useCanvasZoom(
    wrapperRef,
    canvasRef,
    camera,
    handleCameraChange,
    doRedraw,
    roomId,
  );

  //image transformations
  useImageTransform(
    canvasRef,
    camera,
    images,
    imageCache,
    selectedImgIdx,
    roomId ?? "",
    doRedraw,
  );

  useLines(
    roomId ?? "",
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

  useDeleteElement(
    roomId ?? "",
    canvasRef,
    camera,
    shapesRef,
    activeTool,
    linesRef,
    textBoxesRef,
    doRedraw,
  );

  const {
    localStream,
    remoteStreams,
    isReady,
    isVideoMuted,
    isAudioMuted,
    audioToggle,
    videoToggle,
  } = useWebRtcContext();

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

    socket.emit("my-info", (cb: { userId: string; name: string }) => {
      setUserName(cb.name);
      setUserId(cb.userId);
      userIdRef.current = cb.userId;
    });
  }, []);

  const { toggleVideoTab } = useToolSettings();
  const tabSizeMap: Record<string, string> = {
    small: "w-[12%]",
    medium: "w-[14%]",
    large: "w-[20%]",
  };

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
  const { width, height } = measureTextBox(el.value, box.fontSize, box.fontFamily);

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
          outline:"none",
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
      {toggleVideoTab && (
        <div
          className={`absolute right-0 top-10 ${tabSizeMap[tabSize] ?? tabSizeMap.medium} bg-zinc-900 border border-zinc-600 rounded-2xl`}
        >
          <OptionsFooter
            audioToggle={audioToggle}
            videoToggle={videoToggle}
            isAudioMuted={isAudioMuted}
            isVideoMuted={isVideoMuted}
            openCursor={openCursor}
            setOpenCursor={setOpenCursor}
          />
          <VideoTab
            roomId={roomId}
            localStream={localStream}
            remoteStreams={remoteStreams}
            isReady={isReady}
            isVideoMuted={isVideoMuted}
            openCursor={true}
          />
        </div>
      )}

      <ZoomControls canvasRef={canvasRef} camera={camera} doRedraw={doRedraw} />

      <canvas
        ref={canvasRef}
        className="bg-gray-700"
        style={{
          cursor: getCursorStyle(activeTool),
          overscrollBehavior: "none",
          overflow: "hidden",
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
