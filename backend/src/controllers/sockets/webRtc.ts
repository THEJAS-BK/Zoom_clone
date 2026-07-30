import { Socket, Server } from "socket.io";

import type {
  AnswerPayload,
  OfferPayload,
  IceCandidatePayload,
} from "./types/webRtcTypes";

export function registerWebRtcHandler(
  socket: Socket,
  io: Server,
  roomMuteState: Record<
    string,
    Record<string, { videoMuted: boolean; audioMuted: boolean }>
  >,
) {
  socket.on("offer", ({ to, offer }: OfferPayload) => {
    io.to(to).emit("receive-offer", { from: socket.id, offer });
  });

  socket.on("answer", ({ to, answer }: AnswerPayload) => {
    io.to(to).emit("receive-answer", { from: socket.id, answer });
  });

  socket.on("ice-candidates", ({ to, candidate }: IceCandidatePayload) => {
    io.to(to).emit("receive-ice-candidates", {
      from: socket.id,
      candidate,
    });
  });
  socket.on("video-toggle", ({ roomId, muted }) => {
    const room = (roomMuteState[roomId] ??= {});
    const entry = (room[socket.id] ??= { videoMuted: true, audioMuted: true });
    entry.videoMuted = muted;
    socket.to(roomId).emit("video-toggle", { from: socket.id, muted });
  });

  socket.on("audio-toggle", ({ roomId, muted }) => {
    const room = (roomMuteState[roomId] ??= {});
    const entry = (room[socket.id] ??= { videoMuted: true, audioMuted: true });
    entry.audioMuted = muted;
    socket.to(roomId).emit("audio-toggle", { from: socket.id, muted });
  });
}
