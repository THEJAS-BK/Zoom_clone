import {
  Menu,
  MessagesSquare,
  Mic,
  MicOff,
  Presentation,
  SquareArrowRightExit,
  Users,
  Video,
  VideoOff,
} from "lucide-react";
import { useEffect, useState } from "react";
import ChatInterface from "./ChatInterface";
import ParticipantList from "./ParticipantList";
import { socket } from "../../services/socket";
import { useNavigate } from "react-router-dom";
interface VideoOptionsProp {
  audioToggle: () => void;
  videoToggle: () => void;
  isAudioMuted: boolean;
  isVideoMuted: boolean;
  openCursor: boolean;
  setOpenCursor: React.Dispatch<React.SetStateAction<boolean>>;
}
export default function OptionsFooter({
  audioToggle,
  videoToggle,
  isAudioMuted,
  isVideoMuted,
  openCursor,
  setOpenCursor,
}: VideoOptionsProp) {
  const [tab, setTab] = useState("");

  const handleTabClick = (tabName: string) => {
    setTab((prev) => (prev === tabName ? "" : tabName));
  };

  const navigate=useNavigate();

    const handleExitRoom=()=>{
     socket.disconnect();
     navigate("/dashboard")
    }


  return (
    <>
      {openCursor && (
        <>
          <div className="flex flex-1 gap-3 justify-center rounded-full px-3 py-2">
            <button
              onClick={audioToggle}
              className=" hover:bg-gray-400 text-white p-2 rounded-full"
            >
              {isAudioMuted ? <MicOff size={20} /> : <Mic size={20} />}
            </button>
            <button
              onClick={videoToggle}
              className=" hover:bg-gray-400 text-white p-2 rounded-full"
            >
              {isVideoMuted ? <VideoOff size={20} /> : <Video size={20} />}
            </button>
          </div>

          <hr className="border-t border-zinc-700 w-full" />
        </>
      )}

      {!openCursor && (
        <div className="flex justify-between items-center w-full px-6 bg-zinc-800 ">
          <div className="flex gap-3  rounded-full px-3 py-2">
            <button
              onClick={audioToggle}
              className=" hover:bg-gray-400 text-white p-2 rounded-full"
            >
              {isAudioMuted ? <MicOff size={20} /> : <Mic size={20} />}
            </button>
            <button
              onClick={videoToggle}
              className=" hover:bg-gray-400 text-white p-2 rounded-full"
            >
              {isVideoMuted ? <VideoOff size={20} /> : <Video size={20} />}
            </button>
          </div>

          <div className="flex gap-3  rounded-full px-3 py-2">
            <button
            title="open Multi-board"
              onClick={() => setOpenCursor(!openCursor)}
              className=" hover:bg-gray-400 text-white p-2 rounded-full"
            >
              <Presentation size={20} />
            </button>
            <div className="relative">
              <button
                onClick={() => handleTabClick("chat")}
                className="hover:bg-gray-400 text-white p-2 rounded-full"
              >
                <MessagesSquare size={20} />
              </button>

              {tab === "chat" && (
                <div className="absolute  bottom-[110%]  right-30  z-10">
                  <ChatInterface onClose={() => setTab("")} />
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => handleTabClick("participants")}
                className="hover:bg-gray-400 text-white p-2 rounded-full"
              >
                <Users size={20} />
              </button>

              {tab === "participants" && (
                <div  className="absolute bottom-[110%] right-30 z-10">
                  <ParticipantList onClose={() => setTab("")}  />
                </div>
              )}
            </div>
          </div>

          {/* Right group: exit */}
          <div className="flex bg-red-600 rounded-full px-3 py-2">
            <button
            onClick={handleExitRoom}
            className="bg-red-500 hover:bg-red-400 text-white ">
              <SquareArrowRightExit size={20} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
