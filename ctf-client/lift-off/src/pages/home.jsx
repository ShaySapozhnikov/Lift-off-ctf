import React from "react";

import Board from "../components/Board";
import CountDown from "../components/countDown";
import TerminalChat from "../components/TerminalChat";
import ChatLog from "../components/ChatLog";
import FlagIcon from "../components/FlagIcon";

function Home() {
  return (
    <div className="bg-zinc-900 min-h-screen relative pt-20 flex justify-center items-center">
      {/* Flag icon component */}
      <FlagIcon />

      {/* Main content grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 grid-rows-4 md:grid-rows-2 gap-5 w-full max-w-[1100px] px-4">
        <Board />
        <CountDown />
        <TerminalChat />
        <ChatLog />
      </div>
    </div>
  );
}

export default Home;