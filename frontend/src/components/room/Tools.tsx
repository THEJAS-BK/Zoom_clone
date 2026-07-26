//lucide react components
import {
  Circle,
  Diamond,
  Menu,
  Minus,
  MoveRight,
  Pencil,
  Square,
  TypeOutline,
} from "lucide-react";
import { Image, Eraser, MousePointer, Hand } from "lucide-react";
import { useEffect, useState } from "react";
import { useToolSettings } from "../../context/ToolBarLeftContext";

export default function Tools() {
  const { activeTool, setActiveTool, selectedEle, setSelectedEle } =
    useToolSettings();

  return (
    <>
      <div className="flex items-center gap-1 bg-black rounded-2xl border border-gray-800 px-2 py-2 shadow-lg">
        {/* Selection / navigation */}
        <div className="flex items-center gap-1">
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
            className={activeTool === "hand" ? "tool-btn-active" : "tool-btn"}
          >
            <Hand size={18} />
          </button>
        </div>

        <div className="w-px h-6 bg-gray-700 mx-1" />

        {/* Freehand / text / eraser */}
        <div className="flex items-center gap-1">
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

        <div className="w-px h-6 bg-gray-700 mx-1" />

        {/* Lines / arrows */}
        <div className="flex items-center gap-1">
          <button
            title="Arrow (A)"
            onClick={() => {
              if (selectedEle) setSelectedEle(null);
              setActiveTool("arrow");
            }}
            className={activeTool === "arrow" ? "tool-btn-active" : "tool-btn"}
          >
            <MoveRight size={18} />
          </button>
          <button
            title="Line (L)"
            onClick={() => {
              if (selectedEle) setSelectedEle(null);
              setActiveTool("line");
            }}
            className={activeTool === "line" ? "tool-btn-active" : "tool-btn"}
          >
            <Minus size={18} />
          </button>
        </div>

        <div className="w-px h-6 bg-gray-700 mx-1" />

        {/* Shapes */}
        <div className="flex items-center gap-1">
          <button
            title="Rectangle (R)"
            onClick={() => {
              if (selectedEle) setSelectedEle(null);
              setActiveTool("square");
            }}
            className={activeTool === "square" ? "tool-btn-active" : "tool-btn"}
          >
            <Square size={18} />
          </button>
          <button
            title="Diamond (D)"
            onClick={() => {
              if (selectedEle) setSelectedEle(null);
              setActiveTool("diamond");
            }}
            className={
              activeTool === "diamond" ? "tool-btn-active" : "tool-btn"
            }
          >
            <Diamond size={18} />
          </button>
          <button
            title="Circle (O)"
            onClick={() => {
              if (selectedEle) setSelectedEle(null);
              setActiveTool("circle");
            }}
            className={activeTool === "circle" ? "tool-btn-active" : "tool-btn"}
          >
            <Circle size={18} />
          </button>
        </div>

        <div className="w-px h-6 bg-gray-700 mx-1" />

        {/* Image upload */}
        <label
          htmlFor="image-upload"
          title="Insert image"
          className="tool-btn flex items-center justify-center cursor-pointer"
        >
          <Image size={18} />
        </label>
      </div>
    </>
  );
}
