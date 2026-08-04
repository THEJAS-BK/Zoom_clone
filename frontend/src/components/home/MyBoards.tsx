import { LayoutGrid, Plus, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../utils/axios";
import { formatRelativeTime } from "./tools/formatRelativeDate";

interface BoardDoc {
  _id: string;
  name: string;
  updatedAt: string;
}

export default function MyBoards() {
  const [boards, setBoards] = useState<BoardDoc[]>([]);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBoards = async () => {
      try {
        const res = await api.get("/boards");
        setBoards(res.data);
      } catch (err) {
        console.error("failed to fetch boards", err);
      }
    };
    fetchBoards();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOpenBoard = (board: BoardDoc) => {
    navigate(`/offlineboard/${board._id}`);
  };

  const startRename = (board: BoardDoc) => {
    setRenamingId(board._id);
    setRenameValue(board.name);
    setOpenMenuId(null);
  };

  const submitRename = async (boardId: string) => {
    const trimmed = renameValue.trim();
    setRenamingId(null);
    if (!trimmed) return;
    try {
      await api.patch(`/boards/${boardId}`, { name: trimmed });
      setBoards((prev) =>
        prev.map((b) => (b._id === boardId ? { ...b, name: trimmed } : b))
      );
    } catch (err) {
      console.error("failed to rename board", err);
    }
  };

  const handleDelete = async (boardId: string) => {
    setOpenMenuId(null);
    try {
      await api.delete(`/boards/${boardId}`);
      setBoards((prev) => prev.filter((b) => b._id !== boardId));
    } catch (err) {
      console.error("failed to delete board", err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto mt-36 px-10 pb-24 pt-4 text-center">
      <h2 className="text-5xl font-semibold text-[#101820]">My boards</h2>
      <p className="text-gray-500 mt-2 mb-10">
        Boards you create will show up here.
      </p>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-6 justify-center">
        <Link to={`/offlineboard/new`}>
          <div className="aspect-[3/2] border-2 border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors">
            <Plus className="w-6 h-6 text-gray-400" />
            <span className="text-sm text-gray-500">New board</span>
          </div>
        </Link>
        {boards.map((board) => (
          <div
            key={board._id}
            className="group relative flex flex-col justify-between text-left p-4 min-h-[110px] rounded-xl border border-zinc-200 hover:border-[#7C6FF0] hover:shadow-md hover:scale-[1.02] transition-all duration-150 cursor-pointer"
            onClick={() => renamingId !== board._id && handleOpenBoard(board)}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setOpenMenuId((prev) => (prev === board._id ? null : board._id));
              }}
              className="absolute top-2 right-2 p-1 rounded-md hover:bg-zinc-100 opacity-0 group-hover:opacity-100 transition-opacity z-10"
            >
              <MoreVertical className="w-4 h-4 text-zinc-400" />
            </button>

            {openMenuId === board._id && (
              <div
                ref={menuRef}
                onClick={(e) => e.stopPropagation()}
                className="absolute top-9 right-2 w-36 bg-white border border-zinc-200 rounded-lg shadow-lg py-1 text-sm z-20"
              >
                <button
                  onClick={() => startRename(board)}
                  className="w-full flex items-center gap-2 text-left px-3 py-2 text-zinc-600 hover:bg-zinc-50 hover:text-[#101820] transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Rename
                </button>
                <button
                  onClick={() => handleDelete(board._id)}
                  className="w-full flex items-center gap-2 text-left px-3 py-2 text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            )}

            <div className="flex items-center justify-center flex-1 rounded-lg bg-zinc-50 group-hover:bg-[#7C6FF0]/5 transition-colors mb-2">
              <LayoutGrid className="w-6 h-6 text-zinc-300 group-hover:text-[#7C6FF0] transition-colors" />
            </div>
            <div>
              {renamingId === board._id ? (
                <input
                  autoFocus
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  onBlur={() => submitRename(board._id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") submitRename(board._id);
                    if (e.key === "Escape") setRenamingId(null);
                  }}
                  className="text-sm font-medium text-[#101820] w-full border-b border-[#7C6FF0] outline-none bg-transparent"
                />
              ) : (
                <p className="text-sm font-medium text-[#101820] truncate">
                  {board.name}
                </p>
              )}
              <p className="text-xs text-zinc-400">
  {formatRelativeTime(board.updatedAt)}
</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}