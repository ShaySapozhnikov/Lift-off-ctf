import React, { useState, useEffect } from "react";
import "../App.css"

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
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const countDownDate = new Date("Jan 5, 2030 15:37:25").getTime(); // get from db later!!!

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = countDownDate - now;

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(timer);
  }, []);



  return (
    <div className="bg-zinc-900 h-[400px] border-2 border-gray-500 border-dashed rounded-md p-2 overflow-auto">
      <pre className="text-white text-left font-mono text-[10px] leading-tight whitespace-pre-wrap p-4 mt-[10px] animate-float">
        {asciiArt}
      </pre>
      <h1 className=" italic font-bold text-white text-center text-lg font-mono mt-10 animate-pulse">
        Countdown: {timeLeft}
      </h1>
    </div>
  );
}
