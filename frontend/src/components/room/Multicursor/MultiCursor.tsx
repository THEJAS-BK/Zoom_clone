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
const COLORS = ["#f87171", "#22c55e", "#3b82f6", "#d97706"];
//helper function
import { redraw, resolveFontFamily } from "./canvas";

import VideoTab from "../VideoTab";
//types
import type { BoardImage, TextBox, Stroke, Point, ActiveStroke } from "./types";
import { useSocketBoard } from "./hooks/useSocketBoard";
import { useSocketDraw } from "./hooks/useSocketDraw";
import { useCanvasZoom } from "./hooks/useCanvasZoom";
import { useImage } from "./hooks/useImage";
import { getCursorStyle } from "./tools/CustomCursor";
import { useTextBox } from "./hooks/useTextBox";
import { useHandTool } from "./hooks/useHandTool";
import { useUserCursor } from "./hooks/useUserCursor";
//tools
import { autoPanIfNeeded } from "./tools/autoPanTextBox";
import { useShapes } from "./hooks/useShape";
import { useLines } from "./hooks/useLines";
import { useSelection } from "./hooks/useSelection";
import { useDeleteElement } from "./hooks/useDeleteElement";
import { measureTextBox } from "./canvas";

//leftSide tools
import { useToolSettings } from "../../../context/ToolBarLeftContext";
import { useStrokeEraser } from "./hooks/useStrokesEraser";
import { useWebRtcContext } from "../../../context/WebRtcContext";
import ZoomControls from "./ZoomAndUndoRedo";
import { useLayers } from "./hooks/useLayers";
import OptionsFooter from "../OptionsFooter";
import { useFollowUserCamera } from "./hooks/useFollowUserCamera";
import useMediaQuery from "@mui/material/useMediaQuery";

export default function MultiCursor({
  images,
  imageUpdate,
  roomId,
  openCursor,
  setOpenCursor,
  setIsViewMode,
  camera,
  canvasRef,
}: {
  images: React.RefObject<BoardImage[]>;
  imageUpdate: number;
  roomId: string;
  openCursor: boolean;
  setOpenCursor: React.Dispatch<React.SetStateAction<boolean>>;
  setIsViewMode: React.Dispatch<React.SetStateAction<boolean>>;
  camera: React.RefObject<any>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}) {
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

  const navigate = useNavigate();

  const measureRef = useRef<HTMLSpanElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [panTick, setPanTick] = useState(0);

  const isSmallView=useMediaQuery("(max-width: 550px)")

  const editingExistingRef = useRef(false);

  const [, forceUpdate] = useState(0);
  const triggerUpdate = () => forceUpdate((n) => n + 1);

  const [remoteCursors, setRemoteCursors] = useState<
    Record<string, { x: number; y: number; color: string; name: string }>
  >({});

  useUserCursor(roomId, canvasRef, camera, setRemoteCursors);

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
    boardColor,
    strokes,
    isDashedBorderNeeded,
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
      isDashedBorderNeeded,
    );
  }, [strokeColor, strokeWidth, opacity, fillColor, isDashedBorderNeeded]);

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
    images,
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
  useSocketBoard(roomId ?? "", canvasRef, strokes, doRedraw);
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

  useStrokeEraser(
    roomId ?? "",
    canvasRef,
    camera,
    strokes,
    activeTool,
    doRedraw,
  );
  useCanvasZoom(
    wrapperRef,
    canvasRef,
    camera,
    handleCameraChange,
    doRedraw,
    roomId,
  );

  //image transformations
  useImage(roomId, images, imageCache, doRedraw);

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

    const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTool === "text") {
      placeTextBox(e.clientX, e.clientY);
      triggerUpdate();
    }
  };

useEffect(() => {
  const canvas = canvasRef.current;
  if (!canvas) return;

  const handleTouchStart = (e: TouchEvent) => {
    if (activeTool !== "text") return;
    e.preventDefault(); // works now — real listener, not passive
    const touch = e.touches[0];
    placeTextBox(touch.clientX, touch.clientY);
    triggerUpdate();
  };

  canvas.addEventListener("touchstart", handleTouchStart, { passive: false });

  return () => {
    canvas.removeEventListener("touchstart", handleTouchStart);
  };
}, [activeTool]);

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
    }, [box.id]); 

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

  useEffect(() => {
  const wrapper = wrapperRef.current;
  const canvas = canvasRef.current;
  if (!wrapper || !canvas) return;

  const resize = () => {
    const { width, height } = wrapper.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext("2d");
    ctx?.setTransform(dpr, 0, 0, dpr, 0, 0); // keep drawing coords in CSS pixels

    doRedraw();
  };

  resize(); // run once on mount too, in case initial size wasn't set yet

  const observer = new ResizeObserver(resize);
  observer.observe(wrapper);

  return () => observer.disconnect();
}, [doRedraw]);

  return (
    <div
      ref={wrapperRef}
      style={{
        position: "relative",
        touchAction: "none",
        overscrollBehavior: "none",
        width:"100%",
        height: "100%"
      }}
    >
      {toggleVideoTab&&!isSmallView && (
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


      <canvas
        ref={canvasRef}
        style={{
          cursor: getCursorStyle(activeTool),
          overscrollBehavior: "none",
          overflow: "hidden",
          backgroundColor: boardColor,
          width:"100%"
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

      {Object.entries(remoteCursors).map(([id, cursor]) => (
        <div
          key={id}
          style={{
            position: "absolute",
            left: cursor.x * camera.current.scale + camera.current.x,
            top: cursor.y * camera.current.scale + camera.current.y,
            pointerEvents: "none", // critical — don't let it block real clicks
            transition: "left 0.05s linear, top 0.05s linear", // smooths jitter between updates
            zIndex: 1000,
          }}
        >
          {/* cursor arrow shape */}
          <svg width="20" height="20" viewBox="0 0 20 20">
            <path
              d="M2,2 L2,16 L6,12 L9,18 L11,17 L8,11 L14,11 Z"
              fill={cursor.color}
            />
          </svg>
          {/* name label */}
          <div
            style={{
              background: cursor.color,
              color: "white",
              fontSize: 11,
              padding: "1px 6px",
              borderRadius: 4,
              marginTop: 2,
              whiteSpace: "nowrap",
            }}
          >
            {cursor.name}
          </div>
        </div>
      ))}
    </div>
  );
}
