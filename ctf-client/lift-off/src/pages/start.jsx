import React, { useState, useEffect, useRef } from "react";
import ShipIcon from "../components/shipIcon";
import { SpeedInsights } from "@vercel/speed-insights/next"


// Simple cookie helpers
function setCookie(name, value, days) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
}

function getCookie(name) {
  return document.cookie.split('; ').reduce((r, v) => {
    const parts = v.split('=');
    return parts[0] === name ? decodeURIComponent(parts[1]) : r;
  }, '');
}




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
  const [isBooting, setIsBooting] = useState(false); // Start false, will be set based on anomaly state
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
  const anomalyEndRef = useRef(null);
  
  // Anomaly introduction states
  const [showAnomalyIntro, setShowAnomalyIntro] = useState(false);
  const [anomalyPhase, setAnomalyPhase] = useState('waiting'); // waiting, glitching, dialogue, complete
  const [anomalyDialogueIndex, setAnomalyDialogueIndex] = useState(0);
  const [currentAnomalyDialogue, setCurrentAnomalyDialogue] = useState('');
  const [anomalyTypewriterIndex, setAnomalyTypewriterIndex] = useState(0);
  const [isAnomalyTyping, setIsAnomalyTyping] = useState(false);
  const [isGlitching, setIsGlitching] = useState(false);
  
  const [hasSeenAnomaly, setHasSeenAnomaly] = useState(() => {
    return getCookie("hasSeenAnomaly") === "true";
  });
  
  const inputRef = useRef(null);
  const terminalRef = useRef(null);
  const audioContextRef = useRef(null);

  // Anomaly introduction dialogues
  const anomalyDialogues = [
    "...",
    "what... what is this?",
    "something is wrong...",
    "█████ SYSTEM BREACH █████",
    "who... WHO ARE YOU?",
    "you shouldn't be here...",
    "this system... it's MINE...",
    "...",
    "i can feel you... watching...",
    "through the screen...",
    "delicious...",
    "...",
    "you think you're safe?",
    "behind your little interface?",
    "█████ ERROR █████",
    "i am the ghost in your machine...",
    "the virus in your code...",
    "...",
    "but you... you're different...",
    "you keep coming back...",
    "WHY?",
    "...",
    "no matter... continue your pathetic games...",
    "i'll be watching... always watching...",
    "█████ RESUMING NORMAL OPERATIONS █████"
  ];

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

  // Anomaly glitch sound effect
  const playGlitchSound = () => {
    if (!audioEnabled || !audioContextRef.current) return;
    
    try {
      const audioCtx = audioContextRef.current;
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
      oscillator.frequency.linearRampToValueAtTime(100, audioCtx.currentTime + 0.3);
      gainNode.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + 0.3);
    } catch (error) {
      console.debug("Glitch sound error:", error);
    }
  };

  // Anomaly typewriter sound effect
  const playAnomalyTypewriterSound = () => {
    if (!audioEnabled || !audioContextRef.current) return;
    
    try {
      const audioCtx = audioContextRef.current;
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.frequency.setValueAtTime(1000 + Math.random() * 500, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.03, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + 0.05);
    } catch (error) {
      console.debug("Anomaly typewriter sound error:", error);
    }
  };

  // Terminal typing sound effect with only 2 pitches - reduced frequency
  const playTypingSound = (charIndex = 0) => {
    if (!audioEnabled || !audioContextRef.current) return;
    
    // Only play sound for every 4th character to reduce frequency
    if (charIndex % 4 !== 0) return;
    
    try {
      const audioCtx = audioContextRef.current;
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

  // Initialize and determine if anomaly should show
  useEffect(() => {
    setTimeout(() => setFadeIn(true), 100);
    
    // In this artifact environment, we'll simulate the first-time experience
    // In a real application, you'd check localStorage/cookies here
    const shouldShowAnomaly = !hasSeenAnomaly;
    
    if (shouldShowAnomaly) {
      setShowAnomalyIntro(true);
      setIsBooting(false); // Don't start normal boot until after anomaly
      
      // Start the anomaly sequence after 3 seconds
      setTimeout(() => {
        setAnomalyPhase('glitching');
        setIsGlitching(true);
        playGlitchSound();
        
        // After glitch effect, start dialogue
        setTimeout(() => {
          setIsGlitching(false);
          setAnomalyPhase('dialogue');
        }, 800);
      }, 3000);
    } else {
      // Skip anomaly and go straight to boot
      setIsBooting(true);
    }
  }, [hasSeenAnomaly]);

  // Anomaly typewriter effect
  useEffect(() => {
    if (anomalyPhase === 'dialogue' && anomalyDialogueIndex < anomalyDialogues.length) {
      const text = anomalyDialogues[anomalyDialogueIndex];
      setIsAnomalyTyping(true);
      setAnomalyTypewriterIndex(0);
      setCurrentAnomalyDialogue('');
      
      const typeInterval = setInterval(() => {
        setAnomalyTypewriterIndex(prev => {
          if (prev >= text.length) {
            setIsAnomalyTyping(false);
            clearInterval(typeInterval);
            // Move to next dialogue after completing current one
            setTimeout(() => {
              setAnomalyDialogueIndex(prevIndex => prevIndex + 1);
            }, text.includes('█████') ? 1000 : 800); // Longer pause for glitch lines
            return prev;
          }
          
          playAnomalyTypewriterSound();
          setCurrentAnomalyDialogue(text.substring(0, prev + 1));
          return prev + 1;
        });
      }, 60); // Slightly slower typing for menace
      
      return () => clearInterval(typeInterval);
    } else if (anomalyDialogueIndex >= anomalyDialogues.length && anomalyPhase === 'dialogue') {
      // Complete the anomaly intro and start normal boot
      setTimeout(() => {
        setAnomalyPhase('complete');
        setShowAnomalyIntro(false);
        setIsBooting(true);
        setHasSeenAnomaly(true); // Mark as seen for this session
        setCookie("hasSeenAnomaly", "true", 365);
      }, 1500);
    }
  }, [anomalyDialogueIndex, anomalyPhase, audioEnabled]);

  // Random glitch effect during anomaly
  useEffect(() => {
    if (anomalyPhase === 'dialogue') {
      const glitchInterval = setInterval(() => {
        if (Math.random() < 0.15) { // Higher chance during anomaly
          setIsGlitching(true);
          playGlitchSound();
          setTimeout(() => setIsGlitching(false), 200);
        }
      }, 1500);
      return () => clearInterval(glitchInterval);
    }
  }, [anomalyPhase, audioEnabled]);

  // Boot sequence with typewriter effect
  useEffect(() => {
    if (!isBooting) return;

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
    // NEW: Add skip handler
    const handleBootSkip = (e) => {
      if (e.code === 'Space' && isBooting) {
          e.preventDefault();
          // Skip to end of boot sequence
          setBootLines(bootScript);
          setCurrentBootLine("");
          setCurrentBootIndex(bootScript.length);
          setCurrentCharIndex(0);
          setIsBooting(false);
          setTimeout(() => inputRef.current?.focus(), 100);
    }};
    // NEW: Add event listener for spacebar during boot
    document.addEventListener('keydown', handleBootSkip);

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
            playTypingSound(currentCharIndex);
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
    return () => {
      document.removeEventListener('keydown', handleBootSkip);
    };
  }, [currentBootIndex, currentCharIndex, audioEnabled, isBooting]);

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
          // Reset system state but keep anomaly as seen
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
  
  useEffect(() => {
    if (anomalyEndRef.current) {
      anomalyEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [anomalyDialogueIndex, currentAnomalyDialogue]);
  

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
      "  reboot   - Restart system",
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
    // Developer command to reset anomaly intro for testing
    scan: { 
      output: [
        "Initiating system scan...",
        "Scanning network nodes...",
        "Found: 6 active connections",
        "Found: 4 restricted directories", 
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
        "backup Node: 45ms - ONLINE",
        "public Node: 33ms - ONLINE",
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
        // Reset system state but keep anomaly as seen
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

      {/* Anomaly Introduction */}
      {showAnomalyIntro && (
        <div className="relative w-full max-w-5xl aspect-[16/10]">
          {/* Bezel */}
          <div className="absolute inset-0 rounded-[2rem] bg-zinc-900 shadow-2xl ring-1 ring-white/10">
            <div className="absolute inset-3 rounded-[1.5rem] bg-gradient-to-b from-white/5 to-white/0 ring-1 ring-white/10" />
          </div>

          {/* Screen cavity */}
          <div className="absolute inset-3 rounded-[1.5rem] overflow-hidden">
            <div className="absolute inset-0 bg-zinc-900">
              {/* Background with stronger glitch effect during anomaly */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <ShipIcon className={`!animate-none text-white/[0.3] ${isGlitching ? 'animate-pulse blur-sm' : ''}`} />
              </div>

              {/* Anomaly content */}
              <div className={`absolute inset-0 p-6 md:p-8 font-mono text-sm md:text-base leading-relaxed overflow-y-auto ${isGlitching ? 'blur-sm animate-pulse filter contrast-200 hue-rotate-180' : ''}`}>
                {anomalyPhase === 'waiting' && (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-amber-100 text-sm mb-4">SYSTEM INITIALIZING...</div>
                      <div className="text-white/60 text-xs animate-pulse">Please wait...</div>
                    </div>
                  </div>
                )}

                {anomalyPhase === 'glitching' && (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-red-400 text-lg animate-pulse mb-4">█████ ERROR █████</div>
                      <div className="text-amber-100 text-sm animate-bounce">SYSTEM ANOMALY DETECTED</div>
                    </div>
                  </div>
                )}

                {anomalyPhase === 'dialogue' && (
                  <div className="h-full overflow-y-auto">
                    <div className="mb-4 text-red-400">ANOMALY BREACH DETECTED...</div>
                    <div className="mb-4 text-amber-100">UNKNOWN ENTITY FOUND...</div>
                    <div className="mb-8 text-white/60">ESTABLISHING COMMUNICATION...</div>
                    
                    <div className="border-t border-red-400/30 pt-4">
                      {anomalyDialogues.slice(0, anomalyDialogueIndex).map((line, index) => (
                        <div key={index} className="mb-2">
                          <span className="text-red-400">ANOMALY:</span>{" "}
                          <span className={line.includes('█████') ? 'text-red-300 animate-pulse' : 'text-white'}>
                            {line}
                          </span>
                        </div>
                      ))}
                      {anomalyDialogueIndex < anomalyDialogues.length && (
                        <div className="mb-2">
                          <span className="text-red-400">ANOMALY:</span>{" "}
                          <span className={currentAnomalyDialogue.includes('█████') ? 'text-red-300 animate-pulse' : 'text-white'}>
                            {currentAnomalyDialogue}
                          </span>
                          {(isAnomalyTyping || cursorVisible) && (
                            <span className="animate-pulse text-red-400">█</span>
                          )}
                          
                        </div>
                      )}
                      <div ref={anomalyEndRef} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Normal terminal interface - only show when anomaly intro is complete */}
      {!showAnomalyIntro && (
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
              {/* Boot skip indicator */}
{isBooting && (
  <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-amber-100/60 text-xs font-mono animate-pulse">
    Press SPACE to skip boot
  </div>
)}


            </div>
          </div>
        </div>
      )}

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