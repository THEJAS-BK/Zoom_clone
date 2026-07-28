//lucide react components
import {
  Circle,
  Diamond,
  Minus,
  MoveRight,
  Pencil,
  Square,
  TypeOutline,
} from "lucide-react";
import { Image, Eraser, MousePointer, Hand } from "lucide-react";

import { useToolSettings } from "../../context/ToolBarLeftContext";

export default function OfflineTools({ setIsImageUploadInterfaceOpen }: { setIsImageUploadInterfaceOpen: React.Dispatch<React.SetStateAction<boolean>> }) {
  const { activeTool, setActiveTool } = useToolSettings();

  return (
    <div className="flex items-center gap-1 bg-black rounded-2xl border border-gray-800 px-2 py-2 shadow-lg">
      {/* Selection / navigation */}
      <div className="flex items-center gap-1">
        <button
          title="Select"
          onClick={() => setActiveTool("mouse")}
          className={activeTool === "mouse" ? "tool-btn-active" : "tool-btn"}
        >
          <MousePointer size={18} />
        </button>
        <button
          title="Hand / pan"
          onClick={() => setActiveTool("hand")}
          className={activeTool === "hand" ? "tool-btn-active" : "tool-btn"}
        >
          <Hand size={18} />
        </button>
      </div>

      <div className="w-px h-6 bg-gray-700 mx-1" />

      {/* Freehand / text / eraser */}
      <div className="flex items-center gap-1">
        <button
          title="Draw"
          onClick={() => setActiveTool("pen")}
          className={activeTool === "pen" ? "tool-btn-active" : "tool-btn"}
        >
          <Pencil size={18} />
        </button>
        <button
          title="Text"
          onClick={() => setActiveTool("text")}
          className={activeTool === "text" ? "tool-btn-active" : "tool-btn"}
        >
          <TypeOutline size={18} />
        </button>
        <button
          title="Eraser"
          onClick={() => setActiveTool("eraser")}
          className={activeTool === "eraser" ? "tool-btn-active" : "tool-btn"}
        >
          <Eraser size={18} />
        </button>
      </div>

      <div className="w-px h-6 bg-gray-700 mx-1" />

      {/* Lines / arrows */}
      <div className="flex items-center gap-1">
        <button
          title="Arrow"
          onClick={() => setActiveTool("arrow")}
          className={activeTool === "arrow" ? "tool-btn-active" : "tool-btn"}
        >
          <MoveRight size={18} />
        </button>
        <button
          title="Line"
          onClick={() => setActiveTool("line")}
          className={activeTool === "line" ? "tool-btn-active" : "tool-btn"}
        >
          <Minus size={18} />
        </button>
      </div>

      <div className="w-px h-6 bg-gray-700 mx-1" />

      {/* Shapes */}
      <div className="flex items-center gap-1">
        <button
          title="Rectangle"
          onClick={() => setActiveTool("square")}
          className={activeTool === "square" ? "tool-btn-active" : "tool-btn"}
        >
          <Square size={18} />
        </button>
        <button
          title="Diamond"
          onClick={() => setActiveTool("diamond")}
          className={activeTool === "diamond" ? "tool-btn-active" : "tool-btn"}
        >
          <Diamond size={18} />
        </button>
        <button
          title="Circle"
          onClick={() => setActiveTool("circle")}
          className={activeTool === "circle" ? "tool-btn-active" : "tool-btn"}
        >
          <Circle size={18} />
        </button>
      </div>

      <div className="w-px h-6 bg-gray-700 mx-1" />

      {/* Image upload */}
       <div
          title="Insert image"
          className="tool-btn flex items-center justify-center cursor-pointer"
          onClick={() => setIsImageUploadInterfaceOpen(true)}
        >
          <Image size={18} />
        </div>
    </div>
  );
}