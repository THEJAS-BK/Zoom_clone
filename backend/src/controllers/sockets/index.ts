import jwt from "jsonwebtoken";
import { Server } from "socket.io";

//handlers
import { registerWebRtcHandler } from "./webRtc";
import { registerChatInterfaceHandler } from "./chat";
import { registerRoomHandler } from "./room";
import { registerCanvasHandler } from "./canvasDraw";
//types
import { Stroke, CanvasElement } from "./types/canvasTypes";
import { registerFollowUserCamera } from "./followUserCamera";
import { registerSwitchBoards } from "./switchboards";


let activeRooms: Record<string, Set<string>> = {};
const roomElements: Record<string, CanvasElement[]> = {};
const roomBoards: Record<string, Stroke[]> = {};
const roomBoardColors: Record<string, string> = {};
const roomUserInfo: Record<string, Record<string, { color: string; name: string }>> = {};

const setSocketConnection = (server: any) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.ORIGIN,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.accesstoken;
    if (!token) {
      return next(new Error("NO token provided"));
    }
    try {
      const decode = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as any;
      socket.data.userId = decode.userId;
      socket.data.name = decode.name;
      console.log("User connected:", socket.data.name);
      next();
    } catch (error) {
      return next(new Error("Invalid token"));
    }
  });
  io.on("connection", (socket) => {
   
    console.log("user joined    ", socket.id);
    registerSwitchBoards(socket, roomBoards, roomElements,roomBoardColors,activeRooms);
    registerRoomHandler(socket,io, activeRooms,roomUserInfo);
    registerWebRtcHandler(socket, io, activeRooms);
    registerChatInterfaceHandler(socket, io);
    registerCanvasHandler(socket, roomBoards, roomElements,roomBoardColors,roomUserInfo);
    registerFollowUserCamera(socket,io)
  });
  return io;
};

export { setSocketConnection,roomElements,roomBoards,roomBoardColors };
