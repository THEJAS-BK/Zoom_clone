import { io, Socket } from "socket.io-client";

const URL = "http://localhost:8080";

export const socket: Socket = io(import.meta.env.SOCKET_URL || URL, {
  autoConnect: false,
  auth:(cb) => {
    cb({ accesstoken: localStorage.getItem("accessToken") });
  },
});