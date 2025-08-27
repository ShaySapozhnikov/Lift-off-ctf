import React, { useState, useEffect, useRef } from "react";
import ShipIcon from "../components/shipIcon";

function HeaderBar({ memoryUsage }) {
  const getMemoryColor = () => {
    if (memoryUsage >= 90) return "text-red-400";
    if (memoryUsage >= 80) return "text-yellow-400";
    return "text-green-400";
  };

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between text-[11px] tracking-widest uppercase text-white/60">
        <div className="flex items-center gap-3">
          <span className="inline-block h-2 w-2 rounded-full bg-white/80 animate-pulse" />
          <span>// link-sec</span>
        </div>
        <div className="flex items-center gap-4">
          <span className={`${getMemoryColor()}`}>MEM: {memoryUsage}%</span>
          <span>v2.1</span>
          <span>[ Unhackable ]</span>
        </div>
      </div>
      <div className="mt-2 h-px w-full bg-gradient-to-r from-white/40 via-white/20 to-transparent" />
    </div>
  );
}

function TerminalInterface() {
  const [history, setHistory] = useState([]);
  const [currentInput, setCurrentInput] = useState("");
  const [isBooting, setIsBooting] = useState(true);
  const [bootLines, setBootLines] = useState([]);
  const [cursorVisible, setCursorVisible] = useState(true);
  const [commandCount, setCommandCount] = useState(0);
  const [memoryUsage, setMemoryUsage] = useState(67);
  const [fadeIn, setFadeIn] = useState(false);
  const [currentBootLine, setCurrentBootLine] = useState("");
  const [currentBootIndex, setCurrentBootIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [isExecutingCommand, setIsExecutingCommand] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [showAudioPrompt, setShowAudioPrompt] = useState(true);
  const inputRef = useRef(null);
  const terminalRef = useRef(null);
  const audioContextRef = useRef(null);

  // Initialize audio context after user interaction
  const initializeAudio = async () => {
    if (audioEnabled || audioContextRef.current) return;
    
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) {
        console.warn("Web Audio API not supported");
        setShowAudioPrompt(false);
        return;
      }
      
      audioContextRef.current = new AudioContext();
      
      // Resume context if suspended
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }
      
      // Play a test sound to verify audio is working
      const testOsc = audioContextRef.current.createOscillator();
      const testGain = audioContextRef.current.createGain();
      testOsc.frequency.setValueAtTime(200, audioContextRef.current.currentTime);
      testGain.gain.setValueAtTime(0.05, audioContextRef.current.currentTime);
      testGain.gain.exponentialRampToValueAtTime(0.001, audioContextRef.current.currentTime + 0.1);
      testOsc.connect(testGain);
      testGain.connect(audioContextRef.current.destination);
      testOsc.start();
      testOsc.stop(audioContextRef.current.currentTime + 0.1);
      
      setAudioEnabled(true);
      setShowAudioPrompt(false);
      console.log("Audio initialized successfully");
    } catch (error) {
      console.error("Audio initialization failed:", error);
      setShowAudioPrompt(false);
    }
  };

  // Terminal typing sound effect with only 2 pitches - reduced frequency
  const playTypingSound = (charIndex = 0) => {
    if (!audioEnabled || !audioContextRef.current) return;
    
    // Only play sound for every 3rd character to reduce frequency
    if (charIndex % 4 !== 0) return;
    
    try {
      const audioCtx = audioContextRef.current;
      // Resume context if suspended (common on mobile)
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.type = "square";
      // Only 2 pitches - alternate between high and low
      const frequency = charIndex % 5 === 0 ? 200 : 250;
      oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);
      
      gainNode.gain.setValueAtTime(0.06, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + 0.05);
    } catch (error) {
      console.debug("Audio playback error:", error);
    }
  };

  // Initialize audio and fade in effect on mount
  useEffect(() => {
    setTimeout(() => setFadeIn(true), 100);
  }, []);

  // Boot sequence with typewriter effect
  useEffect(() => {
    const bootScript = [
      "SYSTEM BOOT INITIATED...",
      "Loading Activity Log Module...",
      "Navigation System status: OFFLINE",
      "Autopilot status: UNKNOWN", 
      "Backup status: ONLINE",
      "",
      "# Access Node: unhackable-Server-1",
      "[Protocol Ping: Autonomous Crawler Detected]",
      "Directive Response: Legacy Directives Found",
      "Status Code 403 – Path Restrictions Active",
      "• /redacted/",
      "• /redacted/",
      "• /redacted/",
      "Observation Mode: Passive Link Retained",
      "",
      "SYSTEM READY. Type 'help' for available commands.",
      ""
    ];

    if (currentBootIndex < bootScript.length) {
      const currentLine = bootScript[currentBootIndex];
      
      if (currentLine === "") {
        // Handle empty lines immediately
        setBootLines(prev => [...prev, ""]);
        setCurrentBootLine("");
        setCurrentBootIndex(prev => prev + 1);
        setCurrentCharIndex(0);
      } else {
        const typewriterInterval = setInterval(() => {
          if (currentCharIndex < currentLine.length) {
            setCurrentBootLine(currentLine.substring(0, currentCharIndex + 1));
            playTypingSound(currentCharIndex); // Add typing sound
            setCurrentCharIndex(prev => prev + 1);
          } else {
            clearInterval(typewriterInterval);
            setBootLines(prev => [...prev, currentLine]);
            setCurrentBootLine("");
            setCurrentBootIndex(prev => prev + 1);
            setCurrentCharIndex(0);
          }
        }, Math.random() * 30 + 20); // Random typing speed

        return () => clearInterval(typewriterInterval);
      }
    } else if (currentBootIndex === bootScript.length) {
      setIsBooting(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [currentBootIndex, currentCharIndex, audioEnabled]);

  // Cursor blink
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setCursorVisible(prev => !prev);
    }, 530);
    return () => clearInterval(cursorInterval);
  }, []);

  // Auto-scroll
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history, bootLines, currentInput, currentBootLine]);

  // Memory usage updates
  useEffect(() => {
    const baseMemory = 67;
    const memoryIncrease = commandCount * 8;
    setMemoryUsage(Math.min(baseMemory + memoryIncrease, 99));
  }, [commandCount]);

  // Auto-reboot when memory is high
  useEffect(() => {
    if (commandCount >= 5) {
      const rebootTimeout = setTimeout(() => {
        setHistory(prev => [...prev, 
          { type: 'output', content: "=== CRITICAL MEMORY THRESHOLD REACHED ===" },
          { type: 'output', content: "Memory usage: 99%" },
          { type: 'output', content: "Initiating emergency reboot..." },
          { type: 'output', content: "System will restart in 3 seconds..." }
        ]);
        
        setTimeout(() => {
          // Reset instead of reload for React component
          setHistory([]);
          setCommandCount(0);
          setMemoryUsage(67);
          setIsBooting(true);
          setBootLines([]);
          setCurrentBootLine("");
          setCurrentBootIndex(0);
          setCurrentCharIndex(0);
          setCurrentInput("");
        }, 3000);
      }, 1000);

      return () => clearTimeout(rebootTimeout);
    }
  }, [commandCount]);

  const commands = {
    help: () => [
      "Available commands:",
      "  help     - Show this help message",
      "  status   - Show system status",
      "  scan     - Perform system scan",
      "  access   - Attempt system access",
      "  logs     - View activity logs",
      "  ping     - Test network connectivity",
      "  memory   - Check memory usage",
      "  clear    - Clear terminal",
      "  reboot   - Restart system"
    ],
    status: () => [
      "=== SYSTEM STATUS ===",
      "Navigation System: OFFLINE",
      "Autopilot: UNKNOWN",
      "Backup Systems: ONLINE",
      "Security Level: RESTRICTED",
      "Active Processes: 3",
      `Memory Usage: ${memoryUsage}%`,
      `Commands Executed: ${commandCount}`
    ],
    memory: () => [
      "=== MEMORY DIAGNOSTICS ===",
      `Current Usage: ${memoryUsage}%`,
      `Commands Executed: ${commandCount}/5`,
      `Available Memory: ${100 - memoryUsage}%`,
      commandCount >= 4 ? "WARNING: Approaching critical threshold!" : "Status: NORMAL"
    ],
    scan: { 
      output: [
        "Initiating system scan...",
        "Scanning network nodes...",
        "Found: 12 active connections",
        "Found: 3 restricted directories", 
        "Found: 1 autonomous crawler",
        "WARNING: Unusual activity detected",
        "Scan complete."
      ],
      delays: [0, 1200, 2800, 4100, 5500, 6200, 7000]
    },
    access: {
      output: [
        "Attempting system access...",
        "Checking credentials...",
        "ACCESS DENIED - Insufficient privileges",
        "Security protocol activated",
        "Your attempt has been logged."
      ],
      delays: [0, 1500, 3200, 3800, 4500]
    },
    logs: () => [
      "=== RECENT ACTIVITY ===",
      "[12:34:56] Autonomous crawler detected",
      "[12:35:02] Legacy directives activated", 
      "[12:35:15] Path restrictions enforced",
      "[12:35:23] Passive monitoring enabled",
      "[12:35:30] Unknown access attempt blocked",
      `[12:36:00] Commands executed: ${commandCount}`
    ],
    ping: {
      output: [
        "Pinging network nodes...",
        "Node 1: TIMEOUT",
        "Node 2: TIMEOUT", 
        "Node 3: 127ms - RESTRICTED",
        "Backup Node: 45ms - ONLINE",
        "Network connectivity: LIMITED"
      ],
      delays: [0, 1000, 2000, 3000, 4000, 5200]
    },
    clear: () => [],
    reboot: {
      output: [
        "Initiating system reboot...",
        "Shutting down processes...",
        "Clearing memory...",
        "Restarting in 3 seconds..."
      ],
      delays: [0, 1000, 2500, 4000]
    }
  };

  const executeCommandWithEffect = async (command, output) => {
    if (typeof output === 'function') {
      // Simple commands without delays
      return output();
    }

    if (output.output && output.delays) {
      // Commands with delays and typewriter effect
      setIsExecutingCommand(true);
      const results = [];
      
      for (let i = 0; i < output.output.length; i++) {
        await new Promise(resolve => {
          setTimeout(() => {
            const currentLine = output.output[i];
            results.push(currentLine);
            
            // Add typewriter effect with sound for each character
            let charIndex = 0;
            const typeInterval = setInterval(() => {
              if (charIndex < currentLine.length) {
                playTypingSound(charIndex);
                charIndex++;
              } else {
                clearInterval(typeInterval);
              }
            }, 40); // 40ms between each character sound
            
            setHistory(prev => [
              ...prev.slice(0, -1), // Remove the last entry (current command)
              { type: 'input', content: `user@terminal:~$ ${command}` },
              ...results.map(line => ({ type: 'output', content: line }))
            ]);
            resolve();
          }, output.delays[i]);
        });
      }
      
      setIsExecutingCommand(false);
      return results;
    }

    return output;
  };

  const handleCommand = async (cmd) => {
    const trimmedCmd = cmd.trim().toLowerCase();
    
    if (trimmedCmd === 'clear') {
      setHistory([]);
      setCommandCount(prev => prev + 1);
      return;
    }
    
    const commandDef = commands[trimmedCmd];
    const output = commandDef ? await executeCommandWithEffect(cmd, commandDef) : [`Command not found: ${cmd}. Type 'help' for available commands.`];
    
    if (trimmedCmd === 'reboot') {
      setTimeout(() => {
        // Reset instead of reload for React component
        setHistory([]);
        setCommandCount(0);
        setMemoryUsage(67);
        setIsBooting(true);
        setBootLines([]);
        setCurrentBootLine("");
        setCurrentBootIndex(0);
        setCurrentCharIndex(0);
        setCurrentInput("");
      }, 3000);
    }
    
    setCommandCount(prev => prev + 1);
    return output;
  };

  const handleKeyPress = async (e) => {
    if (e.key === 'Enter' && !isBooting && !isExecutingCommand) {
      e.preventDefault();
      const command = currentInput.trim();
      const trimmedCmd = command.toLowerCase();
      
      if (trimmedCmd === 'clear') {
        setHistory([]);
        setCurrentInput("");
        setCommandCount(prev => prev + 1);
        return;
      }
      
      if (command) {
        // Add the input line immediately
        setHistory(prev => [...prev, 
          { type: 'input', content: `user@terminal:~$ ${command}` }
        ]);
        
        const output = await handleCommand(command);
        
        // Only update if it's not a delayed command (those update themselves)
        if (!isExecutingCommand && output) {
          setHistory(prev => [...prev, 
            ...output.map(line => ({ type: 'output', content: line }))
          ]);
        }
      }
      setCurrentInput("");
    }
  };

  const handleInputChange = (e) => {
    if (!audioEnabled) {
      initializeAudio(); // Initialize audio on first interaction
    }
    setCurrentInput(e.target.value);
    
    // Play typing sound for user input (only for new characters)
    if (e.target.value.length > currentInput.length) {
      playTypingSound(e.target.value.length - 1);
    }
  };

  const handleTerminalClick = () => {
    if (!audioEnabled) {
      initializeAudio(); // Initialize audio on click
    }
    if (!isBooting && !isExecutingCommand) {
      inputRef.current?.focus();
    }
  };

  const renderLine = (line, index) => {
    const lineStr = String(line || '');
    
    if (lineStr.includes('UNKNOWN') || lineStr.startsWith('#') || lineStr.startsWith('user@terminal')) {
      return <div key={index} className="text-amber-100">{lineStr}</div>;
    }
    
    return <div key={index} className="text-white">{lineStr}</div>;
  };

  const getMemoryColor = () => {
    if (memoryUsage >= 90) return "text-red-400";
    if (memoryUsage >= 80) return "text-yellow-400";
    return "text-green-400";
  };

  return (
    <div className={`min-h-screen w-full bg-zinc-900 text-white flex items-center justify-center p-4 select-none transition-opacity duration-1000 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
      {/* Audio Enable Overlay */}
      {showAudioPrompt && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-zinc-800 border border-white/20 rounded-lg p-6 text-center max-w-sm">
            <div className="text-amber-100 text-sm font-mono mb-4">
              🔊 ENABLE AUDIO
            </div>
            <div className="text-white/80 text-xs mb-4">
              Click to enable terminal sound effects
            </div>
            <button
              onClick={initializeAudio}
              className="bg-amber-100 text-black px-4 py-2 rounded font-mono text-sm hover:bg-amber-200 transition-colors"
            >
              ENABLE SOUND
            </button>
            <div className="text-white/40 text-xs mt-2">
              (You can continue without sound)
            </div>
            <button
              onClick={() => setShowAudioPrompt(false)}
              className="text-white/60 hover:text-white/80 text-xs mt-2 block mx-auto"
            >
              Skip
            </button>
          </div>
        </div>
      )}
      
      <div className="relative w-full max-w-5xl aspect-[16/10]">
        {/* Bezel */}
        <div className="absolute inset-0 rounded-[2rem] bg-zinc-900 shadow-2xl ring-1 ring-white/10">
          <div className="absolute inset-3 rounded-[1.5rem] bg-gradient-to-b from-white/5 to-white/0 ring-1 ring-white/10" />
          <div className="absolute bottom-4 right-6 flex items-center gap-4">
            <div className={`text-xs font-mono ${getMemoryColor()}`}>
              MEM: {memoryUsage}%
            </div>
            <div className="h-2.5 w-2.5 rounded-full bg-amber-100 animate-pulse" />
          </div>
        </div>

        {/* Screen cavity */}
        <div className="absolute inset-3 rounded-[1.5rem] overflow-hidden">
          <div className="absolute inset-0 bg-zinc-900">
            {/* Curvature & vignette */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(120% 100% at 50% 40%, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 35%, rgba(255,255,255,0) 60%)",
                mixBlendMode: "screen",
              }}
            />
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                boxShadow:
                  "inset 0 0 80px rgba(255,255,255,0.08), inset 0 0 300px rgba(68, 64, 60, 0.9)",
              }}
            />
            {/* Background ASCII Logo */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <ShipIcon className="!animate-none text-white/[0.3]" />
            </div>

            {/* Terminal content */}
            <div
              ref={terminalRef}
              className="absolute inset-0 p-6 md:p-8 font-mono text-sm md:text-base leading-relaxed overflow-y-auto cursor-text scrollbar-thin scrollbar-thumb-amber-100/20 scrollbar-track-zinc-900/20"
              onClick={handleTerminalClick}
              style={{
                animation: "randomFlicker 3.7s ease-in-out infinite"
              }}
            >
              {/* Header Bar */}
              <HeaderBar memoryUsage={memoryUsage} />
              
              {/* Boot sequence */}
              {bootLines.map((line, index) => renderLine(line, `boot-${index}`))}
              
              {/* Current typing line during boot */}
              {isBooting && currentBootLine && (
                <div className="text-white">
                  {currentBootLine}
                  <span className={`ml-1 ${cursorVisible ? 'opacity-100' : 'opacity-0'}`}>█</span>
                </div>
              )}
              
              {/* Command history */}
              {history.map((entry, index) => (
                <div key={`history-${index}`} className={entry.type === 'input' ? 'text-amber-100' : 'text-white'}>
                  {entry.content}
                </div>
              ))}
              
              {/* Current input line */}
              {!isBooting && !isExecutingCommand && (
                <div className="flex items-center text-amber-100">
                  <span>user@terminal:~$ </span>
                  <span>{currentInput}</span>
                  <span className={`ml-1 ${cursorVisible ? 'opacity-100' : 'opacity-0'}`}>█</span>
                </div>
              )}

              {/* Executing indicator */}
              {isExecutingCommand && (
                <div className="flex items-center text-amber-100">
                  <span>Processing...</span>
                  <span className={`ml-2 ${cursorVisible ? 'opacity-100' : 'opacity-0'}`}>█</span>
                </div>
              )}

              {/* Hidden input for capturing keystrokes */}
              <input
                ref={inputRef}
                value={currentInput}
                onChange={handleInputChange}
                onKeyDown={handleKeyPress}
                className="absolute opacity-0 pointer-events-none"
                autoComplete="off"
                disabled={isBooting || isExecutingCommand}
              />
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes randomFlicker {
          0% { 
            filter: blur(0.4px); 
            opacity: 0.94; 
          }
          2% { 
            filter: blur(0.6px); 
            opacity: 0.92; 
          }
          4% { 
            filter: blur(0.3px); 
            opacity: 0.96; 
          }
          6% { 
            filter: blur(0.5px); 
            opacity: 0.93; 
          }
          8% { 
            filter: blur(0.2px); 
            opacity: 0.97; 
          }
          15% { 
            filter: blur(0.7px); 
            opacity: 0.91; 
          }
          23% { 
            filter: blur(0.3px); 
            opacity: 0.95; 
          }
          31% { 
            filter: blur(0.4px); 
            opacity: 0.94; 
          }
          47% { 
            filter: blur(0.2px); 
            opacity: 0.97; 
          }
          52% { 
            filter: blur(0.8px); 
            opacity: 0.90; 
          }
          58% { 
            filter: blur(0.1px); 
            opacity: 0.98; 
          }
          73% { 
            filter: blur(0.5px); 
            opacity: 0.93; 
          }
          89% { 
            filter: blur(0.3px); 
            opacity: 0.96; 
          }
          94% { 
            filter: blur(0.6px); 
            opacity: 0.92; 
          }
          100% { 
            filter: blur(0.4px); 
            opacity: 0.94; 
          }
        }
      `}</style>

      {/* Hidden comment */}
      <div
        className="hidden"
        dangerouslySetInnerHTML={{
          __html: "<!--What file at the root speaks only to bots, revealing what not to seek? -->",
        }}
      />
    </div>
  );
}

export default TerminalInterface;