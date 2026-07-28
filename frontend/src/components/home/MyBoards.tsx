import { LayoutGrid, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import api from "../../utils/axios";
import { useToolSettings } from "../../context/ToolBarLeftContext";
interface BoardDoc {
  _id: string;
  name: string;
  updatedAt: string;
}

export default function MyBoards() {
  const [boards, setBoards] = useState<BoardDoc[]>([]);
  const navigate = useNavigate();
  useEffect(() => {
    const fetchBoards = async () => {
      try {
        const res = await api.get("/boards");
        setBoards(res.data);
      } catch (err) {
        console.error("failed to fetch boards", err);
      } finally {
      }
    };
    fetchBoards();
  }, []);

  const handleOpenBoard = (board: BoardDoc) => {
    navigate(`/offlineboard/${board._id}`);
  };

  return (
    <div className="max-w-5xl mx-auto mt-36 px-10 pb-24 pt-4 text-center">
      <h2 className="text-5xl font-semibold text-[#101820]">My boards</h2>
      <p className="text-gray-500 mt-2 mb-10">
        Boards you create will show up here.
      </p>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-6 justify-center  ">
        <Link to={`/offlineboard/new`}>
          <div className="aspect-[3/2] border-2 border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors">
            <Plus className="w-6 h-6 text-gray-400" />
            <span className="text-sm text-gray-500">New board</span>
          </div>
        </Link>
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
    </div>
  );
}
