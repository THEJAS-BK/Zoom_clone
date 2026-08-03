import ColorSwatches from "../controls/ColorSwatches";
import StrokeWidth from "../controls/StrokeWidth";
import OpacitySlider from "../controls/OpacitySlider";
import LayerControls from "../controls/LayerControls";
import FontSetting from "../controls/FontSetting";
import StrokeStyle from "../controls/StrokeStyle";
import ArrowSetting from "../controls/ArrowSetting";
import EdgeSetting from "../controls/EdgeSetting";

export default function FullToolBar({
  displayTool,
}: {
  displayTool: string | null;
}) {
  const tools = ["pen", "text", "arrow", "line", "square", "diamond", "circle","straight"];

  return (
    <div
      className={`toolbar-scroll absolute text-white left-3 top-20 flex flex-col rounded-2xl bg-[#1f1f2b] shadow-xl ${tools.includes(displayTool ?? "") ? "p-3" : "hidden"} z-20`}
    >
      {displayTool === "pen" && (
        <>
          <ColorSwatches activeTool={"pen"} />
          <StrokeWidth />
          <OpacitySlider />
          <LayerControls activeTool={displayTool} />
        </>
      )}
      {displayTool === "text" && (
        <>
          <ColorSwatches activeTool={"text"} />
          <FontSetting />
          <OpacitySlider />
          <LayerControls activeTool={displayTool} />
        </>
      )}
      {displayTool === "arrow" && (
        <>
          <ColorSwatches activeTool={"arrow"} />
          <StrokeWidth />
          <StrokeStyle />
          <ArrowSetting activeTool={"arrow"} />
          <OpacitySlider />
          <LayerControls activeTool={displayTool} />
        </>
      )}
      {(displayTool === "line" || displayTool === "straight") && (
        <>
          <ColorSwatches activeTool={displayTool} />
          <StrokeWidth />
          <StrokeStyle />
          <EdgeSetting />
          <OpacitySlider />
          <LayerControls activeTool={displayTool} />
        </>
      )}
      {displayTool === "square" && (
        <>
          <ColorSwatches activeTool={"square"} />
          <StrokeWidth />
          <StrokeStyle />
          <ArrowSetting activeTool={"square"} />
          <EdgeSetting />
          <OpacitySlider />
          <LayerControls activeTool={displayTool} />
        </>
      )}
      {displayTool === "diamond" && (
        <>
          <ColorSwatches activeTool={"diamond"} />

          <StrokeWidth />
          <StrokeStyle />
          <ArrowSetting activeTool={"diamond"} />
          <EdgeSetting />
          <OpacitySlider />
          <LayerControls activeTool={displayTool} />
        </>
      )}
      {displayTool === "circle" && (
        <>
          <ColorSwatches activeTool={"circle"} />

          <StrokeWidth />
          <StrokeStyle />
          <ArrowSetting activeTool={"circle"} />
          <OpacitySlider />
          <LayerControls activeTool={displayTool} />
        </>
      )}
    </div>
  );
}
