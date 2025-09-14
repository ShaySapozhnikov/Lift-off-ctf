import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import ShipIcon from "./shipIcon";
import HeaderBar from "./AdminComps/HeaderBar";
import Prompt from "./AdminComps/Prompt";
import HelpBlock from "./AdminComps/HelpBlock";
import SnakeAdmin from "./AdminComps/snakeAdmin";
import SimonSaysGame from "./AdminComps/SimonSaysGame";
import FinalAnomalyEncounter from "./AdminComps/FinalAnomalyEncounter";

export default function CorruptedAdminPanel() {
  const skippedRef = useRef(false);     
  const timeoutsRef = useRef([]);        

  const [bootLines, setBootLines] = useState([]);
  const [snakeEvent, setSnakeEvent] = useState(null);
  const [SimonEvent, setSimonEvent] = useState(null);
  const [fadeIn, setFadeIn] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [showAudioPrompt, setShowAudioPrompt] = useState(true);
  const [currentBootLine, setCurrentBootLine] = useState("");
  const [currentBootIndex, setCurrentBootIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [bootComplete, setBootComplete] = useState(false);
  const [anomalyEvent, setAnomalyEvent] = useState(null);
  
  // Simplified scroll states
  const [isUserScrolling, setIsUserScrolling] = useState(false);

  const typedRef = useRef(null);
  const audioContextRef = useRef(null);
  const typewriterIntervalRef = useRef(null);
  const scrollTimeoutRef = useRef(null);
  const autoScrollTimeoutRef = useRef(null);

  const bootScript = [
    "BOOT> INIT SYSTEM",
    "CHECK> MEMORY . . . unknown",
    "CHECK> DISK   . . . unknown", 
    "CHECK> NET    . . . unknown",
  ];

  const scheduleTimeout = (fn, delay) => {
    const id = setTimeout(fn, delay);
    timeoutsRef.current.push(id);
    return id;
  };
  
  const clearAllTimeouts = () => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  };

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
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }
      
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
    } catch (error) {
      console.error("Audio initialization failed:", error);
      setShowAudioPrompt(false);
    }
  };

  const playTypingSound = (charIndex = 0) => {
    if (skippedRef.current) return;
    if (!audioEnabled || !audioContextRef.current) return;
    if (charIndex % 4 !== 0) return;

    try {
      const audioCtx = audioContextRef.current;
      if (audioCtx.state === 'suspended') audioCtx.resume();

      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.type = "square";
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

  useEffect(() => {
    const timer = setTimeout(() => setFadeIn(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (typewriterIntervalRef.current) clearInterval(typewriterIntervalRef.current);

    const handleBootSkip = (e) => {
      if (e.code === 'Space' && !bootComplete) {
        e.preventDefault();
        setBootLines(bootScript);
        setCurrentBootLine("");
        setCurrentBootIndex(bootScript.length);
        setCurrentCharIndex(0);
        setBootComplete(true);
        if (typewriterIntervalRef.current) clearTimeout(typewriterIntervalRef.current);
      }
    };

    if (!bootComplete) document.addEventListener('keydown', handleBootSkip);

    if (currentBootIndex >= bootScript.length) {
      setBootComplete(true);
      return () => document.removeEventListener('keydown', handleBootSkip);
    }

    const currentLine = bootScript[currentBootIndex];

    if (currentCharIndex < currentLine.length) {
      typewriterIntervalRef.current = setTimeout(() => {
        setCurrentBootLine(currentLine.substring(0, currentCharIndex + 1));
        playTypingSound(currentCharIndex);
        setCurrentCharIndex(prev => prev + 1);
      }, Math.random() * 40 + 30);
    } else {
      typewriterIntervalRef.current = setTimeout(() => {
        setBootLines(prev => [...prev, currentLine]);
        setCurrentBootLine("");
        setCurrentBootIndex(prev => prev + 1);
        setCurrentCharIndex(0);
      }, 200);
    }

    return () => {
      if (typewriterIntervalRef.current) clearTimeout(typewriterIntervalRef.current);
      document.removeEventListener('keydown', handleBootSkip);
    };
  }, [currentBootIndex, currentCharIndex, audioEnabled, bootComplete]);

  // Improved auto-scroll effect with better conflict resolution
  useEffect(() => {
    const el = typedRef.current;
    if (!el || isUserScrolling) return;

    // Clear any existing auto-scroll timeout
    if (autoScrollTimeoutRef.current) {
      clearTimeout(autoScrollTimeoutRef.current);
    }

    // Delay auto-scroll to avoid conflicts
    autoScrollTimeoutRef.current = setTimeout(() => {
      if (el && !isUserScrolling) {
        el.scrollTop = el.scrollHeight;
      }
    }, 100);

    return () => {
      if (autoScrollTimeoutRef.current) {
        clearTimeout(autoScrollTimeoutRef.current);
      }
    };
  }, [bootLines, currentBootLine, snakeEvent, isUserScrolling]);

  // Improved scroll detection
  useEffect(() => {
    const el = typedRef.current;
    if (!el) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      const isAtBottom = scrollHeight - scrollTop <= clientHeight + 15; // Increased tolerance

      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // If not at bottom, user is scrolling
      if (!isAtBottom) {
        setIsUserScrolling(true);
        
        // Reset after longer delay to prevent conflicts
        scrollTimeoutRef.current = setTimeout(() => {
          setIsUserScrolling(false);
        }, 5000);
      } else if (isAtBottom && isUserScrolling) {
        // If at bottom, immediately disable user scrolling
        setIsUserScrolling(false);
      }
    };

    el.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      el.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [isUserScrolling]);

  const handleEvent = (event) => {
    if (event === "SimonGame") {
      setSimonEvent(event);
      setSnakeEvent(null);
      setAnomalyEvent(null);
    } else if (event === "aiConversation") {
      setAnomalyEvent(event);
      setSnakeEvent(null);
      setSimonEvent(null);
    } else {
      setSnakeEvent(event);
      setSimonEvent(null);
      setAnomalyEvent(null);
    }
  };

  const handleSnakeExit = () => setSnakeEvent(null);
  const handleSimonExit = () => setSimonEvent(null);
  const handleAnomalyExit = () => setAnomalyEvent(null);

  const handleContainerClick = () => {
    if (!audioEnabled && showAudioPrompt) initializeAudio();
  };

  const scrollToBottom = () => {
    const el = typedRef.current;
    if (el) {
      el.scrollTo({
        top: el.scrollHeight,
        behavior: 'smooth'
      });
      setIsUserScrolling(false);
    }
  };

  return (
    <div
      className={`min-h-screen w-full bg-zinc-900 text-white flex items-center justify-center p-4 select-text transition-opacity duration-1000 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}
      onClick={handleContainerClick}
    >
      {/* Audio prompt overlay */}
      {showAudioPrompt && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-zinc-800 border border-white/20 rounded-lg p-6 text-center max-w-sm">
            <div className="text-amber-100 text-sm font-mono mb-4">🔊 ENABLE AUDIO</div>
            <div className="text-white/80 text-xs mb-4">Click to enable terminal sound effects</div>
            <button
              onClick={initializeAudio}
              className="bg-amber-100 text-black px-4 py-2 rounded font-mono text-sm hover:bg-amber-200 transition-colors"
            >
              ENABLE SOUND
            </button>
            <div className="text-white/40 text-xs mt-2">(You can continue without sound)</div>
            <button
              onClick={() => {
                setShowAudioPrompt(false);
                setAudioEnabled(false);
                if (audioContextRef.current) {
                  audioContextRef.current.close();
                  audioContextRef.current = null;
                }
              }}
              className="text-white/60 hover:text-white/80 text-xs mt-2 block mx-auto"
            >
              Skip
            </button>
          </div>
        </div>
      )}

      <div className="relative w-full max-w-5xl aspect-[16/9]">
        {/* Bezel */}
        <div className="absolute inset-0 rounded-[2rem] bg-zinc-900 shadow-2xl ring-1 ring-white/10">
          <div className="absolute inset-3 rounded-[1.5rem] bg-gradient-to-b from-white/5 to-white/0 ring-1 ring-white/10" />
          <div className="absolute bottom-4 right-6 flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-amber-100 animate-pulse" />
          </div>
        </div>

        {/* Screen cavity */}
        <div className="absolute inset-3 rounded-[1.5rem] overflow-hidden">
          <div className="absolute inset-0 bg-zinc-900">
            <div className="absolute inset-0 pointer-events-none" style={{background:"radial-gradient(120% 100% at 50% 40%, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 35%, rgba(255,255,255,0) 60%)", mixBlendMode:"screen"}}/>
            <div className="absolute inset-0 pointer-events-none" style={{boxShadow:"inset 0 0 80px rgba(255,255,255,0.08), inset 0 0 300px rgba(68, 64, 60, 0.9)"}}/>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <ShipIcon className="!animate-none text-white/30 text-[8px] mr-10"/>
            </div>

            {/* Terminal content */}
            <div className="absolute inset-0 p-6 md:p-10 font-mono text-sm md:text-base leading-relaxed flex flex-col terminal-flicker">
              <div className="flex-shrink-0"><HeaderBar /></div>

              <div
                ref={typedRef}
                className="terminal-scroll flex-1 overflow-y-auto"
              >
                <div className="min-h-full flex flex-col justify-end">
                  {bootLines.map((line, idx) => (
                    <div key={`boot-line-${idx}`} className="text-amber-100">{line}</div>
                  ))}

                  {currentBootLine && !bootComplete && (
                    <div className="text-amber-100">{currentBootLine}<span className="animate-pulse">|</span></div>
                  )}

                  {!bootComplete && (
                    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-amber-100/60 text-xs font-mono animate-pulse">
                      Press SPACE to skip boot
                    </div>
                  )}

                  {bootComplete && (
                    <>
                      <Prompt onEvent={handleEvent} audioContext={audioContextRef.current} playTypingSound={playTypingSound} audioEnabled={audioEnabled} onAudioInit={initializeAudio}/>
                      <HelpBlock />
                    </>
                  )}
                </div>
              </div>



              {snakeEvent === "snakeGame" && (
                <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-auto">
                  <SnakeAdmin onExit={handleSnakeExit} audioContext={audioContextRef.current} audioEnabled={audioEnabled} onAudioInit={initializeAudio}/>
                </div>
              )}

              {SimonEvent === "SimonGame" && (
                <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-auto">
                  <SimonSaysGame onExit={handleSimonExit} audioContext={audioContextRef.current} audioEnabled={audioEnabled} onAudioInit={initializeAudio}/>
                </div>
              )}

              {anomalyEvent === "aiConversation" && (
                <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-auto">
                  <FinalAnomalyEncounter onExit={handleAnomalyExit} audioContext={audioContextRef.current} audioEnabled={audioEnabled} onAudioInit={initializeAudio}/>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .terminal-flicker {
          animation: randomFlicker 3.7s ease-in-out infinite;
        }

        @keyframes randomFlicker {
          0% { filter: blur(0.4px); opacity: 0.94; }
          2% { filter: blur(0.6px); opacity: 0.92; }
          4% { filter: blur(0.3px); opacity: 0.96; }
          6% { filter: blur(0.5px); opacity: 0.93; }
          8% { filter: blur(0.2px); opacity: 0.97; }
          15% { filter: blur(0.7px); opacity: 0.91; }
          23% { filter: blur(0.3px); opacity: 0.95; }
          31% { filter: blur(0.4px); opacity: 0.94; }
          47% { filter: blur(0.2px); opacity: 0.97; }
          52% { filter: blur(0.8px); opacity: 0.90; }
          58% { filter: blur(0.1px); opacity: 0.98; }
          73% { filter: blur(0.5px); opacity: 0.93; }
          89% { filter: blur(0.3px); opacity: 0.96; }
          94% { filter: blur(0.6px); opacity: 0.92; }
          100% { filter: blur(0.4px); opacity: 0.94; }
        }

        /* Pure CSS scrollbar styling for all browsers */
        .terminal-scroll {
          /* Firefox */
          scrollbar-width: thin;
          scrollbar-color: rgba(245, 158, 11, 0.3) rgba(39, 39, 42, 0.1);
        }

        /* Chrome, Safari, Edge Webkit */
        .terminal-scroll::-webkit-scrollbar {
          width: 8px;
        }

        .terminal-scroll::-webkit-scrollbar-track {
          background: rgba(39, 39, 42, 0.1);
          border-radius: 4px;
        }

        .terminal-scroll::-webkit-scrollbar-thumb {
          background: rgba(245, 158, 11, 0.3);
          border-radius: 4px;
          border: 1px solid rgba(39, 39, 42, 0.2);
        }

        .terminal-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(245, 158, 11, 0.5);
        }

        .terminal-scroll::-webkit-scrollbar-thumb:active {
          background: rgba(245, 158, 11, 0.7);
        }

        /* Ensure smooth scrolling */
        .terminal-scroll {
          scroll-behavior: smooth;
        }

        /* Fix for Chrome overflow issues */
        .terminal-scroll {
          contain: layout style paint;
        }
      `}</style>
    </div>
  );
}