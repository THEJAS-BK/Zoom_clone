import { useToolSettings } from "../../../../context/ToolBarLeftContext";
import { Minus } from "lucide-react";
import { DashedLine } from "../../../icons/DashedLine";
import { DottedLine } from "../../../icons/DottedLine";
export default function StrokeStyle() {
    const {strokeStyle,setStrokeStyle}=useToolSettings();

  return (
  <div>
    <span className="mb-2 text-sm font-sm text-gray-300">Stroke style</span>
    <div className="flex gap-4">
      <div
        onClick={() => setStrokeStyle("solid")}
        className={`icon-background p-0.5 rounded ${strokeStyle === "solid" ? "bg-[rgb(65,65,137)]" : "bg-[rgb(51,52,55)]"}`}
      >
        <Minus strokeWidth={3} />
      </div>
      <div
        onClick={() => setStrokeStyle("dashed")}
        className={`icon-background p-0.5 rounded ${strokeStyle === "dashed" ? "bg-[rgb(65,65,137)]" : "bg-[rgb(51,52,55)]"}`}
      >
        <DashedLine strokeWidth={3} />
      </div>
      <div
        onClick={() => setStrokeStyle("dotted")}
        className={`icon-background p-0.5 rounded ${strokeStyle === "dotted" ? "bg-[rgb(65,65,137)]" : "bg-[rgb(51,52,55)]"}`}
      >
        <DottedLine strokeWidth={3} />
      </div>
    </div>
  </div>
);
}
