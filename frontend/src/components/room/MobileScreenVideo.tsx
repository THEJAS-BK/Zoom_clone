import React from "react";
import { X } from "lucide-react";
import OptionsFooter from "./OptionsFooter"; // adjust path as needed
import VideoTab from "./VideoTab"; // adjust path as needed
import { useWebRtcContext } from "../../context/WebRtcContext"; // adjust path as needed

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
  } = useWebRtcContext();

  return (
    <div className="w-64 z-999">
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
      <VideoTab
        roomId={roomId}
        localStream={localStream}
        remoteStreams={remoteStreams}
        isReady={isReady}
        isVideoMuted={isVideoMuted}
        openCursor={true}
      />

    </div>
  );
}