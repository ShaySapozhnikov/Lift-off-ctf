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
    fetchLeaderboard(); // initial fetch
    const interval = setInterval(fetchLeaderboard, 10000); // update every 10 sec
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative bg-zinc-900 h-[400px] border-2 border-gray-500 border-dashed rounded-md">
      <h1 className="p-3 text-white text-center italic font-semibold hover:scale-125 transition-transform duration-300">
        ------Leader Board------
      </h1>
      <ul className="text-white text-left pb-3 ml-[40px] list-inside space-y-2">
        {leaders.map((leader, index) => (
          <li key={index}>
            {index + 1} - {leader.username} : {leader.points} pts : Last Flag Captured at{" "}
            <span className="text-gray-400 ml-1">
              {new Date(leader.last_flag_time).toLocaleTimeString()}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Board;
