import { io, Socket } from "socket.io-client";

export const socket: Socket = io(import.meta.env.SOCKET_URL , {
  autoConnect: false,
  auth:(cb) => {
    cb({ accesstoken: localStorage.getItem("accessToken") });
  },
});