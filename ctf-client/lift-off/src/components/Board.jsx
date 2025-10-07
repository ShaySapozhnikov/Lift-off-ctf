import { useState, useEffect } from "react";
import { supabase } from "../singletonSupabase";

function Board() {
  const [leaders, setLeaders] = useState([]);

  async function fetchLeaderboard() {
    const { data, error } = await supabase.rpc("get_leaderboard");
    if (error) {
      console.error("Error fetching leaderboard:", error);
      return;
    }
    setLeaders(data);
  }

  useEffect(() => {
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative bg-zinc-900 min-h-[300px] sm:min-h-[350px] md:h-[400px] border-2 border-gray-500 border-dashed rounded-md overflow-hidden">
      <h1 className="p-2 sm:p-3 text-white text-center italic font-semibold text-sm sm:text-base hover:scale-110 sm:hover:scale-125 transition-transform duration-300">
        ------Leader Board------
      </h1>
      <ul className="text-white text-left pb-3 px-3 sm:px-4 md:ml-[40px] list-inside space-y-2 sm:space-y-2 text-xs sm:text-sm md:text-base overflow-y-auto max-h-[250px] sm:max-h-[300px] md:max-h-[340px]">
        {leaders.map((leader, index) => (
          <li key={index} className="break-words">
            <span className="font-semibold">{index + 1}</span> - {leader.username} : {leader.points} pts
            <span className="block sm:inline sm:before:content-[':_'] text-gray-400 mt-1 sm:mt-0 sm:ml-1 text-[10px] sm:text-xs md:text-sm">
              Last Flag {new Date(leader.last_flag_time).toLocaleTimeString()}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Board;