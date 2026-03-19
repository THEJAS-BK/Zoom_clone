import { Server } from "socket.io";
const setSocketConnection = (server: any) => {
  const io = new Server(server,{
    cors:({
        origin:process.env.ORIGIN,
        credentials:true
    })
  });
  return io;
};

export {setSocketConnection};