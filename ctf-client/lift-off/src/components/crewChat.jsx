import React, { useState, useRef, useEffect } from "react";
import '../App.css';

function CrewChat() {
  const [input, setInput] = useState("");
  const spanRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (spanRef.current && inputRef.current) {
      inputRef.current.style.width = `${spanRef.current.offsetWidth + 10}px`;
    }
  }, [input]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && input.trim() !== "") {
        // Send
        setInput("");
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
          <span className="ml-[-24px] mt-2 animate-blink relative z-10">|</span>
        </div>
      </div>
    </div>
  );
}

export default CrewChat;
