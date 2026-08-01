import { X, LayoutGrid } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../../utils/axios";
import { useToolSettings } from "../../context/ToolBarLeftContext";
import { useNavigate } from "react-router-dom";
import { socket } from "../../services/socket";
import { generateRoomId } from "../../utils/RoomId";
import { useWebRTC } from "../../hooks/Webrtc";

interface BoardDoc {
  _id: string;
  name: string;
  updatedAt: string;
}


export default function OnlineMyboards({
  setIsMyBoardsInterfaceOpen,
  setBoardSwitching 
}: {
  setIsMyBoardsInterfaceOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setBoardSwitching:React.Dispatch<React.SetStateAction<string|null>>;
}) {
  const [boards, setBoards] = useState<BoardDoc[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
const { roomId,activeBoardName,activeSavedBoardId,boardName,setBoardName } = useToolSettings();

  useEffect(() => {
    const fetchBoards = async () => {
      try {
        const res = await api.get("/boards");
        setBoards(res.data);
      } catch (err) {
        console.error("failed to fetch boards", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBoards();
  }, []);

 const handleOpenBoard = async (board: BoardDoc) => {
  try {
    socket.emit("board-switch-start", { roomId, boardName: board.name });

    if (activeSavedBoardId.current) {
        const res = await api.patch(`/boards/${activeSavedBoardId.current}`, {
          name: boardName,
          roomId: roomId,
        });
        setBoardName(res.data.name);

        activeBoardName.current = res.data.name;
      } else {
        const res = await api.post(`/boards/${roomId}`, {
          name: new Date().toLocaleDateString(),
        });
        setBoardName(res.data.name);
        activeBoardName.current = res.data.name;
        activeSavedBoardId.current = res.data._id;
      }

    const newRoomId = await new Promise<string>((resolve) => {
      const tryCreate = () => {
        const candidateId = generateRoomId();
        socket.emit("switch-room", candidateId, board._id, (res: any) => {
          if (!res.success) return tryCreate();
          resolve(candidateId);
        });
      };
      tryCreate();  
    });
    setIsMyBoardsInterfaceOpen(false)

    socket.emit("board-switch-complete", { roomId, newRoomId });
    navigate(`/room/${newRoomId}`);
  } catch (err) {
    console.error("failed to open board", err);
  }
};

  return (
    <div className="bg-white z-999 rounded-2xl shadow-xl w-full max-w-lg min-h-[450px] max-h-[560px] p-6 relative flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-lg font-semibold text-[#101820]">My Boards</h2>
        <button
          onClick={() => setIsMyBoardsInterfaceOpen(false)}
          className="p-1.5 rounded-full hover:bg-zinc-100 transition-colors"
        >
          <X className="w-5 h-5 text-zinc-500" />
        </button>
      </div>
      <p className="text-xs text-zinc-400 mb-6">Click a board to open it</p>

      {/* Boards list */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full py-16 text-zinc-300">
            <LayoutGrid className="w-8 h-8 mb-2 animate-pulse" />
            <span className="text-xs">Loading boards...</span>
          </div>
        ) : boards.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-16 text-zinc-300">
            <LayoutGrid className="w-8 h-8 mb-2" />
            <span className="text-xs">No boards yet</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {boards.map((board) => (
              <button
                key={board._id}
                onClick={() => handleOpenBoard(board)}
                className="group flex flex-col justify-between text-left p-4 min-h-[110px] rounded-xl border border-zinc-200 hover:border-[#7C6FF0] hover:shadow-md hover:scale-[1.02] transition-all duration-150"
              >
                <div className="flex items-center justify-center flex-1 rounded-lg bg-zinc-50 group-hover:bg-[#7C6FF0]/5 transition-colors mb-2">
                  <LayoutGrid className="w-6 h-6 text-zinc-300 group-hover:text-[#7C6FF0] transition-colors" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#101820] truncate">
                    {board.name}
                  </p>
                  <p className="text-xs text-zinc-400">
                    {new Date(board.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}