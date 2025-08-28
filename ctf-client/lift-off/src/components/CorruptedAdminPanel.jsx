import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import ShipIcon from "./shipIcon";
import HeaderBar from "./AdminComps/HeaderBar";
import Prompt from "./AdminComps/Prompt";
import HelpBlock from "./AdminComps/HelpBlock";
import SnakeAdmin from "./AdminComps/snakeAdmin";

export default function CorruptedAdminPanel() {
  const [bootLines, setBootLines] = useState([]);
  const [snakeEvent, setSnakeEvent] = useState(null);
  const [fadeIn, setFadeIn] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [showAudioPrompt, setShowAudioPrompt] = useState(true);
  const [currentBootLine, setCurrentBootLine] = useState("");
  const [currentBootIndex, setCurrentBootIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const typedRef = useRef(null);
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

  // Terminal typing sound effect
  const playTypingSound = (charIndex = 0) => {
    if (!audioEnabled || !audioContextRef.current) return;
    
    // Only play sound for every 4th character to reduce frequency
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

  // Fade in effect on mount
  useEffect(() => {
    setTimeout(() => setFadeIn(true), 100);
  }, []);

  // Boot sequence with typewriter effect and sound
  useEffect(() => {
    const script = [
      "BOOT> INIT SYSTEM",
      "CHECK> MEMORY . . . unknown",
      "CHECK> DISK   . . . unknown", 
      "CHECK> NET    . . . unknown",
    ];

    if (currentBootIndex < script.length) {
      const currentLine = script[currentBootIndex];
      
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
      }, Math.random() * 40 + 30); // Random typing speed

      return () => clearInterval(typewriterInterval);
    }
  }, [currentBootIndex, currentCharIndex, audioEnabled]);

  // Auto-scroll
  useEffect(() => {
    const el = typedRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [bootLines, currentBootLine, snakeEvent]);

  // Debug log
  useEffect(() => {
    console.log("Current snakeEvent state:", snakeEvent);
  }, [snakeEvent]);

  // Handler for Prompt events
  const handleEvent = (event) => {
    console.log("Prompt triggered event:", event);
    setSnakeEvent(event);
  };
  
  const handleSnakeExit = () => {
    setSnakeEvent(null);
  };

  const handleContainerClick = () => {
    if (!audioEnabled) {
      initializeAudio();
    }
  };

  return (
    <div 
      className={`min-h-screen w-full bg-zinc-900 text-white flex items-center justify-center p-4 select-none transition-opacity duration-1000 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}
      onClick={handleContainerClick}
    >
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
              <ShipIcon className="!animate-none text-white/30 text-[8px] mr-10" />
            </div>

            {/* Terminal content */}
            <div
              className="absolute inset-0 p-6 md:p-10 font-mono text-sm md:text-base leading-relaxed flex flex-col"
              style={{
                animation: "randomFlicker 3.7s ease-in-out infinite"
              }}
            >
              <div className="flex-shrink-0">
                <HeaderBar />
              </div>

              <div
                ref={typedRef}
                className="flex-1 flex flex-col justify-end overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-amber-100/20 scrollbar-track-zinc-900/20"
              >
                {/* Boot sequence lines */}
                {bootLines.map((line, idx) => (
                  <div key={idx} className="text-amber-100">
                    {line}
                  </div>
                ))}

                {/* Current typing line during boot */}
                {currentBootLine && (
                  <div className="text-amber-100">
                    {currentBootLine}
                  </div>
                )}

                {/* Only show Prompt and HelpBlock after boot is complete */}
                {currentBootIndex >= 4 && (
                  <>
                    <Prompt 
                      onEvent={handleEvent} 
                      audioContext={audioContextRef.current} 
                      playTypingSound={playTypingSound}
                      audioEnabled={audioEnabled}
                      onAudioInit={initializeAudio}
                    />
                    <HelpBlock />
                  </>
                )}
              </div>

              {/* Snake game overlay */}
              {snakeEvent === "snakeGame" && (
                <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-auto">
                  <div className="w-full h-full relative">
                  <SnakeAdmin
  onExit={handleSnakeExit}
  audioContext={audioContextRef.current}
  audioEnabled={audioEnabled}
  onAudioInit={initializeAudio}
/>
                  </div>
                </div>
              )}
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
    </div>
  );
}