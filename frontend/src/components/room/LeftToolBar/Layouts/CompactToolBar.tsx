import { Settings2, Trash2 } from "lucide-react";
import ColorGrid from "../controls/ColorGrid";
import { useEffect, useState } from "react";
import StrokeWidth from "../controls/StrokeWidth";
import OpacitySlider from "../controls/OpacitySlider";
import LayerControls from "../controls/LayerControls";
import FontSetting from "../controls/FontSetting";
import StrokeStyle from "../controls/StrokeStyle";
import ArrowSetting from "../controls/ArrowSetting";
import EdgeSetting from "../controls/EdgeSetting";
import { HachureIcon } from "../tools/HachureIcon";
import { useToolSettings } from "../../../../context/ToolBarLeftContext";
import { useCompactToolDelete } from "../hooks/useCompactToolDelete";
import { transparentPattern } from "../tools/colors";
import { useRef } from "react";

export default function CompactToolBar({
  displayTool,
}: {
  displayTool: string | null;
}) {
  const [panel, setPanel] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  const toggle = (panel: string) => {
    setPanel((prev) => (prev === panel ? null : panel));
  };

  const { handleDelete } = useCompactToolDelete();
  const { selectedEle, fillColor, strokeColor } = useToolSettings();
  const swatchStyle = () =>
    fillColor === "transparent"
      ? transparentPattern
      : { backgroundColor: fillColor };

  const tools = ["pen", "text","straight", "arrow", "line", "square", "diamond", "circle"];

  useEffect(() => {
    if (panel === "") return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setPanel("");
      }
    };

    window.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [panel]);

  return (
    <div
      ref={containerRef}
      className={`absolute text-white rounded-2xl bg-[#1f1f2b] p-3 shadow-xl left-3 top-1/4 flex flex-col z-20 ${tools.includes(displayTool ?? "") ? "p-2" : "hidden"}  gap-3`}
    >
      <div
        className={`
    relative w-8 h-8 rounded-lg flex items-center justify-center
    transition-colors cursor-pointer 
    ${panel === "strokes" ? "bg-neutral-800 ring-1 ring-neutral-600" : "hover:bg-neutral-800/60"}
  `}
        onClick={() => toggle("strokes")}
        style={{ backgroundColor: strokeColor }}
      >
        <HachureIcon />
      </div>
      <div
        className="w-8 h-8 rounded relative"
        style={swatchStyle()}
        onClick={() => toggle("background")}
      >
        <div
          className=" relative left-full top-0 bg-red-600"
          onClick={(e) => e.stopPropagation()}
        ></div>
      </div>

      <div className="relative w-8 h-8" onClick={() => toggle("settings")}>
        <Settings2 />
        <div
          className={`absolute text-white left-[150%] w-[170px] top-0 flex flex-col justify-center rounded-2xl bg-[#1f1f2b] shadow-xl ${panel === "settings" ? "p-4" : "hidden"} z-20`}
          onClick={(e) => e.stopPropagation()}
        >
          {panel === "settings" && (
            <>
              {displayTool === "pen" && (
                <>
                  <StrokeWidth />
                  <OpacitySlider />
                  <LayerControls activeTool={displayTool} />
                </>
              )}

              {displayTool === "text" && (
                <>
                  <FontSetting />
                  <OpacitySlider />
                  <LayerControls activeTool={displayTool} />
                </>
              )}

              {displayTool === "arrow" && (
                <>
                  <StrokeWidth />
                  <StrokeStyle />
                  <ArrowSetting activeTool={displayTool} />
                  <OpacitySlider />
                  <LayerControls activeTool={displayTool} />
                </>
              )}

              {(displayTool === "line" || displayTool === "straight") && (
                <>               
                  <StrokeWidth />
                  <StrokeStyle />
                  <ArrowSetting activeTool={displayTool} />
                  <EdgeSetting />
                  <OpacitySlider />
                  <LayerControls activeTool={displayTool} />
                </>
              )}

              {(displayTool === "square" || displayTool === "diamond") && (
                <>
                  <StrokeWidth />
                  <StrokeStyle />
                  <EdgeSetting />
                  <OpacitySlider />
                  <LayerControls activeTool={displayTool}   />
                </>
              )}

              {displayTool === "circle" && (
                <>
                  <StrokeWidth />
                  <StrokeStyle />
                  <OpacitySlider />
                  <LayerControls activeTool={displayTool} />
                </>
              )}
            </>
          )}
        </div>
      </div>
      {selectedEle && (
        <div className="w-8 h-8" onClick={handleDelete}>
          <Trash2 />
        </div>
      )}
      {panel === "strokes" && <ColorGrid isMostUsedColorsNeeded={true} />}
      {panel === "background" && <ColorGrid isMostUsedColorsNeeded={false} />}
    </div>
  );
}
