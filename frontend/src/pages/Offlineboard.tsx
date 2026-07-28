import { useRef, useState } from "react";
import { Menu, TableOfContents } from "lucide-react";
import { ToolSettingsProvider } from "../context/ToolBarLeftContext.tsx";
import OfflineMultiCursor from "../components/home/OfflineMulticursor.tsx";
import OfflineTools from "../components/home/OfflineTools.tsx";
import ToolBarContainer from "../components/room/LeftToolBar/ToolBarContainer.tsx";
import OfflineHamberMenu from "../components/home/OfflineHamberMenu.tsx";
import type { BoardImage } from "../components/room/Multicursor/types.ts";
import ImageUploadInterface from "../components/room/ImageUploadInterface.tsx";

export default function Offlineboard() {
  const [isHambergerMenuOpen, setIsHambergerMenuOpen] = useState(false);
  const images = useRef<BoardImage[]>([]);
  const [isImageUploadInterfaceOpen, setIsImageUploadInterfaceOpen] =
    useState(false);
  return (
    <main className="h-screen flex-1 flex static overflow-hidden">
      <button
        onClick={() => setIsHambergerMenuOpen(!isHambergerMenuOpen)}
        className="absolute text-white z-20 left-5 top-5 border border-white rounded"
      >
        <TableOfContents />
      </button>

      <button
        onClick={() => setIsHambergerMenuOpen(!isHambergerMenuOpen)}
        className="absolute text-white z-20 left-5 top-5  bg-slate-800 p-2 rounded"
      >
        <Menu />
      </button>

      <ToolSettingsProvider>
      {isHambergerMenuOpen && <OfflineHamberMenu />}
        {isImageUploadInterfaceOpen && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center px-6">
            <ImageUploadInterface
              images={images}
              setIsImageUploadInterfaceOpen={setIsImageUploadInterfaceOpen}
            />
          </div>
        )}

        <ToolBarContainer />
        <div className="absolute top-10 left-1/2 -translate-x-1/2 -translate-y-1/2  text-white shadow-lg z-20 ">
          <OfflineTools
            setIsImageUploadInterfaceOpen={setIsImageUploadInterfaceOpen}
          />
        </div>
        <OfflineMultiCursor images={images} />
      </ToolSettingsProvider>
    </main>
  );
}
