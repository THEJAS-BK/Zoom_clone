import React, { useState } from "react";
import { AlertTriangle, X, Loader2 } from "lucide-react";
import { generateRoomId } from "../../utils/RoomId";
import { useNavigate } from "react-router-dom";
import { socket } from "../../services/socket";
import { useToolSettings } from "../../context/ToolBarLeftContext";

export default function GoLiveInterface({
  setOpenGoLiveInterface,
}: {
  setOpenGoLiveInterface: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const navigate = useNavigate();
  const { activeSavedBoardId } = useToolSettings();
  const [isGoingLive, setIsGoingLive] = useState(false);

  const handleGoLive = async () => {
    setIsGoingLive(true);
    try {
      const newRoomId = await new Promise<string>((resolve) => {
        const tryCreate = () => {
          const candidateId = generateRoomId();
          socket.emit(
            "switch-room",
            candidateId,
            activeSavedBoardId.current,
            (res: any) => {
              if (!res.success) return tryCreate();
              resolve(candidateId);
            },
          );
        };
        tryCreate();
      });
      navigate(`/room/${newRoomId}`);
    } finally {
      setIsGoingLive(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative">
      {/* Close */}
      <button
        onClick={() => setOpenGoLiveInterface(false)}
        disabled={isGoingLive}
        className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-zinc-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <X className="w-5 h-5 text-zinc-500" />
      </button>

      {/* Header */}
      <h2 className="text-lg font-semibold text-[#101820] mb-4">Go Live</h2>

      {/* Reminder */}
      <div className="flex items-start gap-2.5 bg-red-50 rounded-xl p-3 mb-6">
        <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
        <p className="text-sm text-zinc-600">
          Remember to save any updates made to the board before going live.
        </p>
      </div>

      {/* Action */}
      <button
        onClick={handleGoLive}
        disabled={isGoingLive}
        className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-full font-medium transition-colors text-white ${
          isGoingLive
            ? "bg-[#7C6FF0]/60 cursor-not-allowed"
            : "bg-[#7C6FF0] hover:bg-[#6a5de0]"
        }`}
      >
        {isGoingLive ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Going live...
          </>
        ) : (
          "Go Live"
        )}
      </button>
    </div>
  );
}