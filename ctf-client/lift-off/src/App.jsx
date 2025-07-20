import './App.css';
import CountDown from './components/countDown'; 
import TerminalChat from './components/TerminalChat';
import Board from './components/Board';
import ChatLog from './components/ChatLog';

export default function App() {
  
  return (
    <div className="bg-zinc-900 min-h-screen flex justify-center items-center">
      <div className="grid grid-cols-2 grid-rows-2 gap-5 w-[1100px]">
        <Board />
        <CountDown />
        <TerminalChat />
        <ChatLog />
      </div>
    </div>
  );
}
