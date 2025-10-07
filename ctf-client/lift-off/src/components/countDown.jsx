
import React, { useState, useEffect, useRef } from "react";
import { supabase } from '../singletonSupabase';



const asciiArt = `
                                 ___
                              __,' __\`.                _..----....____
                 __...--.'\`\`;.   ,.   ;\`\`--..__     .'    ,-._    _.-'
            _..-''-------'   \`'   \`'   \`'       \`\`-''._   (,;') _,\\'
          ,'________________                          \\ \`-._\`-',' 
          \`._              \`\`\`\`\`\`\`\`\`\`\`------...___   '-.._'-:
              \`\`\`--.._      ,.                     \`\`\`\`--...__\\-.
                    \`.--. \`-\`                       ____    |  |\`
                      \`. \`.                       ,' \`\`\`\`\`.  ;  ;\`
                        \`._\`.        __________   \`.      \\'__/\`
                          \`-:._____/______/___/____\`.     \\  
                                                    \`.    \\
                                                      \`.   \`.___
                                                       \`------'\`
`;

export default function CountDown() {
  const [timeLeft, setTimeLeft] = useState("See you next time!");
  const timerRef = useRef(null);
  const targetRef = useRef(null); // store current target_time

  useEffect(() => {
    const updateCountdown = async () => {
      const { data, error } = await supabase
        .from("countdowns")
        .select("*")
        .eq("name", "mission")
        .single();

      if (error) {
        console.error(error);
        return;
      }

      if (!data.running || !data.target_time) {
        setTimeLeft("See you next time!");
        clearInterval(timerRef.current);
        timerRef.current = null;
        targetRef.current = null;
        return;
      }

      const newTarget = new Date(data.target_time).getTime();

      // Only start a new timer if target_time changed
      if (targetRef.current !== newTarget) {
        targetRef.current = newTarget;
        if (timerRef.current) clearInterval(timerRef.current);

        timerRef.current = setInterval(() => {
          const now = Date.now();
          const distance = newTarget - now;

          if (distance <= 0) {
            setTimeLeft("00d 00h 00m 00s");
            clearInterval(timerRef.current);
            timerRef.current = null;
            return;
          }

          const days = Math.floor(distance / (1000 * 60 * 60 * 24));
          const hours = Math.floor(
            (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
          );
          const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((distance % (1000 * 60)) / 1000);

          setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
        }, 1000);
      }
    };

    // Poll every 5 seconds for DB changes
    const poller = setInterval(updateCountdown, 5000);

    // Initial fetch
    updateCountdown();

    return () => {
      clearInterval(poller);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <div className="bg-zinc-900 h-[400px] sm:h-[450px] md:h-[500px] border border-gray-500 border-dashed rounded-md p-2 sm:p-4 overflow-auto">
      <div className="z-0 animate-speedLine1 text-[7px] sm:text-xs">...........</div>
      <pre className="text-white text-left font-mono text-[7px] sm:text-[10px] leading-tight whitespace-pre-wrap p-2 sm:p-4 mt-[10px] animate-float z-10">
        {asciiArt}
      </pre>
      <div className="z-0 animate-speedLine2 text-[7px] sm:text-xs">...........</div>
      <h1 className="italic font-bold text-white text-center text-base sm:text-lg md:text-xl font-mono mt-6 sm:mt-8 md:mt-10 animate-pulse px-2">
        Countdown: {timeLeft}
      </h1>
    </div>
  );
}
