import { useState } from "react";
import { boardColors } from "../room/LeftToolBar/tools/colors";
import { useToolSettings } from "../../context/ToolBarLeftContext";
export default function OfflineHamberMenu() {
  const [isBoardcolorInterfaceOpen, setIsBoardcolorInterfaceOpen] =
    useState(false);
  const { boardColor, setBoardColor } = useToolSettings();
  return (
    <div className="absolute top-16 left-5 bg-[#1e1e2e] border border-white/10 rounded-lg shadow-xl  min-w-[220px] z-20">
      {/* Actions */}
      <ul className="">
        <li className="px-4 py-2 text-sm text-gray-200 hover:bg-white/10 cursor-pointer transition-colors">
          My Boards
        </li>
        <li className="px-4 py-2 text-sm text-gray-200 hover:bg-white/10 cursor-pointer transition-colors">
          Save Board
        </li>
        <li className="px-4 py-2 text-sm text-red-400 hover:bg-white/10 cursor-pointer transition-colors">
          Exit
        </li>
        <li className="relative border-b border-white/10">
          <button
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-left text-gray-200 hover:bg-white/10 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setIsBoardcolorInterfaceOpen(!isBoardcolorInterfaceOpen);
            }}
          >
            Board colors
          </button>
          {isBoardcolorInterfaceOpen && (
            <div className="absolute top-0 left-full ml-1 flex p-1 justify-between bg-[#1e1e2e] border border-white/10 rounded-lg shadow-xl min-w-[140px] z-40">
              {boardColors.map((color) => (
                <div
                  key={color.name}
                  style={{ backgroundColor: color.value }}
                  className={`h-7 w-7 border rounded
                   ${color.value === boardColor ? `border-2 border-blue-300 ` : " border border-transparent"}
                    `}
                  onClick={() => {
                    setBoardColor(color.value);
                  }}
                ></div>
              ))}
            </div>
          )}
        </li>
      </ul>
    </div>
  );
}
