import { useToolSettings } from "../../context/ToolBarLeftContext";
import { useEffect, useState } from "react";
import { socket } from "../../services/socket";
import { X } from "lucide-react";

import type { Participants } from "./Multicursor/types";

export default function ParticipantList({ onClose }: { onClose: () => void }) {
  const [participantNames, setParticipantNames] = useState<string[]>([]);
  const { roomId } = useToolSettings();

  useEffect(() => {
    if (!roomId) return;

    socket.emit("get-participants", roomId);

    const handleList = (members: Participants[]) => {
      setParticipantNames(members.map((member) => member.name));
    };
    socket.on("participants-list", handleList);

    return () => {
      socket.off("participants-list", handleList);
    };
  }, [roomId]);

  return (
     <div
  onClick={(e) => e.stopPropagation()}
  className="
    absolute bottom-full left-0 mb-2
    flex flex-col
    h-[500px] w-[320px]
    bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl overflow-hidden

    max-[550px]:fixed
    max-[550px]:left-1/2
    max-[550px]:top-1/2
    max-[550px]:bottom-auto
    max-[550px]:-translate-x-1/2
    max-[550px]:-translate-y-1/2
    max-[550px]:w-[90vw]
    max-[550px]:max-w-[280px]
    max-[550px]:h-[380px]
    max-[550px]:mb-0
  "
>
      <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-700">
        <span className="text-sm font-medium text-white">
          Participants ({participantNames.length})
        </span>
        <button
          onClick={onClose}
          className="text-zinc-400 hover:text-white p-1 rounded-full hover:bg-zinc-800"
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2 flex flex-col gap-1">
        {participantNames.map((name, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between px-2 py-2 rounded-md hover:bg-zinc-800"
          >
            <span className="text-sm text-white truncate">{name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}