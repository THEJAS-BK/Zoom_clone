import { useParams } from "react-router-dom";
import MainContent from "../components/room/MainContent";
import { useEffect, useRef, useState } from "react";
import { WebRtcProvider } from "../context/WebRtcContext";
import { ToolSettingsProvider } from "../context/ToolBarLeftContext.tsx";
import MultiCursor from "../components/room/Multicursor/MultiCursor";

//image upload function

import { Menu } from "lucide-react";

import Tools from "../components/room/Tools.tsx";
import ToolBarContainer from "../components/room/LeftToolBar/ToolBarContainer.tsx";
import HamberMenu from "../components/room/HamberMenu.tsx";
import ImageUploadInterface from "../components/room/ImageUploadInterface.tsx";
import OnlineMyboards from "../components/room/OnlineMyboards.tsx";
import { useNavigate } from "react-router-dom";
import { socket } from "../services/socket";
import api from "../utils/axios";
import { useToolSettings } from "../context/ToolBarLeftContext.tsx";
import { HistoryProvider } from "../context/LocalHistoryContext.tsx";
type BoardImage = {
  type: "image";
  id: string;
  image: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number | 0;
};

export default function RoomPage() {
  const { roomId } = useParams();
  if (!roomId) return <div>Not found</div>;

  return (
    <WebRtcProvider roomId={roomId}>
      <ToolSettingsProvider>
        <HistoryProvider>
          <RoomContent roomId={roomId} />
        </HistoryProvider>
      </ToolSettingsProvider>
    </WebRtcProvider>
  );
}

function RoomContent({ roomId }: { roomId: string }) {
  const [openCursor, setOpenCursor] = useState(false);

  const [redrawVersion, setRedrawVersion] = useState(0);
  const [isHambergerMenuOpen, setIsHambergerMenuOpen] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const [isImageUploadInterfaceOpen, setIsImageUploadInterfaceOpen] =
    useState(false);
  const [isMyBoardsInterfaceOpen, setIsMyBoardsInterfaceOpen] = useState(false);
  const [boardSwitching, setBoardSwitching] = useState<string | null>(null);
  const camera = useRef({ x: 0, y: 0, scale: 1 });
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const roomPageRef=useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const pendingSaveRef = useRef<Promise<any> | null>(null);
  const {
    activeSavedBoardId,
    activeBoardName,
    boardName,
    setBoardName,
    images,
  } = useToolSettings();

  useEffect(() => {
    const saveOwnCopy = async () => {
      if (activeSavedBoardId.current) {
        const res = await api.patch(`/boards/${activeSavedBoardId.current}`, {
          name: boardName,
          roomId: roomId,
        });
        setBoardName(res.data.name);
        activeBoardName.current = res.data.name;
      } else {
        const res = await api.post(`/boards/${roomId}`, {
          name: new Date().toLocaleDateString(),
        });
        setBoardName(res.data.name);
        activeBoardName.current = res.data.name;
        activeSavedBoardId.current = res.data._id;
      }
    };

    const handleSwitchStart = ({
      initiatorName,
      boardName: incomingBoardName,
    }: {
      initiatorName: string;
      boardName: string;
    }) => {
      setBoardSwitching(`${initiatorName} is opening "${incomingBoardName}"`);
      pendingSaveRef.current = saveOwnCopy();
    };

    const handleSwitchComplete = async ({
      newRoomId,
    }: {
      newRoomId: string;
    }) => {
      if (pendingSaveRef.current) await pendingSaveRef.current;
      navigate(`/room/${newRoomId}`);
    };

    socket.on("board-switch-start", handleSwitchStart);
    socket.on("board-switch-complete", handleSwitchComplete);
    return () => {
      socket.off("board-switch-start", handleSwitchStart);
      socket.off("board-switch-complete", handleSwitchComplete);
    };
  }, [roomId]);

  return (
    <div ref={roomPageRef} className="h-screen flex flex-col overflow-hidden">
      <main className="flex-1 flex static">
        {openCursor && (
          <>
            <button
              data-hamburger-trigger
              onClick={() => setIsHambergerMenuOpen(!isHambergerMenuOpen)}
              className="absolute text-white z-20 left-5 top-5 bg-slate-800 p-2 rounded"
            >
              <Menu />
            </button>
            {isViewMode && <ToolBarContainer />}
          </>
        )}

        {isHambergerMenuOpen && (
          <HamberMenu
            openCursor={openCursor}
            setOpenCursor={setOpenCursor}
            roomId={roomId}
            setIsHambergerMenuOpen={setIsHambergerMenuOpen}
            setIsMyBoardsInterfaceOpen={setIsMyBoardsInterfaceOpen}
          />
        )}

        {openCursor && isViewMode && (
          <div className="absolute top-10 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded text-white shadow-lg z-20 ">
            <Tools
              setIsImageUploadInterfaceOpen={setIsImageUploadInterfaceOpen}
            />
          </div>
        )}

        {openCursor && isImageUploadInterfaceOpen && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center px-6">
            <ImageUploadInterface
              images={images}
              setIsImageUploadInterfaceOpen={setIsImageUploadInterfaceOpen}
              camera={camera}
              canvasRef={canvasRef}
            />
          </div>
        )}

        {openCursor && isMyBoardsInterfaceOpen && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center px-6">
            <OnlineMyboards
              setIsMyBoardsInterfaceOpen={setIsMyBoardsInterfaceOpen}
              setBoardSwitching={setBoardSwitching}
            />
          </div>
        )}

        {!openCursor && (
          <MainContent openCursor={openCursor} setOpenCursor={setOpenCursor} />
        )}

        {openCursor && (
          <MultiCursor
            roomId={roomId}
            imageUpdate={redrawVersion}
            images={images}
            openCursor={openCursor}
            setOpenCursor={setOpenCursor}
            setIsViewMode={setIsViewMode}
            camera={camera}
            canvasRef={canvasRef}
            roomPageRef={roomPageRef}
          />
        )}
      </main>
    </div>
  );
}
