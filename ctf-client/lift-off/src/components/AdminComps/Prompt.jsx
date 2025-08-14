import { useEffect, useRef, useState } from "react";
export default function Prompt() {
    const [buf, setBuf] = useState("");
    const [history, setHistory] = useState([]);
    const [idx, setIdx] = useState(0);
    const inputRef = useRef(null);
    const containerRef = useRef(null);
  
    const onSubmit = (value) => {
      const v = value.trim().toLowerCase();
      if (!v) return;
      const out = [];
      if (v === "help") {
        out.push("AVAILABLE> help, status, clear, shutdown");
      } else if (v === "status") {
        out.push("STATUS> processes: 7 | anomaly: ACTIVE | net: OFFLINE");
      } else if (v === "shutdown") {
        out.push("SYSTEM> permission denied. anomaly intercept.");
      } else if (v === "clear") {
        setHistory([]);
        setBuf("");
        setIdx(0);
        return;
      } else {
        out.push(`UNKNOWN> ${v}`);
      }
      setHistory((h) => [...h, `> ${v}`, ...out]);
      setBuf("");
      setIdx(0);
    };
  
    // Focus input on mount and whenever it loses focus
    useEffect(() => {
      const input = inputRef.current;
      if (!input) return;
      
      input.focus();
      
      // Refocus when clicking anywhere in the container
      const handleClick = () => {
        input.focus();
      };
      
      // Refocus when input loses focus (unless user is selecting text)
      const handleBlur = () => {
        setTimeout(() => {
          if (document.activeElement !== input) {
            input.focus();
          }
        }, 10);
      };
      
      // Listen for clicks on the entire document to refocus
      const handleDocumentClick = () => {
        input.focus();
      };
  
      const container = containerRef.current;
      if (container) {
        container.addEventListener('click', handleClick);
      }
      
      input.addEventListener('blur', handleBlur);
      document.addEventListener('click', handleDocumentClick);
      
      return () => {
        if (container) {
          container.removeEventListener('click', handleClick);
        }
        input.removeEventListener('blur', handleBlur);
        document.removeEventListener('click', handleDocumentClick);
      };
    }, []);
  
    // Also refocus when new content is added
    useEffect(() => {
      const input = inputRef.current;
      if (input) {
        setTimeout(() => input.focus(), 50);
      }
    }, [history]);
  
    return (
      <div ref={containerRef} className="mt-4">
        {history.map((h, i) => (
          <div key={i} className="text-white/80">{h}</div>
        ))}
        <div className="flex items-center gap-2 mt-1">
          <span className="text-white/70">&gt;</span>
          {/* Invisible input to capture keystrokes while we render custom caret */}
          <input
            ref={inputRef}
            value={buf}
            onChange={(e) => setBuf(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onSubmit(buf);
              }
              if (e.key === "ArrowUp") {
                e.preventDefault();
                setIdx((n) => Math.min(n + 1, history.length - 1));
              }
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setIdx((n) => Math.max(n - 1, 0));
              }
            }}
            className="absolute opacity-0 pointer-events-none"
            style={{
              position: 'fixed',
              left: '-9999px',
              top: '-9999px'
            }}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
          />
          <TerminalInput value={buf} />
        </div>
      </div>
    );
  }
  

  function TerminalInput({ value }) {
    const [cursorOn, setCursorOn] = useState(true);
    useEffect(() => {
      const t = setInterval(() => setCursorOn((c) => !c), 550);
      return () => clearInterval(t);
    }, []);
    return (
      <div className="font-mono text-white/90">
        <span>{value}</span>
        <span className={"ml-0.5 inline-block w-2 h-4 align-[-2px] " + (cursorOn ? "bg-white/80" : "bg-transparent border border-white/30")}></span>
      </div>
    );
  }