import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import OptionsFooter from "./OptionsFooter"; // adjust path as needed
import VideoCard from "./VideoCard";
import { useWebRtcContext } from "../../context/WebRtcContext"; // adjust path as needed
import { socket } from "../../services/socket";

interface MobileScreenVideoProps {
  setIsMobileScreenTabOpen: React.Dispatch<React.SetStateAction<boolean>>;
  roomId: string;
  openCursor: boolean;
  setOpenCursor: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function MobileScreenVideo({
  setIsMobileScreenTabOpen,
  roomId,
  openCursor,
  setOpenCursor,
}: MobileScreenVideoProps) {
  const {
    localStream,
    remoteStreams,
    isReady,
    isVideoMuted,
    isAudioMuted,
    audioToggle,
    videoToggle,
    remoteVideoMuted,
    remoteAudioMuted,
    users,
  } = useWebRtcContext();

  const [curUserName, setCurUserName] = useState("");

  useEffect(() => {
    socket.emit("my-info", (cb: { userId: string; name: string }) => {
      setCurUserName(cb.name);
    });
  }, [users]);

  return (
    <div className="w-64">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold">Members</h2>
        <button
          onClick={() => setIsMobileScreenTabOpen(false)}
          title="Close"
          className="text-gray-400 hover:text-white transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      <OptionsFooter
        audioToggle={audioToggle}
        videoToggle={videoToggle}
        isAudioMuted={isAudioMuted}
        isVideoMuted={isVideoMuted}
        openCursor={openCursor}
        setOpenCursor={setOpenCursor}
      />

      {openCursor && (
        <div className="p-2 flex flex-wrap gap-2 w-full overflow-y-auto max-h-[calc(4*12rem+1.5rem)] content-start">
          {isReady && localStream.current && (
            <div className="w-[calc(50%-0.25rem)]">
              <VideoCard
                stream={localStream.current}
                isVideoMuted={isVideoMuted}
                isAudioMuted={isAudioMuted}
                openCursor={openCursor}
                user={curUserName}
              />
            </div>
          )}
          {Object.entries(remoteStreams).map(([id, stream]) => (
            <div key={id} className="w-[calc(50%-0.25rem)]">
              <VideoCard
                stream={stream}
                isVideoMuted={remoteVideoMuted[id] ?? true}
                isAudioMuted={remoteAudioMuted[id] ?? true}
                openCursor={openCursor}
                user={users[id]}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}