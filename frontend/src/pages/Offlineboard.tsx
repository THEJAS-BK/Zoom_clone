import { useEffect, useRef, useState } from "react";
import { Menu, TableOfContents } from "lucide-react";
import {
  ToolSettingsProvider,
  useToolSettings,
} from "../context/ToolBarLeftContext.tsx";
import OfflineMultiCursor from "../components/home/OfflineMulticursor.tsx";
import OfflineTools from "../components/home/OfflineTools.tsx";
import ToolBarContainer from "../components/room/LeftToolBar/ToolBarContainer.tsx";
import OfflineHamberMenu from "../components/home/OfflineHamberMenu.tsx";
import type { BoardImage } from "../components/room/Multicursor/types.ts";
import ImageUploadInterface from "../components/room/ImageUploadInterface.tsx";
import { useParams } from "react-router-dom";
import api from "../utils/axios.ts";
import { distributeElements } from "../components/home/tools/distributeElements.ts";
import NotSavedBoard from "../components/home/NotSavedBoard.tsx";
import GoLiveInterface from "../components/home/GoLiveInterface.tsx";

export default function Offlineboard() {
  return (
    <ToolSettingsProvider>
      <OfflineboardContent />
    </ToolSettingsProvider>
  );
}

function OfflineboardContent() {
  const [isHambergerMenuOpen, setIsHambergerMenuOpen] = useState(false);
  const images = useRef<BoardImage[]>([]);
  const [isImageUploadInterfaceOpen, setIsImageUploadInterfaceOpen] =
    useState(false);
  const [openBoardNotSavedInterface,setOpenBoardNotSavedInterface]=useState(false)
  const [openGoLiveInterface,setOpenGoLiveInterface]=useState(false)
  const {
    linesRef,
    textBoxesRef,
    shapesRef,
    setBoardColor,
    strokes,
    activeSavedBoardId,
    setBoardName,
    doRedrawRef,
  } = useToolSettings();
  const { id } = useParams();
  useEffect(() => {
    if (id === "new" || !id) return;
    activeSavedBoardId.current = id;
    const fetchBoardContent = async () => {
      try {
        const val = await api.get(`/boards/offline/${id}`);
        if (val.data) {
          setBoardColor(val.data.boardColor);
          setBoardName(val.data.name);
          strokes.current = val.data.strokes;
          distributeElements(
            val.data.elements,
            linesRef,
            textBoxesRef,
            shapesRef,
            images,
          );
        }
        doRedrawRef.current?.();
      } catch (err) {
        console.error("Error fetching offline board:", err);
      }
    };
    fetchBoardContent();
  }, []);

  return (
    <main className="h-screen flex-1 flex static overflow-hidden">
      <button
        data-hamburger-trigger
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

      {isHambergerMenuOpen && (
        <OfflineHamberMenu
          images={images}
          setIsHambergerMenuOpen={setIsHambergerMenuOpen}
          setOpenBoardNotSavedInterface={setOpenBoardNotSavedInterface}
          setOpenGoLiveInterface={setOpenGoLiveInterface}
        />
      )}
      {isImageUploadInterfaceOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center px-6">
          <ImageUploadInterface
            images={images}
            setIsImageUploadInterfaceOpen={setIsImageUploadInterfaceOpen}
          />
        </div>
      )}
       {openBoardNotSavedInterface && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center px-6">
        <NotSavedBoard setOpenBoardNotSavedInterface={setOpenBoardNotSavedInterface} />
        </div>
      )}
      {openGoLiveInterface && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center px-6">
          <GoLiveInterface setOpenGoLiveInterface={setOpenGoLiveInterface} />
        </div>
      )}

      <ToolBarContainer />
      <div className="absolute top-10 left-1/2 -translate-x-1/2 -translate-y-1/2  text-white shadow-lg z-20 ">
        <OfflineTools
          setIsImageUploadInterfaceOpen={setIsImageUploadInterfaceOpen}
        />
      </div>
      <OfflineMultiCursor images={images} />
    </main>
  );
}
