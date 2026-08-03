import {
  ArrowDownToLine,
  ArrowUpToLine,
  ArrowDown,
  ArrowUp,
  Trash2,
} from "lucide-react";
import { useLayers } from "../../Multicursor/hooks/useLayers";
import { useCompactToolDelete } from "../hooks/useCompactToolDelete";
import { useToolSettings } from "../../../../context/ToolBarLeftContext";

export default function LayerControls({activeTool}: {activeTool: string|null}) {
  const layers = useLayers();
  if (!layers) return null;
  const {handleDelete}=useCompactToolDelete();
  const {selectedEle}=useToolSettings();
  const { sendToBack, sendBackward, bringForward, bringToFront } = layers;
  return (
    <div className={`${activeTool === "image" ? "absolute text-white rounded-2xl bg-[#1f1f2b] p-3 shadow-xl left-3 top-1/4 z-20" : ""}`} >
      <span className="mb-2 mt-2 ml-1 text-sm text-gray-300">Layers</span>
      <div className={`flex ${activeTool === "image" ? "max-[768px]:flex-col max-[768px]:gap-2 flex-col" : ""} gap-3 mt-2`}>
        <div
          className={`icon-background ${activeTool === "image" ? "max-[768px]:flex max-[768px]:justify-center content-center " : ""} p-0.5 rounded bg-[rgb(51,52,55)]`}
          onClick={sendToBack}
        >
          <ArrowDownToLine className="icon " strokeWidth={2} />
        </div>

        <div
          className={`icon-background ${activeTool === "image" ? "max-[768px]:flex max-[768px]:justify-center content-center " : ""} p-0.5 rounded  bg-[rgb(51,52,55)]`}
          onClick={sendBackward}
        >
          <ArrowDown className="icon" strokeWidth={2} />
        </div>

        <div
          className={`icon-background ${activeTool === "image" ? "max-[768px]:flex max-[768px]:justify-center content-center " : ""} p-0.5 rounded  bg-[rgb(51,52,55)]`}
          onClick={bringForward}
        >
          <ArrowUp className="icon" strokeWidth={2} />
        </div>

        <div
          className={`icon-background ${activeTool === "image" ? "max-[768px]:flex max-[768px]:justify-center content-center " : ""} p-0.5 rounded  bg-[rgb(51,52,55)]`}
          onClick={bringToFront}
        >
          <ArrowUpToLine className="icon" strokeWidth={2} />
        </div>
        {selectedEle&&activeTool === "image" && (
        <div className="w-full h-8 min-[768px]:hidden flex justify-center" onClick={handleDelete}>
          <Trash2 />
        </div>
      )}
      </div>
    </div>
  );
}
