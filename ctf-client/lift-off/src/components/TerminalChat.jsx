import React, { useState, useRef, useEffect } from "react";
import { supabase } from '../singletonSupabase';
import { getOrSetUserId , getUserName} from "../../utils/cookieUser";
import leoProfanity from "leo-profanity";

function TerminalChat() {
  const [input, setInput] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const spanRef = useRef(null);
  const inputRef = useRef(null);
  const lastEnterTime = useRef(0);
  const intervalRef = useRef(null);
  const userId = getOrSetUserId();
  const username = getUserName(userId);

  // Adjust input width dynamically but constrain within container
  useEffect(() => {
    if (spanRef.current && inputRef.current) {
      const maxWidth = 300; // Maximum width to prevent overflow
      const contentWidth = spanRef.current.offsetWidth + 10;
      inputRef.current.style.width = `${Math.min(contentWidth, maxWidth)}px`;
    }
  }, [input]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Clean up interval on unmount
  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  const startCooldown = () => {
    // Clear existing interval before starting new one
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
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

  const handleKeyDown = async (e) => {
    if (e.key === "Enter" && input.trim() !== "") {
      if (cooldown === 0) {
        try {
          const cleanedMessage = leoProfanity.clean(input.trim());
          const { error } = await supabase.from("messages").insert([
            { content: cleanedMessage, user_id: userId, username },
          ]);
          if (error) throw error;
          setInput("");
          startCooldown();
        } catch (error) {
          console.error('Failed to send message:', error);
        }
      } else {
        console.log(`Wait ${cooldown} seconds before sending again.`);
      }
    }
  };

  return (
    <div className="bg-zinc-900 p-4 col-span-1 h-[200px] border-2 border-gray-500 border-dashed rounded-md mt-4 overflow-hidden">
      <h1 className="p-1 text-white italic font-semibold text-left">-Terminal-</h1>
      
      {/* Input container with proper overflow handling */}
      <div className="flex items-center space-x-1 font-mono text-white bg-zinc-900 relative overflow-hidden pr-4">
        <span className="mt-2 flex-shrink-0">theUnhackable</span>
        <span className="mt-2 text-amber-100 flex-shrink-0">@chat$</span>
        
        {/* Hidden span for width calculation */}
        <span ref={spanRef} className="invisible absolute whitespace-pre">
          {input || " "}
        </span>
        
        <div className="inline-flex items-center relative flex-1">
  {/* Hidden span for width calculation */}
  <span ref={spanRef} className="invisible absolute whitespace-pre font-mono">
    {input || " "}
  </span>
  
  <input
    maxLength={100}
    type="text"
    ref={inputRef}
    value={input}
    onKeyDown={handleKeyDown}
    onChange={(e) => setInput(e.target.value)}
    className="bg-zinc-900 p-2 mt-2 text-white focus:outline-none focus:ring-0 caret-transparent flex-1"
    autoComplete="off"
    spellCheck="false"
    aria-label="Crew chat input"
    style={{ minWidth: '0px' }}
  />
  
  <span 
    className="mt-2 animate-blinkText absolute pointer-events-none"
    style={{ 
      left: `${(spanRef.current?.offsetWidth || 0) + 12}px` // 8px for padding
    }}
  >
    |
  </span>
</div>
      </div>

      {cooldown > 0 && (
        <div className="text-left text-white font-mono mt-2 text-sm">
          Next message available in {cooldown} second{cooldown > 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
}

export default TerminalChat;