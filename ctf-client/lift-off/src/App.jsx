import './App.css';
import CountDown from './components/countDown'; 
import CrewChat from './components/crewChat';

export default function App() {
  
  return (
    <div className="bg-zinc-900 min-h-screen flex justify-center items-center">
      <div className="grid grid-cols-2 grid-rows-2 gap-5 w-[1100px]">
        <div className="relative bg-zinc-900 h-[400px] border-2 border-gray-500 border-dashed rounded-md">
          <h1 className="p-3 text-white italic font-semibold hover:scale-125 transition-transform duration-300">
            ------Leader Board------
          </h1>
        </div>

        <CountDown />
        <CrewChat />


      </div>
    </div>
  );
}
