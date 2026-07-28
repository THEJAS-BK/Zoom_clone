import { useEffect, useRef, useState } from "react";
import { Menu, TableOfContents } from "lucide-react";
import { ToolSettingsProvider, useToolSettings } from "../context/ToolBarLeftContext.tsx";
import OfflineMultiCursor from "../components/home/OfflineMulticursor.tsx";
import OfflineTools from "../components/home/OfflineTools.tsx";
import ToolBarContainer from "../components/room/LeftToolBar/ToolBarContainer.tsx";
import OfflineHamberMenu from "../components/home/OfflineHamberMenu.tsx";
import type { BoardImage } from "../components/room/Multicursor/types.ts";
import ImageUploadInterface from "../components/room/ImageUploadInterface.tsx";
import { useParams } from "react-router-dom";
import api from "../utils/axios.ts";
import { distributeElements } from "../components/home/tools/distributeElements.ts";

export default function Offlineboard() {
  return(
  <ToolSettingsProvider>
    <OfflineboardContent />
  </ToolSettingsProvider>
  )
}

function OfflineboardContent() {
  const [isHambergerMenuOpen, setIsHambergerMenuOpen] = useState(false);
  const images = useRef<BoardImage[]>([]);
  const [isImageUploadInterfaceOpen, setIsImageUploadInterfaceOpen] =
    useState(false);
  const {linesRef,textBoxesRef,shapesRef,setBoardColor,strokes} = useToolSettings();
    const {id} = useParams();
  useEffect(()=>{
    if(id==="new")return;

     const fetchBoardContent=async()=>{
       try{
        const val=await api.get(`/boards/offline/${id}`)
        if(val.data){
          setBoardColor(val.data.boardColor);
          strokes.current=val.data.strokes;
          distributeElements(val.data.elements, linesRef, textBoxesRef, shapesRef, images);
        }
      }
      catch(err){
        console.error("Error fetching offline board:", err);
      }
     }
     fetchBoardContent();
  }, [])

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
    </main>
  );
}
