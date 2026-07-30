import { useEffect, useRef, useState } from "react";
import { socket } from "../services/socket";

const ICE_CONFIG = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export const useWebRTC = (roomId: string) => {
  const pendingCandidates = useRef<Record<string, RTCIceCandidateInit[]>>({});
  const [remoteStreams, setRemoteStreams] = useState<{
    [socketId: string]: MediaStream;
  }>({});
  const [isReady, setIsReady] = useState(false);
  const localStream = useRef<MediaStream | null>(null);
  const peerConnections = useRef<{ [socketId: string]: RTCPeerConnection }>({});

  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);

  const [remoteVideoMuted, setRemoteVideoMuted] = useState<{
    [socketId: string]: boolean;
  }>({});
  const [remoteAudioMuted, setRemoteAudioMuted] = useState<{
    [socketId: string]: boolean;
  }>({});

  const [mySocketId, setMySocketId] = useState<string | undefined>(socket.id);

  const [users, setUsers] = useState<{ [socketId: string]: string }>({});

  const audioToggle = () => {
    const track = localStream.current?.getAudioTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setIsAudioMuted(!track.enabled);
      socket.emit("audio-toggle", { roomId, muted: !track.enabled });
    }
  };

  const videoToggle = () => {
    const track = localStream.current?.getVideoTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setIsVideoMuted(!track.enabled);
      socket.emit("video-toggle", { roomId, muted: !track.enabled });
    }
  };

  const createPC = (remoteId: string) => {
    const existing = peerConnections.current[remoteId];
    if (existing) return existing;
    const pc = new RTCPeerConnection(ICE_CONFIG);

    localStream.current
      ?.getTracks()
      .forEach((track) => pc.addTrack(track, localStream.current!));

    pc.onicecandidate = ({ candidate }) => {
      if (candidate) socket.emit("ice-candidates", { to: remoteId, candidate });
    };

    pc.ontrack = ({ streams }) => {
      setRemoteStreams((prev) => ({ ...prev, [remoteId]: streams[0] }));
    };

    peerConnections.current[remoteId] = pc;
    return pc;
  };

  useEffect(() => {
    const init = async () => {
      if (localStream.current) return;

      localStream.current = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      const audioTrack = localStream.current.getAudioTracks()[0];

      //disable audio at start
      audioTrack.enabled = false;
      setIsAudioMuted(true);

      //disable video from start
      const videoTrack = localStream.current.getVideoTracks()[0];
      videoTrack.enabled = false;
      setIsVideoMuted(true);

      setIsReady(true); // trigger re-render so local video shows up
      const join = () => {
        setMySocketId(socket.id);
        socket.emit("join-room", roomId, (res: any) => {
          if (!res.success) {
            console.error(res.message);
            return;
          }
          socket.emit("video-toggle", {});
        });
      };

      if (socket.connected) {
        join();
      } else {
        socket.connect();
        socket.once("connect", join);
      }
    };

    init();
    socket.on(
      "existing-peers",
      async (
        peers: {
          socketId: string;
          name: string;
          videoMuted: boolean;
          audioMuted: boolean;
        }[],
      ) => {
        for (const { socketId, name, videoMuted, audioMuted } of peers) {
          setUsers((prev) => ({ ...prev, [socketId]: name }));
          setRemoteVideoMuted((prev) => ({ ...prev, [socketId]: videoMuted }));
          setRemoteAudioMuted((prev) => ({ ...prev, [socketId]: audioMuted }));

          if (peerConnections.current[socketId]) continue;

          const pc = createPC(socketId);
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit("offer", { to: socketId, offer });
        }
      },
    );

    socket.on(
      "joined-user",
      ({ socketId, name }: { socketId: string; name: string }) => {
        setUsers((prev) => ({ ...prev, [socketId]: name }));
        createPC(socketId);
      },
    );

    socket.on("receive-offer", async ({ from, offer }) => {
      let pc = peerConnections.current[from];

      if (!pc) {
        pc = createPC(from);
      }

      await pc.setRemoteDescription(new RTCSessionDescription(offer));

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.emit("answer", { to: from, answer });
    });

    socket.on("receive-answer", async ({ from, answer }: any) => {
      await peerConnections.current[from].setRemoteDescription(answer);
    });

    socket.on("receive-ice-candidates", async ({ from, candidate }) => {
      const pc = peerConnections.current[from];

      if (!pc.remoteDescription) {
        if (!pendingCandidates.current[from]) {
          pendingCandidates.current[from] = [];
        }

        pendingCandidates.current[from].push(candidate);
        return;
      }

      await pc.addIceCandidate(new RTCIceCandidate(candidate));
    });

    socket.on("user-left", (socketId: string) => {
      peerConnections.current[socketId]?.close();
      delete peerConnections.current[socketId];
      setRemoteStreams((prev) => {
        const updated = { ...prev };
        delete updated[socketId];
        return updated;
      });
      setRemoteVideoMuted((prev) => {
        const updated = { ...prev };
        delete updated[socketId];
        return updated;
      });
      setRemoteAudioMuted((prev) => {
        const updated = { ...prev };
        delete updated[socketId];
        return updated;
      });
      setUsers((prev) => {
        const updated = { ...prev };
        delete updated[socketId];
        return updated;
      });
    });

    socket.on(
      "video-toggle",
      ({ from, muted }: { from: string; muted: boolean }) => {
        setRemoteVideoMuted((prev) => ({ ...prev, [from]: muted }));
      },
    );
    socket.on(
      "audio-toggle",
      ({ from, muted }: { from: string; muted: boolean }) => {
        setRemoteAudioMuted((prev) => ({ ...prev, [from]: muted }));
      },
    );

    return () => {
      localStream.current?.getTracks().forEach((t) => t.stop());
      localStream.current = null;
      setIsReady(false);
      Object.values(peerConnections.current).forEach((pc) => pc.close());
      peerConnections.current = {};
      socket.off("existing-peers");
      socket.off("joined-user");
      socket.off("receive-offer");
      socket.off("receive-answer");
      socket.off("receive-ice-candidates");
      socket.off("user-left");
      socket.off("video-toggle");
      socket.off("audio-toggle");
    };
  }, [roomId]);

  return {
    localStream,
    remoteStreams,
    isReady,
    audioToggle,
    videoToggle,
    isAudioMuted,
    isVideoMuted,
    remoteVideoMuted,
    remoteAudioMuted,
    users,
    mySocketId,
  };
};
