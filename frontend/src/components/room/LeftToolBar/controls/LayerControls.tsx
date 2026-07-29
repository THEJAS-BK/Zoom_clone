import {
  ArrowDownToLine,
  ArrowUpToLine,
  ArrowDown,
  ArrowUp,
} from "lucide-react";
import { useLayers } from "../../Multicursor/hooks/useLayers";

export default function LayerControls({activeTool}: {activeTool: string|null}) {
  const layers = useLayers();
  if (!layers) return null;
  const { sendToBack, sendBackward, bringForward, bringToFront } = layers;
  return (
    <div className={`${activeTool === "image" ? "absolute text-white rounded-2xl bg-[#1f1f2b] p-3 shadow-xl left-3 top-1/4 z-20" : ""}`} >
      <span className="mb-2 mt-2 ml-1 text-sm text-gray-300">Layers</span>
      <div className="flex gap-3 mt-2">
        <div
          className="icon-background p-0.5 rounded  bg-[rgb(51,52,55)]"
          onClick={sendToBack}
        >
          <ArrowDownToLine className="icon" strokeWidth={2} />
        </div>

        <div
          className="icon-background p-0.5 rounded  bg-[rgb(51,52,55)]"
          onClick={sendBackward}
        >
          <ArrowDown className="icon" strokeWidth={2} />
        </div>

        <div
          className="icon-background p-0.5 rounded  bg-[rgb(51,52,55)]"
          onClick={bringForward}
        >
          <ArrowUp className="icon" strokeWidth={2} />
        </div>

        <div
          className="icon-background p-0.5 rounded  bg-[rgb(51,52,55)]"
          onClick={bringToFront}
        >
          <ArrowUpToLine className="icon" strokeWidth={2} />
        </div>
      </div>
    </div>
  );
}
