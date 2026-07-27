import { useParams } from "react-router-dom";
import MainContent from "../components/room/MainContent";
import {  useEffect, useRef, useState } from "react";
import { WebRtcProvider } from "../context/WebRtcContext";
import { ToolSettingsProvider } from "../context/ToolBarLeftContext.tsx";
import MultiCursor from "../components/room/Multicursor/MultiCursor";

//image upload function
import { handleImageUpload } from "../components/room/Multicursor/tools/imageUpload.ts";

import { Menu } from "lucide-react";

import Tools from "../components/room/Tools.tsx";
import ToolBarContainer from "../components/room/LeftToolBar/ToolBarContainer.tsx";
import HamberMenu from "../components/room/HamberMenu.tsx";
import  ImageUploadInterface from "../components/room/ImageUploadInterface.tsx";

type BoardImage = {
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
  const [openCursor, setOpenCursor] = useState(false);
  const images = useRef<BoardImage[]>([]);

  //redraw
  const [redrawVersion, setRedrawVersion] = useState(0);

  if (!roomId) return <div>Not found</div>;

  //hambergerMenu
  const [isHambergerMenuOpen, setIsHambergerMenuOpen] = useState(false);

  const [isViewMode, setIsViewMode] = useState(false);

  const [isImageUploadInterfaceOpen, setIsImageUploadInterfaceOpen] = useState(false);

  return (
    <>
      <WebRtcProvider roomId={roomId}>
        <ToolSettingsProvider>
          <div className="h-screen flex flex-col overflow-hidden">
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
                 {isViewMode&& <ToolBarContainer />}
                </>
              )}

              {isHambergerMenuOpen && (
                <HamberMenu
                  openCursor={openCursor}
                  setOpenCursor={setOpenCursor}
                  roomId={roomId}
                  setIsHambergerMenuOpen={setIsHambergerMenuOpen}
                />
              )}
              {/*center tools menu*/}
              {openCursor && isViewMode && (
                <div className="absolute top-10 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded text-white shadow-lg z-20 ">
                  <Tools setIsImageUploadInterfaceOpen={setIsImageUploadInterfaceOpen} />
                </div>
              )}
              {/*image upload interface*/}
              {openCursor&&isImageUploadInterfaceOpen && (
                <div  className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center px-6">
                  <ImageUploadInterface setIsImageUploadInterfaceOpen={setIsImageUploadInterfaceOpen} />
                </div>
              )}

              {/* cursor interface not open*/}
              {!openCursor && (
                <>
                  <MainContent
                    openCursor={openCursor}
                    setOpenCursor={setOpenCursor}
                  />
                </>
              )}

              {openCursor && (
                <MultiCursor
                  roomId={roomId}
                  imageUpdate={redrawVersion}
                  images={images}
                  openCursor={openCursor}
                  setOpenCursor={setOpenCursor}
                  setIsViewMode={setIsViewMode}
                />
              )}
            </main>
          </div>
        </ToolSettingsProvider>
      </WebRtcProvider>
    </>
  );
}
