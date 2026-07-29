import {
  createContext,
  useContext,
  useState,
  type SetStateAction,
  type Dispatch,
  type RefObject,
} from "react";
import type {
  BoardImage,
  Line,
  Shape,
  Stroke,
  TextBox,
} from "../components/room/Multicursor/types";
import { useRef } from "react";
type ToolSettings = {
  strokeColor: string;
  setStrokeColor: (value: string) => void;

  fillColor: string;
  setFillColor: (value: string) => void;

  shapeFillType: string;
  setShapeFillType: Dispatch<SetStateAction<string>>;

  strokeWidth: number;
  setStrokeWidth: (value: number) => void;

  opacity: number;
  setOpacity: (value: number) => void;

  shadeIdx: number;
  setShadeIdx: Dispatch<SetStateAction<number>>;

  fontFamily: string;
  setFontFamily: Dispatch<SetStateAction<string>>;

  fontSize: number;
  setFontSize: Dispatch<SetStateAction<number>>;

  textAlign: string;
  setTextAlign: Dispatch<SetStateAction<string>>;

  strokeStyle: string;
  setStrokeStyle: Dispatch<SetStateAction<string>>;

  arrowType: string;
  setArrowType: Dispatch<SetStateAction<string>>;

  arrowHead: string;
  setArrowHead: Dispatch<SetStateAction<string>>;

  edgeStyle: string;
  setEdgeStyle: Dispatch<SetStateAction<string>>;

  activeTool: string | null;
  setActiveTool: Dispatch<SetStateAction<string | null>>;

  selectedEle: Shape | Line | TextBox | BoardImage | null;
  setSelectedEle: Dispatch<
    SetStateAction<Shape | Line | TextBox | BoardImage | null>
  >;

  selectedId: RefObject<string | null>;

  linesRef: RefObject<Line[]>;
  activeLine: RefObject<Line | null>;

  textBoxesRef: RefObject<TextBox[]>;
  activeTextBox: RefObject<TextBox | null>;

  shapesRef: RefObject<Shape[]>;
  activeShape: RefObject<Shape | null>;

  //do redraw ref
  doRedrawRef: RefObject<(() => void) | null>;

  roomId: string | null;
  setRoomId: Dispatch<SetStateAction<string>>;

  //camera settings
  toggleVideoTab: boolean;
  setToggleVideoTab: Dispatch<SetStateAction<boolean>>;

  //offline
  isOffline: boolean;
  setIsOffline: Dispatch<SetStateAction<boolean>>;

  //layer settings
  layer: string;
  setLayer: Dispatch<SetStateAction<string>>;

  //miniMize video in mulicursor
  tabSize: string;
  setTabSize: Dispatch<SetStateAction<string>>;

  //viewMode
  viewMode: boolean;
  setViewMode: Dispatch<SetStateAction<boolean>>;

  //hambergermenu
  followUserCamera: string;
  setFollowUserCamera: Dispatch<SetStateAction<string>>;

  //tick mark toggle
  selectedMemId: string;
  setSelectedMemId: Dispatch<SetStateAction<string>>;

  //board colors
  boardColor: string;
  setBoardColor: Dispatch<SetStateAction<string>>;

  //board id
  activeSavedBoardId: RefObject<string | null>;
  activeBoardName: RefObject<string | null>;

  boardName: string;
  setBoardName: Dispatch<SetStateAction<string>>;

  strokes: RefObject<Stroke[]>;

    images: React.RefObject<BoardImage[]>;
};

const ToolBarLeftContext = createContext<ToolSettings | null>(null);

export function ToolSettingsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activeTool, setActiveTool] = useState<string | null>(null);

  const [strokeColor, setStrokeColor] = useState("");
  const [fillColor, setFillColor] = useState("transparent");
  const [strokeWidth, setStrokeWidth] = useState(4);
  const [opacity, setOpacity] = useState(100);
  const [shadeIdx, setShadeIdx] = useState(4);
  const [shapeFillType, setShapeFillType] = useState("transparent");
  const [fontFamily, setFontFamily] = useState("hand-drawn");
  const [fontSize, setFontSize] = useState(20);
  const [textAlign, setTextAlign] = useState("left");
  const [strokeStyle, setStrokeStyle] = useState("solid");
  const [arrowType, setArrowType] = useState("sharp");
  const [arrowHead, setArrowHead] = useState("none");
  const [edgeStyle, setEdgeStyle] = useState("sharp");

  const [selectedEle, setSelectedEle] = useState<
    Shape | Line | TextBox | BoardImage | null
  >(null);

  const selectedId = useRef<string | null>(null);

  const shapesRef = useRef<Shape[]>([]);
  const activeShape = useRef<Shape | null>(null);
  const textBoxesRef = useRef<TextBox[]>([]);
  const activeTextBox = useRef<TextBox | null>(null);
  const linesRef = useRef<Line[]>([]);
  const activeLine = useRef<Line | null>(null);

    const images = useRef<BoardImage[]>([]);

  const doRedrawRef = useRef<(() => void) | null>(null);
  const [roomId, setRoomId] = useState<string>("");

  const [toggleVideoTab, setToggleVideoTab] = useState(true);
  const [isOffline, setIsOffline] = useState(false);

  const [layer, setLayer] = useState("");

  const [tabSize, setTabSize] = useState("");

  const [viewMode, setViewMode] = useState(true);
  const strokes = useRef<Stroke[]>([]);


  //hamberger menu
  const [followUserCamera, setFollowUserCamera] = useState("");
  const [selectedMemId, setSelectedMemId] = useState("");
  const [boardColor, setBoardColor] = useState("#374151");
  const activeSavedBoardId = useRef<string | null>(null);
  const activeBoardName = useRef<string | null>(null);
  const [boardName, setBoardName] = useState("");


  return (
    <ToolBarLeftContext.Provider
      value={{
        activeTool,
        setActiveTool,
        strokeColor,
        setStrokeColor,
        fillColor,
        setFillColor,
        strokeWidth,
        setStrokeWidth,
        opacity,
        setOpacity,
        shadeIdx,
        setShadeIdx,
        shapeFillType,
        setShapeFillType,
        fontFamily,
        setFontFamily,
        fontSize,
        setFontSize,
        textAlign,
        setTextAlign,
        strokeStyle,
        setStrokeStyle,
        arrowType,
        setArrowType,
        arrowHead,
        setArrowHead,
        edgeStyle,
        setEdgeStyle,
        selectedEle,
        setSelectedEle,
        selectedId,
        shapesRef,
        activeShape,
        textBoxesRef,
        activeTextBox,
        linesRef,
        activeLine,
        doRedrawRef,
        roomId,
        setRoomId,
        toggleVideoTab,
        setToggleVideoTab,
        isOffline,
        setIsOffline,
        layer,
        setLayer,
        tabSize,
        setTabSize,
        viewMode,
        setViewMode,
        followUserCamera,
        setFollowUserCamera,
        selectedMemId,
        setSelectedMemId,
        boardColor,
        setBoardColor,
        activeSavedBoardId,
        activeBoardName,
        boardName,
        setBoardName,
        strokes,
        images
      }}
    >
      {children}
    </ToolBarLeftContext.Provider>
  );
}

export function useToolSettings() {
  const ctx = useContext(ToolBarLeftContext);
  if (!ctx)
    throw new Error("useToolSettings must be used inside ToolSettingsProvider");
  return ctx;
}
