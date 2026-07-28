import React, { useEffect, useRef, useState } from "react";
import { useToolSettings } from "../../context/ToolBarLeftContext";
import { Presentation, Check, Loader2 } from "lucide-react";
import type { Participants } from "./Multicursor/types";
import { socket } from "../../services/socket";
import { boardColors } from "./LeftToolBar/tools/colors";
import api from "../../utils/axios";

import { X } from "lucide-react";

interface HamberMenuProps {
  roomId: string;
  openCursor: boolean;
  setOpenCursor: React.Dispatch<React.SetStateAction<boolean>>;
  setIsHambergerMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function HamberMenu({
  roomId,
  openCursor,
  setOpenCursor,
  setIsHambergerMenuOpen,
}: HamberMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  const [members, setMembers] = useState<Participants[]>([]);

  const [isOtherMembers, setIsOtherMembers] = useState(true);

  const [openSubmenu, setOpenSubmenu] = useState<
    "video" | "follow" | "boardColor" | "saveBoard" | null
  >(null);
  const [boardName,setBoardName] = useState("");
  const [isSavingBoard, setIsSavingBoard] = useState(false);

  const toggleSubmenu = (
    menu: "video" | "follow" | "boardColor" | "saveBoard",
  ) => {
    setOpenSubmenu((prev) => (prev === menu ? null : menu));
  };

  const handleFollowUser = (socketId: string) => {
    setFollowUserCamera((prev) => (prev === socketId ? "" : socketId));
    setSelectedMemId((prev) => (prev === socketId ? "" : socketId));
  };

  const handleSaveBoard = async () => {
  setIsSavingBoard(true);
  try {
    if(activeSavedBoardId.current) {
      const res = await api.patch(`/boards/${activeSavedBoardId.current}`, {
        name: boardName,
        roomId:roomId
      });
    setBoardName(res.data.name)

      activeBoardName.current=res.data.name;
    }
   else{
     const res = await api.post(`/boards/${roomId}`, {
      name: boardName,
    });
    setBoardName(res.data.name)
     activeBoardName.current=res.data.name;
    activeSavedBoardId.current = res.data._id;
   }
  
  } catch (err) {
    console.error("Failed to save board:", err);
  } finally {
    setIsSavingBoard(false);
  }
};

  useEffect(() => {
    socket.emit("get-participants", roomId);
    const handleList = (members: Participants[]) => {
      if (members.length === 1) {
        setIsOtherMembers(false);
      }
      setMembers(members);
    };

    socket.on("participants-list", handleList);

    return () => {
      socket.off("participants-list", handleList);
    };
  }, []);

  const {
    viewMode,
    setViewMode,
    setTabSize,
    setToggleVideoTab,
    toggleVideoTab,
    setActiveTool,
    setFollowUserCamera,
    selectedMemId,
    setSelectedMemId,
    boardColor,
    setBoardColor,
    activeSavedBoardId,
    activeBoardName
  } = useToolSettings();

  useEffect(() => {

    setBoardName(activeBoardName.current??"")

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
      className="absolute top-16 left-5 bg-[#1e1e2e] border border-white/10 rounded-lg shadow-xl min-w-[220px] z-20"
    >
      <ul className="py-1">
        {/* Room ID row */}
        <li className="px-4 py-3 flex items-center justify-between ">
          <div>
            <span className="text-xs text-gray-400">Room ID</span>
            <p className="text-sm text-gray-200 font-mono truncate">{roomId}</p>
          </div>
          <button
            title="Switch to video conference"
            className="p-2 rounded-md text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setOpenCursor(!openCursor);
              setIsHambergerMenuOpen(false);
            }}
          >
            <Presentation size={18} />
          </button>
        </li>

        {/* Video settings */}
        <li className="relative border-b border-white/10">
          <button
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-left text-gray-200 hover:bg-white/10 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              e.stopPropagation();
              toggleSubmenu("video");
            }}
          >
            Video settings
          </button>

          {openSubmenu === "video" && (
            <div className="absolute top-0 left-full ml-1 flex flex-col bg-[#1e1e2e] border border-white/10 rounded-lg shadow-xl min-w-[140px] z-40">
              <button
                className="px-3 py-2 text-sm text-left text-gray-200 hover:bg-white/10 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setToggleVideoTab(!toggleVideoTab);
                }}
              >
                {toggleVideoTab ? "Hide video tab" : "Show video tab"}
              </button>
              <button
                className="px-3 py-2 text-sm text-left text-gray-200 hover:bg-white/10 transition-colors"
                onClick={() => setTabSize("small")}
              >
                Small
              </button>
              <button
                className="px-3 py-2 text-sm text-left text-gray-200 hover:bg-white/10 transition-colors"
                onClick={() => setTabSize("normal")}
              >
                Normal
              </button>
              <button
                className="px-3 py-2 text-sm text-left text-gray-200 hover:bg-white/10 transition-colors"
                onClick={() => setTabSize("large")}
              >
                Large
              </button>
            </div>
          )}
        </li>

        {/* Actions */}
        <li
          className="px-4 py-2 text-sm text-gray-200 hover:bg-white/10 cursor-pointer transition-colors border-b border-white/10"
          onClick={() => {
            setActiveTool(null);
            setViewMode(!viewMode);
            if (viewMode === false) setFollowUserCamera("");
            if (selectedMemId !== "") setSelectedMemId("");
          }}
        >
          {viewMode ? "view only mode" : "draw mode"}
        </li>

        {!viewMode && (
          <li className="relative ">
            <div
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-left text-gray-200 hover:bg-white/10 transition-colors"
              onClick={() => toggleSubmenu("follow")}
            >
              Follow user camera
            </div>

            {openSubmenu === "follow" && (
              <div className="absolute top-0 left-full ml-1 flex flex-col bg-[#1e1e2e] border border-white/10 rounded-lg shadow-xl min-w-[160px] z-40">
                {isOtherMembers && (
                  <>
                    {members
                      .filter((member) => member.socketId !== socket.id)
                      .map((member) => (
                        <button
                          key={member.socketId}
                          className="px-3 py-2 flex justify-between align-center text-sm text-left text-gray-200 hover:bg-white/10 transition-colors"
                          onClick={() => {
                            handleFollowUser(member.socketId);
                          }}
                        >
                          {member.name}
                          {selectedMemId === member.socketId ? (
                            <span className="mt-1">
                              <Check size={16} />
                            </span>
                          ) : (
                            ""
                          )}
                        </button>
                      ))}
                  </>
                )}

                {!isOtherMembers && (
                  <>
                    <div className="px-3 py-2 text-sm text-left text-gray-200 hover:bg-white/10 transition-colors">
                      no Other members
                    </div>
                  </>
                )}
              </div>
            )}
          </li>
        )}

        <li className="relative border-b border-white/10">
          <button
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-left text-gray-200 hover:bg-white/10 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              toggleSubmenu("boardColor");
            }}
          >
            Board colors
          </button>
          {openSubmenu === "boardColor" && (
            <div className="absolute top-0 left-full ml-1 flex p-1 justify-between bg-[#1e1e2e] border border-white/10 rounded-lg shadow-xl min-w-[140px] z-40">
              {boardColors.map((color) => (
                <>
                  <div
                    key={color.name}
                    style={{ backgroundColor: color.value }}
                    className={`h-7 w-7 border rounded
                   ${color.value === boardColor ? `border-2 border-blue-300 ` : " border border-transparent"}
                    `}
                    onClick={() => {
                      setBoardColor(color.value);
                      socket.emit("board-color-change", {
                        roomId,
                        color: color.value,
                      });
                    }}
                  ></div>
                </>
              ))}
            </div>
          )}
        </li>

        <li className="relative border-b border-white/10">
          <button
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-left text-gray-200 hover:bg-white/10 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              toggleSubmenu("saveBoard");
            }}
          >
            Save Board
          </button>
          {openSubmenu === "saveBoard" && (
            <div className="absolute top-0 left-full ml-1 bg-[#1e1e2e] border border-white/10 rounded-2xl shadow-xl w-72 p-6 z-40">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-100">
                  Save Board?
                </h2>
                <button
                  onClick={() => toggleSubmenu("saveBoard")}
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
                ) : (
                  "Save"
                )}
              </button>
            </div>
          )}
        </li>
        <li className="px-4 py-2 text-sm text-gray-200 hover:bg-white/10 cursor-pointer transition-colors ">
          My boards
        </li>

        <li className="px-4 py-2 text-sm text-red-400 hover:bg-white/10 cursor-pointer transition-colors">
          Exit room
        </li>
      </ul>
    </div>
  );
}
