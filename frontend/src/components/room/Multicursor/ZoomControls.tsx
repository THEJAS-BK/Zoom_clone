import { useState } from "react";
import { Minus, Plus, Undo2, Redo2 } from "lucide-react";
import { useToolSettings } from "../../../context/ToolBarLeftContext";

const MIN_SCALE = 0.2;
const MAX_SCALE = 5;
const ZOOM_STEP = 0.1;

export default function ZoomControls({
  canvasRef,
  camera,
  doRedraw,
}: {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  camera: React.RefObject<{ x: number; y: number; scale: number }>;
  doRedraw: () => void;
}) {
  const [, forceUpdate] = useState(0);

  const {viewMode}=useToolSettings();

  const zoomBy = (delta: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const oldScale = camera.current.scale;
    const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, oldScale + delta));
    if (newScale === oldScale) return;

    const rect = canvas.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const worldX = (centerX - camera.current.x) / oldScale;
    const worldY = (centerY - camera.current.y) / oldScale;

    camera.current.scale = newScale;
    camera.current.x = centerX - worldX * newScale;
    camera.current.y = centerY - worldY * newScale;

    doRedraw();
    forceUpdate((n) => n + 1);
  };

  const zoomIn = () => zoomBy(ZOOM_STEP);
  const zoomOut = () => zoomBy(-ZOOM_STEP);

  const percentage = Math.round(camera.current.scale * 100);

return (
  <>
    {viewMode && (
      <div className="absolute bottom-3 left-5.5 flex items-center gap-3">
        <div className="flex items-center gap-1 bg-black rounded-2xl border border-gray-800 shadow-lg px-2 py-2 text-white">
          <button
            onClick={zoomOut}
            title="Zoom out"
            disabled={camera.current.scale <= MIN_SCALE}
            className="tool-btn"
          >
            <Minus size={18} />
          </button>

          <span className="w-12 text-center text-sm tabular-nums select-none text-gray-300">
            {percentage}%
          </span>

          <button
            onClick={zoomIn}
            title="Zoom in"
            disabled={camera.current.scale >= MAX_SCALE}
            className="tool-btn"
          >
            <Plus size={18} />
          </button>
        </div>

        <div className="flex items-center gap-1 bg-black rounded-2xl border border-gray-800 shadow-lg px-2 py-2 text-white">
          <button
            // onClick={undo}
            title="Undo"
            // disabled={!canUndo}
            className="tool-btn"
          >
            <Undo2 size={18} />
          </button>

          <button
            // onClick={redo}
            title="Redo"
            // disabled={!canRedo}
            className="tool-btn"
          >
            <Redo2 size={18} />
          </button>
        </div>
      </div>
    )}
  </>
);
}