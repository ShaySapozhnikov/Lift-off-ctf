import './App.css';
import CountDown from './components/countDown'; 

export default function App() {
  return (
    <body class ="bg-zinc-900">
    
      <div className="grid grid-cols-2 grid-rows-2 gap-5 w-[1100px]">

        
       
        <div className="relative bg-zinc-900 h-[400px] border-2 border-gray-500 border-dashed rounded-md">
        <h1 class="p-3 text-white italic font-semibold hover:scale-125 transition-transform duration-300">------Leader Board------</h1>

      
        </div>

       
        <CountDown />

        <div className="bg-zinc-900 p-4 col-span-2 h-[200px] border-2 border-gray-500 border-dashed rounded-md mt-4">
        <h1 class="p-1 text-white italic font-semibold text-left"> -crew chat-</h1>
        <input type="text" />

          
        </div>
      </div>

      
    </body>
    
  );
}
