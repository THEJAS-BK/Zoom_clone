import { useEffect, useState } from "react";
import Hero from "../components/home/Hero";
import NavBar from "../components/home/NavBar";
import { socket } from "../services/socket";
import MyImages from "../components/home/MyImages";

function connectSocket(maxAttempts = 5): Promise<void> {
  return new Promise((resolve, reject) => {
    let attempt = 0;

    const tryConnect = () => {
      attempt++;

      const onConnect = () => {
        cleanup();
        resolve();
      };
      const onError = (err: Error) => {
        cleanup();
        if (attempt >= maxAttempts) {
          reject(err);
          return;
        }
        setTimeout(tryConnect, attempt * 1000);
      };
      const cleanup = () => {
        socket.off("connect", onConnect);
        socket.off("connect_error", onError);
      };

      socket.once("connect", onConnect);
      socket.once("connect_error", onError);

      if (!socket.connected) socket.connect();
    };

    if (socket.connected) {
      resolve();
      return;
    }

    tryConnect();
  });
}

export default function Dashboard() {
  const [connectionError, setConnectionError] = useState(false);
  const [openMyImagesInterfaceOpen, setMyImageInterfaceOpen] = useState(false);
  useEffect(() => {
    connectSocket().catch(() => setConnectionError(true));
  }, []);

  return (
    <div className="flex flex-col h-screen">
      {openMyImagesInterfaceOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center px-6">
          <MyImages setMyImageInterfaceOpen={setMyImageInterfaceOpen} />
        </div>
      )}
      <NavBar setMyImageInterfaceOpen={setMyImageInterfaceOpen} />
      {connectionError && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-lg z-99">
          Connection failed, please refresh
        </div>
      )}
      <Hero />
    </div>
  );
}
