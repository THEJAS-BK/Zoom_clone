import FullToolBar from "./Layouts/FullToolBar";
import { useToolSettings } from "../../../context/ToolBarLeftContext";
import CompactToolBar from "./Layouts/CompactToolBar";
import { useEffect, useRef, useState } from "react";

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [query]);

  return matches;
}

export default function ToolBarContainer() {
  const { activeTool, selectedEle  } = useToolSettings();
  const lastTool = useRef<string | null>(null);
  
  const isCompactView = useMediaQuery("(max-width: 1024px)");

  if (selectedEle?.type === "shape") {
    lastTool.current = selectedEle.shapeType;
  } else if (selectedEle?.type === "line") {
    lastTool.current = selectedEle.lineType;
  } else if (selectedEle?.type === "textbox") {
    lastTool.current = "text";
  } 
  
  if (selectedEle === null||activeTool!=="mouse") {
    lastTool.current = null; 
  }


  const displayTool = lastTool.current || activeTool  ;



  return (
    <div >
      {isCompactView ? (
        <CompactToolBar displayTool={displayTool} />
      ) : (
        <FullToolBar displayTool={displayTool} />
      )}
    </div>
  );
}
