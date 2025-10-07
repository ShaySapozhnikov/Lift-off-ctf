import React from "react";
import { useNavigate } from "react-router-dom";
import { SpeedInsights } from "@vercel/speed-insights/next";
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
      <div className="flex justify-center pt-4 pb-3 px-4 sm:pt-6 sm:pb-4">
        <img
          src="/logo_white_fullname.png"
          alt="Logo"
          className="h-8 w-auto sm:h-10 md:h-12 opacity-90 hover:opacity-100 active:opacity-100 transition-opacity duration-300 cursor-pointer hover:scale-105 active:scale-105 transform touch-manipulation"
          onClick={handleLogoClick}
        />
      </div>
      
      {/* Main content area */}
      <div className="flex-1 flex justify-center items-start sm:items-center px-3 py-4 sm:px-4 sm:py-6 md:py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6 w-full max-w-[1200px]">
          <Board />
          <CountDown />
          <TerminalChat />
          <ChatLog />
        </div>
      </div>
      
      {/* Footer spacer */}
      <div className="h-4 sm:h-6"></div>
      
      <div className="hidden">
        <p className="text-zinc-900">{"CTF{w3lc0m3_4b04rd}"}</p>
      </div>
      
      <SpeedInsights />
    </div>
  );
}

export default Home;