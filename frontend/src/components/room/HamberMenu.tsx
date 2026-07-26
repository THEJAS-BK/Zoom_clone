import React, { useEffect, useRef, useState } from "react";
import { useToolSettings } from "../../context/ToolBarLeftContext";
import { Presentation, Check } from "lucide-react";
import type { Participants } from "./Multicursor/types";
import { socket } from "../../services/socket";
import { boardColors } from "./LeftToolBar/tools/colors";

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
    "video" | "follow" | "boardColor" | null
  >(null);

  const toggleSubmenu = (menu: "video" | "follow" | "boardColor") => {
    setOpenSubmenu((prev) => (prev === menu ? null : menu));
  };

    const handleFollowUser = (socketId: string) => {
    setFollowUserCamera((prev) => (prev === socketId ? "" : socketId));
    setSelectedMemId((prev) => (prev === socketId ? "" : socketId));
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
  } = useToolSettings();

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

            {openSubmenu==="follow" && (
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
             toggleSubmenu("boardColor")
            }}
          >
            Board colors
          </button>
          {openSubmenu==="boardColor" && (
            <div className="absolute top-0 left-full ml-1 flex p-1 justify-between bg-[#1e1e2e] border border-white/10 rounded-lg shadow-xl min-w-[140px] z-40">
              {boardColors.map((color) => (
                <>
                  <div
                    key={color.name}
                    style={{ backgroundColor: color.value }}
                    className={`h-7 w-7 border rounded
                   ${color.value === boardColor ? `border-2 border-blue-300 ` : " border border-transparent"}
                    `}
                    onClick={() => setBoardColor(color.value)}
                  ></div>
                </>
              ))}
            </div>
          )}
        </li>

        <li className="px-4 py-2 text-sm text-gray-200 hover:bg-white/10 cursor-pointer transition-colors ">
          My Boards
        </li>
        <li className="px-4 py-2 text-sm text-gray-200 hover:bg-white/10 cursor-pointer transition-colors ">
          Save Board
        </li>

        <li className="px-4 py-2 text-sm text-red-400 hover:bg-white/10 cursor-pointer transition-colors">
          Exit room
        </li>
      </ul>
    </div>
  );
}
