import { useToolSettings } from "../../../../context/ToolBarLeftContext";
export default function OpacitySlider() {
  const {opacity,setOpacity}=useToolSettings();
  return (
    <div className="flex flex-col gap-1">
      <span className="mb-2 mt-2 ml-1 text-sm  text-gray-300 ">Opacity</span>
      <input
        type="range"
        min={0}
        max={100}
        value={opacity}
        className="
      w-full h-1 rounded-full
      appearance-none cursor-pointer
      bg-[#3d3d5c]
      range-thumb:w-4 range-thumb:h-4
      range-thumb:rounded-full
      range-thumb:bg-[#7c7cad]
      range-thumb:border-none
      ml-1
    "
    onChange={(e) => setOpacity(parseInt(e.target.value))}
      />
      <div className="flex ml-1 justify-between text-xs text-gray-400">
        <span>0</span>
        <span>100</span>
      </div>
    </div>
  );
}
