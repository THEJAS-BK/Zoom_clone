import { MicOff, Mic } from "lucide-react";
import { useEffect, useRef } from "react";

export default function VideoCard({
  stream,
  muted = false,
  isVideoMuted,
  isAudioMuted,
  user,
  openCursor,
}: {
  stream: MediaStream;
  muted?: boolean;
  isVideoMuted?: boolean;
  isAudioMuted?: boolean;
  user?: string;
  openCursor?: boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!ref.current || !stream) return;

    if (ref.current.srcObject === stream) return;
    ref.current.srcObject = stream;

    ref.current
      .play()
      .then(() => {})
      .catch((err) => {
        console.error("video play failed:", err);
      });

    return () => {
      if (ref.current) {
        ref.current.srcObject = null;
      }
    };
  }, [stream, user]);

  const initial = user?.trim()[0];

  return (
    <div className="relative w-full h-[95%] overflow-hidden rounded-lg">
      <video
        ref={ref}
        autoPlay
        playsInline
        muted={muted}
        className="w-full h-full object-cover"
      />

      {isVideoMuted && (
        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-neutral-800">
          <span className="text-4xl font-semibold text-white">{initial}</span>
        </div>
      )}

      {isVideoMuted && (
        <div className={`absolute top-1 left-1 flex items-center justify-center bg-black/60 rounded-full p-1.5 ${openCursor ? "w-[90%]" : ""}`}>
          {isAudioMuted ? (
            <MicOff size={15} className="text-white" />
          ) : (
            <Mic size={15} className="text-white" />
          )}
          <p className="text-white text-sm ml-2">{user}</p>
        </div>
      )}
    </div>
  );
}