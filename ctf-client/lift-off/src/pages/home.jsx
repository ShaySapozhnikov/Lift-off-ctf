import React from "react";
import { useNavigate } from "react-router-dom";
import { SpeedInsights } from "@vercel/speed-insights/next"

import Board from "../components/Board";
import CountDown from "../components/countDown";
import TerminalChat from "../components/TerminalChat";
import ChatLog from "../components/ChatLog";

function Home() {
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate('/flags');
  };

  return (
    <div className="bg-zinc-900 min-h-screen relative flex flex-col">
      {/* Header with logo */}
      <div className="flex justify-center pt-6 pb-4">
        <img 
          src="/logo_white_fullname.png" 
          alt="Logo" 
          className="h-12 w-auto opacity-90 hover:opacity-100 transition-opacity duration-300 cursor-pointer hover:scale-105 transform"
          onClick={handleLogoClick}
        />
      </div>
      {/* Main content area */}
      <div className="flex-1 flex justify-center items-center px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 grid-rows-4 md:grid-rows-2 gap-6 w-full max-w-[1200px]">
          <Board />
          <CountDown />
          <TerminalChat />
          <ChatLog />
        </div>
      </div>


      {/* Footer spacer to ensure content doesn't touch bottom */}
      <div className="h-4"></div>
      <div className  = "...i am not here...">
        <p className="text-zinc-900">{"CTF{w3lc0m3_4b04rd}"}</p>
      
      </div>
      
    </div>
  );
}

export default Home;