type Point = {
  x: number;
  y: number;
};

type Stroke = {
  userId: string;
  color: string;
  strokeWidth:number;
  opacity:number;
  points: Point[];
};

type ActiveStroke = {
  color: string;
  strokeWidth:number;
  opacity:number;
  points: Point[];
};

type BoardImage = {
  id: string;
  image: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number | 0;
};

interface TextBox {
  id: string;
  type: "textbox";
  x: number;
  y: number;
  text: string;
  fontSize: number;
  color: string;
  userId: string;
  textAlign:string;
  fontFamily:string;
  zIndex:number;
opacity:number;
  rotation?:number;
}

type FontFamily = "hand-drawn" | "normal" | "code" | "serif";

interface Shape {
  id: string;
  type: "shape";
  shapeType: "square" | "circle" | "diamond";
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  rotation:number;
  fillColor:string;
  edgeStyle:string;
  strokeWidth:number;
  strokeStyle:string;
    zIndex:number;
  opacity:number;
  userId: string;
}
interface Line {
  id: string;
  type: "line";
  lineType: "straight" | "arrow";
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  cpx?: number;
  cpy?: number;
  color: string;
  strokeWidth: number;
  lineStyle:string;
  arrowType:string;
  arrowHead:string;
  userId: string;
  zIndex:number;
  opacity:number;
   points?: { x: number; y: number }[];
}

type CanvasElement = TextBox | Shape | Line;

// ---- 5. sync toolbar state to whatever got selected ----
interface ToolSetters {
  setFillColor: (v: Shape["fillColor"]) => void;
  setStrokeWidth: (v: number) => void;
  setStrokeStyle: (v: any) => void;
  setEdgeStyle: (v: Shape["edgeStyle"]) => void;
  setOpacity: (v: number) => void;
  setFontFamily: (v: TextBox["fontFamily"]) => void;
  setFontSize: (v: TextBox["fontSize"]) => void;
  setTextAlign: (v: TextBox["textAlign"]) => void;
  setArrowType: (v: Line["arrowType"]) => void;
  setArrowHead: (v: Line["arrowHead"]) => void;
}

export type {
  Point,
  Stroke,
  ActiveStroke,
  BoardImage,
  TextBox,
  Shape,
  Line,
  CanvasElement,
  FontFamily,
  ToolSetters
};


export type Participants={
  socketId:string;
  userId:string;
  name:string;
}