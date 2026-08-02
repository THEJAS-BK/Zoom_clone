import FullToolBar from "./Layouts/FullToolBar";
import { useToolSettings } from "../../../context/ToolBarLeftContext";
import CompactToolBar from "./Layouts/CompactToolBar";
import { useEffect, useRef, useState } from "react";
import LayerControls from "./controls/LayerControls";
import SmallToolBar from "./Layouts/smallToolBar";

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(
    () => window.matchMedia(query).matches,
  );

  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [query]);

  return matches;
}

export default function ToolBarContainer() {
  const { activeTool, selectedEle } = useToolSettings();
  const lastTool = useRef<string | null>(null);

  const isCompactView = useMediaQuery(
    "(min-width: 601px) and (max-width: 1024px)",
  );
  const isSmallView = useMediaQuery("(max-width: 600px)");

  if (selectedEle?.type === "shape") {
    lastTool.current = selectedEle.shapeType;
  } else if (selectedEle?.type === "line") {
    lastTool.current = selectedEle.lineType;
  } else if (selectedEle?.type === "textbox") {
    lastTool.current = "text";
  } else if (selectedEle?.type === "image") {
    lastTool.current = "image";
  }

  if (selectedEle === null || activeTool !== "mouse") {
    lastTool.current = null;
  }

  const displayTool = lastTool.current || activeTool;

  return (
    <div>
      {isSmallView ? (
        <SmallToolBar displayTool={displayTool} />
      ) : isCompactView ? (
        <CompactToolBar displayTool={displayTool} />
      ) : (
        <FullToolBar displayTool={displayTool} />
      )}

      {selectedEle?.type === "image" ? (
        <LayerControls activeTool={"image"} />
      ) : null}
    </div>
  );
}
