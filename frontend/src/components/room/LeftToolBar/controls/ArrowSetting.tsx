import {
  MoveUpRight,
  CornerUpRight,
  MoveRight,
  MoveHorizontal,
} from "lucide-react";
import { useToolSettings } from "../../../../context/ToolBarLeftContext";
import { ZigzagArrow } from "../../../icons/ZigzagArrow";

export default function ArrowSetting({ activeTool }: { activeTool: string }) {
  const { arrowType, setArrowType, arrowHead, setArrowHead } =
    useToolSettings();
  return (
    <div>
      <div className="mt-2">
        <span className="mb-2 text-sm  text-gray-300 ">Arrow type</span>
        <div className="flex gap-4">
          <div
            onClick={() => setArrowType("sharp")}
            className={`icon-background p-0.5 rounded   ${arrowType === "sharp" ? "bg-[rgb(65,65,137)]" : "bg-[rgb(51,52,55)]"} `}
          >
            <MoveUpRight className="icon" />
          </div>
          <div
            onClick={() => setArrowType("curve")}
            className={`icon-background p-0.5 rounded   ${arrowType === "curve" ? "bg-[rgb(65,65,137)]" : "bg-[rgb(51,52,55)]"} `}
          >
            <CornerUpRight className="icon" />
          </div>
          <div
            onClick={() => setArrowType("elbow")}
            className={`icon-background p-0.5 rounded   ${arrowType === "elbow" ? "bg-[rgb(65,65,137)]" : "bg-[rgb(51,52,55)]"} `}
          >
            <ZigzagArrow />
          </div>
        </div>
      </div>

      {activeTool !== "line" && activeTool !== "straight" && (
        <div className="mt-2">
          <span className="mb-2 text-sm  text-gray-300 ">Arrowheads</span>
          <div className="flex gap-4">
            <div
              onClick={() => setArrowHead("none")}
              className={`icon-background p-0.5 rounded   ${arrowHead === "none" ? "bg-[rgb(65,65,137)]" : "bg-[rgb(51,52,55)]"} `}
            >
              {" "}
              <MoveRight className="icon" />
            </div>
            <div
              onClick={() => setArrowHead("classic")}
              className={`icon-background p-0.5 rounded   ${arrowHead === "classic" ? "bg-[rgb(65,65,137)]" : "bg-[rgb(51,52,55)]"} `}
            >
              <MoveHorizontal />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
