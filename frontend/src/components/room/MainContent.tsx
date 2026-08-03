import VideoTab from "./VideoTab";
import { useWebRtcContext } from "../../context/WebRtcContext";
import OptionsFooter from "./OptionsFooter";
import RoomNavbar from "./RoomNavbar";
import { useParams } from "react-router-dom";
import { useToolSettings } from "../../context/ToolBarLeftContext";
import { useEffect } from "react";

export default function MainContent({
  openCursor,
  setOpenCursor,
}: {
  openCursor: boolean;
  setOpenCursor: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { localStream, remoteStreams, isReady, isVideoMuted } = useWebRtcContext();
  const { audioToggle, videoToggle, isAudioMuted } = useWebRtcContext();
  const{setRoomId}=useToolSettings();

  const {roomId}=useParams();
  if(!roomId)return
  useEffect(()=>{
    if(!roomId)return;
    setRoomId(roomId)
  },[roomId])

  return (
    <div className="h-[100dvh] w-full flex flex-col overflow-hidden bg-zinc-900">
      <RoomNavbar roomId={roomId} />

      <div className="flex-1 min-h-0 w-full flex">
        <VideoTab
          roomId={roomId}
          localStream={localStream}
          remoteStreams={remoteStreams}
          isReady={isReady}
          isVideoMuted={isVideoMuted}
          openCursor={openCursor}
        />
      </div>

      <OptionsFooter
        audioToggle={audioToggle}
        videoToggle={videoToggle}
        isAudioMuted={isAudioMuted}
        isVideoMuted={isVideoMuted}
        openCursor={openCursor}
        setOpenCursor={setOpenCursor}
      />
    </div>
  );
}
