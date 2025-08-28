import React, { useState, useEffect, useRef } from "react";

export default function SimonSaysGame({ onExit, audioContext, audioEnabled, onAudioInit }) {
  const [sequence, setSequence] = useState([]);
  const [playerInput, setPlayerInput] = useState([]);
  const [isPlayerTurn, setIsPlayerTurn] = useState(false);
  const [activeIndex, setActiveIndex] = useState(null);
  const [round, setRound] = useState(0);
  const [message, setMessage] = useState("CLICK START TO BREACH THE FIREWALL");
  const [gameState, setGameState] = useState('ready'); // ready, playing, failed, won
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isSequencePlaying, setIsSequencePlaying] = useState(false);
  const [glitchEffect, setGlitchEffect] = useState(false);
  const [showCursor, setShowCursor] = useState(true);
  
  const colors = [
    { name: "red", bg: "bg-red-800", border: "border-red-700", freq: 220 },
    { name: "orange", bg: "bg-orange-800", border: "border-orange-700", freq: 330 },
    { name: "yellow", bg: "bg-yellow-700", border: "border-yellow-600", freq: 440 },
    { name: "white", bg: "bg-zinc-600", border: "border-zinc-500", freq: 550 }
  ];

  // Cursor blinking effect
  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Random glitch effect
  useEffect(() => {
    if (gameState === 'playing' || gameState === 'failed') {
      const glitchInterval = setInterval(() => {
        if (Math.random() < 0.05) {
          setGlitchEffect(true);
          playGlitchSound();
          setTimeout(() => setGlitchEffect(false), 200);
        }
      }, 3000);
      return () => clearInterval(glitchInterval);
    }
  }, [gameState]);

  const playTone = (frequency, duration = 200) => {
    if (!audioEnabled || !audioContext) return;
    
    try {
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }
      
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration / 1000);
    } catch (error) {
      console.error("Error playing tone:", error);
    }
  };

  const playGlitchSound = () => {
    if (!audioEnabled || !audioContext) return;
    
    try {
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }
      
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.linearRampToValueAtTime(100, audioContext.currentTime + 0.3);
      oscillator.type = 'sawtooth';
      
      gainNode.gain.setValueAtTime(0.12, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.error("Error playing glitch sound:", error);
    }
  };

  const startGame = () => {
    setSequence([]);
    setPlayerInput([]);
    setRound(0);
    setScore(0);
    setGameState('playing');
    setMessage("FIREWALL ENGAGED... WATCH CLOSELY");
    nextRound([]);
  };

  const nextRound = (currentSeq) => {
    const nextColor = Math.floor(Math.random() * colors.length);
    const newSequence = [...currentSeq, nextColor];
    setSequence(newSequence);
    setPlayerInput([]);
    setRound(newSequence.length);
    setScore(prev => prev + newSequence.length * 10);
    playSequence(newSequence);
  };

  const playSequence = (seq) => {
    setIsPlayerTurn(false);
    setIsSequencePlaying(true);
    setMessage("ANALYZING SECURITY PATTERNS...");
    
    let i = 0;
    const interval = setInterval(() => {
      setActiveIndex(seq[i]);
      playTone(colors[seq[i]].freq);
      
      setTimeout(() => setActiveIndex(null), 400);
      i++;
      
      if (i >= seq.length) {
        clearInterval(interval);
        setTimeout(() => {
          setMessage("INPUT SEQUENCE TO BREACH LAYER");
          setIsPlayerTurn(true);
          setIsSequencePlaying(false);
        }, 600);
      }
    }, 700);
  };

  const handlePlayerClick = (index) => {
    if (!isPlayerTurn || isSequencePlaying) return;
    
    const newInput = [...playerInput, index];
    setPlayerInput(newInput);
    playTone(colors[index].freq, 150);
    
    // Check correctness
    if (sequence[newInput.length - 1] !== index) {
      setMessage("█████ INTRUSION DETECTED █████");
      setGameState('failed');
      setIsPlayerTurn(false);
      playGlitchSound();
      setGlitchEffect(true);
      
      if (score > highScore) {
        setHighScore(score);
      }
      
      setTimeout(() => {
        setMessage("ACCESS DENIED... SYSTEM LOCKDOWN");
      }, 1000);
      return;
    }
    
    // If complete and correct
    if (newInput.length === sequence.length) {
      if (sequence.length >= 10) {
        setMessage("█████ FIREWALL BREACHED █████");
        setGameState('won');
        setIsPlayerTurn(false);
        if (score > highScore) {
          setHighScore(score);
        }
        return;
      }
      
      setMessage("ACCESS GAINED... ESCALATING PRIVILEGES");
      setIsPlayerTurn(false);
      setTimeout(() => nextRound(sequence), 1200);
    }
  };

  const resetGame = () => {
    setGameState('ready');
    setMessage("CLICK START TO BREACH THE FIREWALL");
    setSequence([]);
    setPlayerInput([]);
    setRound(0);
    setScore(0);
    setIsPlayerTurn(false);
    setGlitchEffect(false);
  };

  return (
    <div className={`w-full h-full bg-zinc-900 text-amber-100 font-mono flex flex-col ${glitchEffect ? 'animate-pulse blur-sm' : ''}`}>
      {/* Header */}
      <div className="text-center p-4 flex-shrink-0 border-b border-amber-100/30">
        <div className="text-red-400 mb-2 text-lg font-bold">
          FIREWALL BREACH PROTOCOL
        </div>
        <div className="text-xs mb-2 text-amber-100/70">
          [UNAUTHORIZED ACCESS SYSTEM v2.1]
        </div>
        
        {/* Stats */}
        <div className="flex justify-center gap-6 text-xs">
          <div className="flex flex-col">
            <span className="text-amber-100/50">LAYER</span>
            <span className="text-amber-100 font-bold">{round}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-amber-100/50">SCORE</span>
            <span className="text-amber-100 font-bold">{score}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-amber-100/50">BEST</span>
            <span className="text-amber-100 font-bold">{highScore}</span>
          </div>
        </div>
      </div>

      {/* Status Message */}
      <div className="text-center p-3 flex-shrink-0">
        <div className="text-sm">
          {gameState === 'failed' && <span className="text-red-400">BREACH FAILED:</span>} {message}
          {gameState === 'playing' && showCursor && !isSequencePlaying && isPlayerTurn && (
            <span className="animate-pulse ml-1">█</span>
          )}
        </div>
        {gameState === 'won' && (
          <div className="text-green-400 text-xs mt-1 animate-pulse">
            SYSTEM COMPROMISED • ALL SECURITY LAYERS BREACHED
          </div>
        )}
      </div>

      {/* Game Grid */}
      <div className="flex-1 flex items-center justify-center px-4 min-h-0">
        <div className="border border-amber-100/30 bg-zinc-900 p-4">
          <div className="grid grid-cols-2 gap-4">
            {colors.map((color, index) => {
              const isActive = activeIndex === index;
              const isPlayerInputMatch = playerInput.includes(index);
              
              return (
                <button
                  key={color.name}
                  onClick={() => handlePlayerClick(index)}
                  disabled={!isPlayerTurn || isSequencePlaying || gameState !== 'playing'}
                  className={`
                    relative w-20 h-20 transition-all duration-200 border-2
                    ${color.bg} ${color.border}
                    ${isActive ? 'shadow-lg animate-pulse brightness-125 scale-110' : 'shadow-md'}
                    ${isPlayerTurn && !isSequencePlaying && gameState === 'playing' ? 'hover:brightness-110 hover:scale-105 cursor-pointer' : ''}
                    ${!isPlayerTurn || isSequencePlaying || gameState !== 'playing' ? 'opacity-70 cursor-not-allowed' : ''}
                    ${isPlayerInputMatch ? 'ring-2 ring-amber-100/50' : ''}
                  `}
                >
                  {/* Corner indicators like snake game */}
                  <div className="absolute top-1 left-1 w-1 h-1 bg-amber-100/60 rounded-full" />
                  <div className="absolute top-1 right-1 w-1 h-1 bg-amber-100/60 rounded-full" />
                  <div className="absolute bottom-1 left-1 w-1 h-1 bg-amber-100/60 rounded-full" />
                  <div className="absolute bottom-1 right-1 w-1 h-1 bg-amber-100/60 rounded-full" />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="text-center p-4 flex-shrink-0">
        {gameState === 'ready' && (
          <button
            onClick={startGame}
            className="bg-zinc-900 border border-amber-100 px-6 py-2 text-amber-100 hover:bg-amber-100 hover:text-zinc-900 transition-colors font-bold"
          >
            START BREACH
          </button>
        )}
        
        {(gameState === 'failed' || gameState === 'won') && (
          <div className="flex gap-4 justify-center">
            <button
              onClick={resetGame}
              className="bg-zinc-900 border border-red-400 px-6 py-2 text-red-400 hover:bg-red-400 hover:text-zinc-900 transition-colors font-bold"
            >
              RESET SYSTEM
            </button>
            {onExit && (
              <button
                onClick={onExit}
                className="bg-zinc-900 border border-amber-100 px-6 py-2 text-amber-100 hover:bg-amber-100 hover:text-zinc-900 transition-colors font-bold"
              >
                EXIT
              </button>
            )}
          </div>
        )}

        {/* Progress indicator */}
        {gameState === 'playing' && (
          <div className="mt-3">
            <div className="text-xs text-amber-100/50 mb-1">BREACH PROGRESS</div>
            <div className="w-48 h-1 bg-zinc-800 border border-zinc-700/50 mx-auto">
              <div 
                className="h-full bg-amber-400 transition-all duration-500"
                style={{ width: `${Math.min((round / 10) * 100, 100)}%` }}
              />
            </div>
            <div className="text-xs text-amber-100/50 mt-1">LAYER {round}/10</div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="text-center p-2 text-xs text-amber-100/50 flex-shrink-0 border-t border-amber-100/30">
        {gameState === 'ready' && "INITIALIZE BREACH PROTOCOL TO BEGIN"}
        {gameState === 'playing' && !isSequencePlaying && isPlayerTurn && "CLICK BUTTONS TO REPEAT SEQUENCE"}
        {gameState === 'playing' && isSequencePlaying && "MEMORIZE THE PATTERN"}
        {gameState === 'failed' && "SECURITY SYSTEM ACTIVATED • BREACH ATTEMPT LOGGED"}
        {gameState === 'won' && "UNAUTHORIZED ACCESS GRANTED • MISSION COMPLETE"}
      </div>
    </div>
  );
}