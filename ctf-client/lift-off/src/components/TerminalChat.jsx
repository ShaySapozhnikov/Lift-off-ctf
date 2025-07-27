import React, { useState, useRef, useEffect } from "react";

function TerminalChat() {
  const [input, setInput] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const spanRef = useRef(null);
  const inputRef = useRef(null);
  const lastEnterTime = useRef(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (spanRef.current && inputRef.current) {
      inputRef.current.style.width = `${spanRef.current.offsetWidth + 10}px`;
    }
  }, [input]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Clean up interval on unmount
  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  const startCooldown = () => { // needs to be in the backend api 
    setCooldown(10);
    lastEnterTime.current = Date.now();

    intervalRef.current = setInterval(() => {
      const secondsPassed = Math.floor((Date.now() - lastEnterTime.current) / 1000);
      const timeLeft = 10 - secondsPassed;

      if (timeLeft <= 0) {
        clearInterval(intervalRef.current);
        setCooldown(0);
      } else {
        setCooldown(timeLeft);
      }
    }, 1000);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && input.trim() !== "") {
      const now = Date.now();

      if (cooldown === 0) {
        console.log("Message sent:", input);
        setInput("");
        startCooldown();
      } else {
        console.log(`Wait ${cooldown} seconds before sending again.`);
      }
    }
  };

  return (
    <div className="bg-zinc-900 p-4 col-span-1 h-[200px] border-2 border-gray-500 border-dashed rounded-md mt-4">
      <h1 className="p-1 text-white italic font-semibold text-left">-Terminal-</h1>
      <div className="flex items-center space-x-1 font-mono text-white bg-zinc-900 relative">
        <span className="mt-2">theUnhackable</span>
        <span className="mt-2 text-amber-100">@chat$</span>
        <span
          ref={spanRef}
          className="invisible absolute whitespace-pre p-2"
        >
          {input || " "}
        </span>

        <div className="inline-flex items-center relative">
          <input
            maxLength={20}
            type="text"
            ref={inputRef}
            value={input}
            onKeyDown={handleKeyDown}
            onChange={(e) => setInput(e.target.value)}
            className="bg-zinc-900 p-2 mt-2 text-white focus:outline-none focus:ring-0 caret-transparent"
            autoComplete="off"
            spellCheck="false"
            aria-label="Crew chat input"
          />
          <span className="ml-[-24px] mt-2 animate-blinkText relative z-10">|</span>
        </div>
      </div>

      {cooldown > 0 && (

        <div className=" text-left text-white font-mono mt-2 text-sm">
          Next message available in  {cooldown} second{cooldown > 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
}

export default TerminalChat;
