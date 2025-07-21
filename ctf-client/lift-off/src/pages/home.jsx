import React from "react";

import Board from '../components/Board';
import CountDown from "../components/countDown";
import TerminalChat from "../components/TerminalChat";
import ChatLog from "../components/ChatLog"

function home(){
  return(
    <div className="bg-zinc-900 min-h-screen flex justify-center items-center pt-20">
      <div className="grid grid-cols-2 grid-rows-2 gap-5 w-[1100px]">
        <Board />
        <CountDown />
        <TerminalChat />
        <ChatLog />
      </div>
    </div>
  );
}

export default home