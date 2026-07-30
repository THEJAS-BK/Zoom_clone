import { useEffect, useRef, useState } from "react";
import Hero from "../components/home/Hero";
import NavBar from "../components/home/NavBar";
import { socket } from "../services/socket";
import MyImages from "../components/home/MyImages";



export default function Dashboard() {
  const [connectionError, setConnectionError] = useState(false);
  const [openMyImagesInterfaceOpen, setMyImageInterfaceOpen] = useState(false);
  const myBoardsRef=useRef<HTMLDivElement | null>(null);

  const scrollToBoards=()=>{
    myBoardsRef.current?.scrollIntoView({
      behavior:"smooth"
    })
  }

  return (
    <div className="flex flex-col h-screen">
      {openMyImagesInterfaceOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center px-6">
          <MyImages setMyImageInterfaceOpen={setMyImageInterfaceOpen} />
        </div>
      )}
      <NavBar setMyImageInterfaceOpen={setMyImageInterfaceOpen} scrollToBoards={scrollToBoards} />
      {connectionError && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-lg z-99">
          Connection failed, please refresh
        </div>
      )}
      <Hero myBoardsRef={myBoardsRef} />
    </div>
  );
}
