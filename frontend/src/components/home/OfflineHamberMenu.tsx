import { useRef, useState, useEffect, type SetStateAction } from "react";
import { boardColors } from "../room/LeftToolBar/tools/colors";
import { useToolSettings } from "../../context/ToolBarLeftContext";
import { Check, X, Loader2 } from "lucide-react";
import api from "../../utils/axios";
import { combineElements } from "./tools/combineElements";
import type { BoardImage } from "../room/Multicursor/types";
export default function OfflineHamberMenu({
  setIsHambergerMenuOpen,
  images,
  setOpenBoardNotSavedInterface,
  setOpenGoLiveInterface
}: {
  setIsHambergerMenuOpen: React.Dispatch<SetStateAction<boolean>>;
  images: React.RefObject<BoardImage[]>;
  setOpenBoardNotSavedInterface:React.Dispatch<SetStateAction<boolean>>
  setOpenGoLiveInterface: React.Dispatch<SetStateAction<boolean>>
}) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [subMenu, setSubmenu] = useState<"boardColor" | "saveBoards" | null>(
    null,
  );

  const [isSavingBoard, setIsSavingBoard] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const toggle = (option: "boardColor" | "saveBoards") => {
    setSubmenu((prev) => (prev === option ? null : option));
  };

  const {
    boardColor,
    setBoardColor,
    boardName,
    setBoardName,
    activeBoardName,
    activeSavedBoardId,
    linesRef,
    textBoxesRef,
    shapesRef,
    strokes,
  } = useToolSettings();

  const handleSaveBoard = async () => {
    setIsSavingBoard(true);
    setIsSaved(true);
    try {
      const elements = combineElements(
        linesRef,
        textBoxesRef,
        shapesRef,
        images,
      );
      if (activeSavedBoardId.current) {
        const res = await api.patch(
          `/boards/offline/${activeSavedBoardId.current}`,
          {
            name: boardName,
            boardColor: boardColor,
            strokes: strokes.current,
            elements,
          },
        );
        setBoardName(res.data.name);

        activeBoardName.current = res.data.name;
      } else {
        const res = await api.post(`/boards/offline`, {
          name: boardName,
          boardColor: boardColor,
          strokes: strokes.current,
          elements,
        });
        setTimeout(() => setIsSaved(false), 3000);
        setBoardName(res.data.name);
        activeBoardName.current = res.data.name;
        activeSavedBoardId.current = res.data._id;
      }
    } catch (err) {
      console.error("Failed to save board:", err);
    } finally {
      setIsSavingBoard(false);
    }
  };

  const handleGoLiveWithThisBoard=()=>{
    if(!activeSavedBoardId.current){
      setOpenBoardNotSavedInterface(true)
      return;
    }
    setOpenGoLiveInterface(true)
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Ignore clicks on the trigger — let its own onClick toggle handle it
      if (target.closest("[data-hamburger-trigger]")) {
        return;
      }

      if (menuRef.current && !menuRef.current.contains(target)) {
        setIsHambergerMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setIsHambergerMenuOpen]);

  return (
    <div
      ref={menuRef}
      className="absolute top-25 left-5 bg-[#1e1e2e] border border-white/10 rounded-lg shadow-xl  min-w-[220px] z-20"
    >
      {/* Actions */}
      <ul>
        <li className="relative border-b border-white/10">
          <button
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-left text-gray-200 hover:bg-white/10 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
            toggle("saveBoards")
            }}
          >
            Save Board
          </button>
          {subMenu==="saveBoards" && (
            <div className="absolute top-0 left-full ml-1 bg-[#1e1e2e] border border-white/10 rounded-2xl shadow-xl w-72 p-6 z-40">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-100">
                  Save Board?
                </h2>
                <button
                  onClick={() => toggle("saveBoards")}
                  className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Board name input */}
              <label className="block mb-4">
                <span className="text-sm text-gray-400 mb-1.5 block">
                  Board Name?
                </span>
                <input
                  type="text"
                  value={boardName}
                  onChange={(e) => setBoardName(e.target.value)}
                  placeholder="Untitled board"
                  className="w-full px-3 py-2 rounded-lg bg-[#2a2a3d] border border-white/10 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#7C6FF0]"
                />
              </label>

              {/* Save button */}
              <button
                onClick={handleSaveBoard}
                disabled={isSavingBoard}
                className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-full font-medium transition-colors ${
                  isSavingBoard
                    ? "bg-[#7C6FF0]/60 cursor-not-allowed"
                    : "bg-[#7C6FF0] cursor-pointer hover:bg-[#6a5de0]"
                } text-white`}
              >
                {isSavingBoard ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : isSaved ? (
                  <>
                    <Check className="w-4 h-4" />
                    Saved!
                  </>
                ) : (
                  "Save"
                )}
              </button>
            </div>
          )}
        </li>

        <li
        onClick={handleGoLiveWithThisBoard}
        className="px-4 py-2 text-sm text-gray-200 hover:bg-white/10 cursor-pointer transition-colors">
          Go live with this board
        </li>

        <li className="relative border-b border-white/10">
          <button
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-left text-gray-200 hover:bg-white/10 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              toggle("boardColor");
            }}
          >
            Board colors
          </button>
          {subMenu==="boardColor" && (
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
        <li className="px-4 py-2 text-sm text-red-400 hover:bg-white/10 cursor-pointer transition-colors">
          Exit
        </li>
      </ul>
    </div>
  );
}
