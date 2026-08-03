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
import useMediaQuery from "@mui/material/useMediaQuery";
import { ToolGroupDropdown } from "./ToolGroupDropDown";
export default function Tools({
  setIsImageUploadInterfaceOpen,
}: {
  setIsImageUploadInterfaceOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { activeTool, setActiveTool, selectedEle, setSelectedEle } =
    useToolSettings();
  const isNarrow = useMediaQuery("(max-width: 550px)");
  function selectTool(tool: string) {
    if (selectedEle) setSelectedEle(null);
    setActiveTool(tool);
  }
  return (
    <>
      <div className="toolbar-compact flex items-center gap-0.5 bg-black rounded-xl border border-gray-800 px-1.5 py-1.5 shadow-lg">
        {/* Selection / navigation */}
        <div className="flex items-center gap-0.5">
          <button
            title="Select (V)"
            onClick={() => setActiveTool("mouse")}
            className={activeTool === "mouse" ? "tool-btn-active" : "tool-btn"}
          >
            <MousePointer size={18} />
          </button>
          <button
            title="Hand / pan (H)"
            onClick={() => {
              if (selectedEle) setSelectedEle(null);
              setActiveTool("hand");
            }}
            className={`!hidden min-[451px]:!inline-flex ${activeTool === "hand" ? "tool-btn-active" : "tool-btn"}`}
          >
            <Hand size={18} />
          </button>
        </div>

        <div className="w-px h-6 bg-gray-700 mx-0.5" />

        {/* Freehand / text / eraser */}
        <div className="flex items-center gap-0.5">
          <button
            title="Draw (P)"
            onClick={() => {
              if (selectedEle) setSelectedEle(null);
              setActiveTool("pen");
            }}
            className={activeTool === "pen" ? "tool-btn-active" : "tool-btn"}
          >
            <Pencil size={18} />
          </button>
          <button
            title="Text (T)"
            onClick={() => {
              if (selectedEle) setSelectedEle(null);
              setActiveTool("text");
            }}
            className={activeTool === "text" ? "tool-btn-active" : "tool-btn"}
          >
            <TypeOutline size={18} />
          </button>
          <button
            title="Eraser (E)"
            onClick={() => {
              if (selectedEle) setSelectedEle(null);
              setActiveTool("eraser");
            }}
            className={activeTool === "eraser" ? "tool-btn-active" : "tool-btn"}
          >
            <Eraser size={18} />
          </button>
        </div>

        <div className="w-px h-6 bg-gray-700 mx-0.5" />

        {/* Lines / arrows */}
        {isNarrow ? (
          <ToolGroupDropdown
            activeTool={activeTool}
            onSelect={selectTool}
            tools={[
              {
                name: "arrow",
                title: "Arrow (A)",
                icon: <MoveRight size={18} />,
              },
              { name: "line", title: "Line (L)", icon: <Minus size={18} /> },
            ]}
          />
        ) : (
          <div className="flex items-center gap-0.5">
            <button
              title="Arrow (A)"
              onClick={() => selectTool("arrow")}
              className={
                activeTool === "arrow" ? "tool-btn-active" : "tool-btn"
              }
            >
              <MoveRight size={18} />
            </button>
            <button
              title="Line (L)"
              onClick={() => selectTool("line")}
              className={activeTool === "line" ? "tool-btn-active" : "tool-btn"}
            >
              <Minus size={18} />
            </button>
          </div>
        )}

        {isNarrow ? (
          <ToolGroupDropdown
            activeTool={activeTool}
            onSelect={selectTool}
            tools={[
              {
                name: "square",
                title: "Rectangle (R)",
                icon: <Square size={18} />,
              },
              {
                name: "diamond",
                title: "Diamond (D)",
                icon: <Diamond size={18} />,
              },
              {
                name: "circle",
                title: "Circle (O)",
                icon: <Circle size={18} />,
              },
            ]}
          />
        ) : (
          <div className="flex items-center gap-0.5">
            <button
              title="Rectangle (R)"
              onClick={() => selectTool("square")}
              className={
                activeTool === "square" ? "tool-btn-active" : "tool-btn"
              }
            >
              <Square size={18} />
            </button>
            <button
              title="Diamond (D)"
              onClick={() => selectTool("diamond")}
              className={
                activeTool === "diamond" ? "tool-btn-active" : "tool-btn"
              }
            >
              <Diamond size={18} />
            </button>
            <button
              title="Circle (O)"
              onClick={() => selectTool("circle")}
              className={
                activeTool === "circle" ? "tool-btn-active" : "tool-btn"
              }
            >
              <Circle size={18} />
            </button>
          </div>
        )}

        <div className="w-px h-6 bg-gray-700 mx-0.5" />

        <div
          title="Insert image"
          className="tool-btn flex items-center justify-center cursor-pointer"
          onClick={() => setIsImageUploadInterfaceOpen(true)}
        >
          <Image size={18} />
        </div>
      </div>
    </>
  );
}
