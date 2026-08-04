import { useWebRtcContext } from "../../context/WebRtcContext";
import VideoCard from "./VideoCard";
import { useEffect, useState } from "react";
import { socket } from "../../services/socket";
interface VideoTabProps {
  roomId: string;
  localStream: React.MutableRefObject<MediaStream | null>;
  remoteStreams: { [socketId: string]: MediaStream };
  isReady: boolean;
  isVideoMuted: boolean;
  openCursor: boolean;
}
export default function VideoTab({
  roomId,
  localStream,
  remoteStreams,
  isReady,
  isVideoMuted,
  openCursor,
}: VideoTabProps) {
  const participantCount =
    (isReady && localStream.current ? 1 : 0) +
    Object.keys(remoteStreams).length;

  const { remoteVideoMuted, remoteAudioMuted, isAudioMuted, users } =
    useWebRtcContext();

  const [curUserName, setCurUserName] = useState("");

  useEffect(() => {
    socket.emit("my-info", (cb: { userId: string; name: string }) => {
      setCurUserName(cb.name);
    });
  }, [users]);

  const getTileSize = (count: number) => {
    if (count <= 1) return "w-full h-[90%] max-w-4xl";
    if (count === 2)
      return "max-[639px]:w-full max-[639px]:h-[45%] w-[calc(50%-0.25rem)] h-[90%] min-[1000px]:max-w-[520px]";
    if (count === 3)
      return "max-[639px]:w-full max-[639px]:h-[30%] w-[calc(50%-0.25rem)] h-[calc(50%-0.25rem)] min-[1000px]:w-[calc(33.333%-0.34rem)] min-[1000px]:h-[90%] min-[1000px]:max-w-[440px]";
    if (count === 4)
      return "max-[639px]:w-[calc(50%-0.25rem)] max-[639px]:h-[23%] w-[calc(50%-0.25rem)] h-[calc(50%-0.25rem)] min-[1000px]:max-w-[440px]";
    return "max-[639px]:w-[calc(50%-0.25rem)] max-[639px]:h-[22%] w-[calc(33.333%-0.34rem)] h-[calc(50%-0.25rem)] min-[1000px]:max-w-[380px]";
  };
  return (
    <>
      {!openCursor && (
        
<div className="bg-zinc-900 flex flex-wrap h-full w-full min-h-0 items-center justify-center content-center gap-2">        
          {isReady && localStream.current && (
            <div className={getTileSize(participantCount)}>
              <VideoCard
                stream={localStream.current}
                isVideoMuted={isVideoMuted}
                isAudioMuted={isAudioMuted}
                openCursor={openCursor}
                user={curUserName}
                muted
              />
            </div>
          )}
          {Object.entries(remoteStreams).map(([id, stream]) => (
            <div key={id} className={getTileSize(participantCount)}>
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

      {openCursor && (
        <div className="p-2 flex flex-col gap-2 w-full overflow-y-auto max-h-[calc(4*12rem+1.5rem)]">
          {isReady && localStream.current && (
            <div className="w-full aspect-video shrink-0">
              <VideoCard
                stream={localStream.current}
                isVideoMuted={isVideoMuted}
                isAudioMuted={isAudioMuted}
                openCursor={openCursor}
                user={curUserName}
                muted
              />
            </div>
          )}
          {Object.entries(remoteStreams).map(([id, stream]) => (
            <div key={id} className="w-full aspect-video shrink-0">
              <VideoCard
                stream={stream}
                isVideoMuted={remoteVideoMuted[id] ?? true}
                isAudioMuted={remoteAudioMuted[id] ?? true}
                openCursor={openCursor}
                user={users[id]}
              />
            </div>
          ))}
          {participantCount > 4 && (
            <div className="hidden  w-full h-30 shrink-0">jook</div>
          )}
        </div>
      )}
    </>
  );
}
