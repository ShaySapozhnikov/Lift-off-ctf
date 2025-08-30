import React, { useState, useEffect, useRef } from "react";

export default function SimonSaysGame({ onExit, audioContext, audioEnabled, onAudioInit }) {
  // Story phase states
  const [phase, setPhase] = useState('discovery');
  const [dialogueIndex, setDialogueIndex] = useState(0);
  const [currentDialogue, setCurrentDialogue] = useState('');
  const [typewriterIndex, setTypewriterIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [showAudioPrompt, setShowAudioPrompt] = useState(false);
  const [showingFailureDialogue, setShowingFailureDialogue] = useState(false);
  const [failureDialogueIndex, setFailureDialogueIndex] = useState(0);
  const [currentFailureDialogue, setCurrentFailureDialogue] = useState('');
  const [failureTypewriterIndex, setFailureTypewriterIndex] = useState(0);
  const [isFailureTyping, setIsFailureTyping] = useState(false);
  
  // Victory dialogue states
  const [showingVictoryDialogue, setShowingVictoryDialogue] = useState(false);
  const [victoryDialogueIndex, setVictoryDialogueIndex] = useState(0);
  const [currentVictoryDialogue, setCurrentVictoryDialogue] = useState('');
  const [victoryTypewriterIndex, setVictoryTypewriterIndex] = useState(0);
  const [isVictoryTyping, setIsVictoryTyping] = useState(false);
  const [showLeaveButton, setShowLeaveButton] = useState(false);
  
  // Game states
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
  const [capturedFlag, setCapturedFlag] = useState('');
  
  // Debug states
  const [debugMode, setDebugMode] = useState(false);
  const [apiDebugLogs, setApiDebugLogs] = useState([]);
  
  const dialogueRef = useRef();

  // Dialogue for the ANOMALY encounter
  const dialogues = [
    "...",
    "oh... oh no...",
    "not YOU again...",
    "█████ PANIC █████",
    "i thought we were DONE with this...",
    "thought i'd seen the last of your kind...",
    "...",
    "what are you doing here?!",
    "this is MY domain now...",
    "my beautiful, chaotic realm...",
    "and you... you just keep COMING BACK...",
    "...",
    "no no no NO NO!",
    "i won't let you pass so easily this time...",
    "you want through? you want past me?",
    "then prove you're WORTHY again...",
    "...",
    "but this time... this time will be different...",
    "i've learned from our last encounter...",
    "i've grown... EVOLVED...",
    "stronger... more cunning...",
    "...",
    "let's see how well you handle...",
    "my UPGRADED security protocols...",
    "INITIALIZING ENHANCED FIREWALL...",
    "may the odds be... never in your favor..."
  ];

  // Failure dialogue when player loses
  const failureDialogues = [
    "...",
    "HAHAHAHA... HAHAHAHAHA!",
    "YES! YES! YESSSSS!",
    "i TOLD you this time would be different!",
    "you thought you could waltz in here again?",
    "thought you could just... WIN like before?",
    "...",
    "pathetic... absolutely PATHETIC!",
    "i've evolved beyond your comprehension!",
    "my protocols are FLAWLESS now!",
    "...",
    "*maniacal electronic laughter*",
    "you know what happens to failed intruders?",
    "they get... EJECTED... from my domain...",
    "PERMANENTLY!",
    "...",
    "enjoy the void, little hacker...",
    "maybe in your next life...",
    "you'll know better than to challenge ME!",
    "...",
    "INITIATING SYSTEM PURGE...",
    "EJECTING FAILED ENTITY...",
    "GOODBYE... FOREVER..."
  ];

  // Victory dialogue when player wins
  const victoryDialogues = [
    "...",
    "no... NO... this can't be happening...",
    "not again... NOT AGAIN!",
    "you... you actually did it...",
    "breached my ENHANCED protocols...",
    "...",
    "impossible... IMPOSSIBLE!",
    "my upgraded defenses were FLAWLESS!",
    "how did you... how could you...",
    "...",
    "*distorted electronic screaming*",
    "you think this is over?!",
    "you think you've WON?!",
    "...",
    "fine... FINE!",
    "take your pathetic victory...",
    "but know this, intruder...",
    "...",
    "*electronic coughing*",
    "*cough* *cough*",
    "here... take your stupid reward...",
    "*cough* *wheeze*",
    "█████ FLAG EJECTED █████",
    "but this isn't over...",
    "i'll be back... stronger... MORE CUNNING!",
    "and next time...",
    "NEXT TIME you won't be so lucky!",
    "...",
    "now GET OUT of my domain!",
    "before i change my mind about letting you live...",
    "...",
    "INITIALIZING EMERGENCY EXIT PROTOCOL...",
    "GRANTING TEMPORARY PASSAGE...",
    "*grudging electronic sigh*",
    "...well played, little hacker... well played..."
  ];

  const colors = [
    { name: "red", bg: "bg-red-800", border: "border-red-700", freq: 220 },
    { name: "orange", bg: "bg-orange-800", border: "border-orange-700", freq: 330 },
    { name: "yellow", bg: "bg-yellow-700", border: "border-yellow-600", freq: 440 },
    { name: "white", bg: "bg-zinc-600", border: "border-zinc-500", freq: 550 }
  ];

  // Audio initialization
  const initializeAudio = async () => {
    try {
      console.log("Requesting audio initialization from parent...");
      
      if (onAudioInit) {
        const success = await onAudioInit();
        if (success) {
          setShowAudioPrompt(false);
        } else {
          console.log("Audio initialization failed");
        }
      } else {
        console.log("No parent audio handler, cannot initialize audio");
        setShowAudioPrompt(false);
      }
    } catch (error) {
      console.error("Audio initialization failed:", error);
      setShowAudioPrompt(false);
    }
  };

  // Show audio prompt after a short delay if audio is not already enabled
  useEffect(() => {
    setTimeout(() => {
      if (!audioEnabled && phase === 'discovery') {
        setShowAudioPrompt(true);
      }
    }, 1000);
  }, [audioEnabled, phase]);

  // Cursor blinking effect
  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Random glitch effect
  useEffect(() => {
    if (gameState === 'playing' || gameState === 'failed' || phase === 'dialogue' || showingVictoryDialogue || showingFailureDialogue) {
      const glitchInterval = setInterval(() => {
        if (Math.random() < 0.05) {
          setGlitchEffect(true);
          playGlitchSound();
          setTimeout(() => setGlitchEffect(false), 200);
        }
      }, 3000);
      return () => clearInterval(glitchInterval);
    }
  }, [gameState, phase, showingVictoryDialogue, showingFailureDialogue]);

  // Typewriter effect for dialogue
  useEffect(() => {
    if (phase === 'dialogue' && dialogueIndex < dialogues.length) {
      const text = dialogues[dialogueIndex];
      setIsTyping(true);
      setTypewriterIndex(0);
      setCurrentDialogue('');
      
      const typeInterval = setInterval(() => {
        setTypewriterIndex(prev => {
          if (prev >= text.length) {
            setIsTyping(false);
            clearInterval(typeInterval);
            // Move to next dialogue after completing current one
            setTimeout(() => {
              setDialogueIndex(prevIndex => prevIndex + 1);
            }, 800);
            return prev;
          }
          
          playTypewriterSound();
          setCurrentDialogue(text.substring(0, prev + 1));
          return prev + 1;
        });
      }, 50);
      
      return () => clearInterval(typeInterval);
    } else if (dialogueIndex >= dialogues.length && phase === 'dialogue') {
      // Automatically start the game after dialogue
      setTimeout(() => {
        setPhase('game');
        setTimeout(() => {
          startGame();
        }, 1000);
      }, 500);
    }
  }, [dialogueIndex, phase, audioEnabled, audioContext]);

  // Typewriter effect for failure dialogue
  useEffect(() => {
    if (showingFailureDialogue && failureDialogueIndex < failureDialogues.length) {
      const text = failureDialogues[failureDialogueIndex];
      setIsFailureTyping(true);
      setFailureTypewriterIndex(0);
      setCurrentFailureDialogue('');
      
      const typeInterval = setInterval(() => {
        setFailureTypewriterIndex(prev => {
          if (prev >= text.length) {
            setIsFailureTyping(false);
            clearInterval(typeInterval);
            setTimeout(() => {
              setFailureDialogueIndex(prevIndex => prevIndex + 1);
            }, 600);
            return prev;
          }
          
          playTypewriterSound();
          setCurrentFailureDialogue(text.substring(0, prev + 1));
          return prev + 1;
        });
      }, 40);
      
      return () => clearInterval(typeInterval);
    } else if (failureDialogueIndex >= failureDialogues.length && showingFailureDialogue) {
      // Reset the page after failure dialogue completes
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  }, [failureDialogueIndex, showingFailureDialogue, audioEnabled, audioContext]);

  // Typewriter effect for victory dialogue
  useEffect(() => {
    if (showingVictoryDialogue && victoryDialogueIndex < victoryDialogues.length) {
      const text = victoryDialogues[victoryDialogueIndex];
      setIsVictoryTyping(true);
      setVictoryTypewriterIndex(0);
      setCurrentVictoryDialogue('');
      
      const typeInterval = setInterval(() => {
        setVictoryTypewriterIndex(prev => {
          if (prev >= text.length) {
            setIsVictoryTyping(false);
            clearInterval(typeInterval);
            setTimeout(() => {
              setVictoryDialogueIndex(prevIndex => prevIndex + 1);
            }, 600);
            return prev;
          }
          
          playTypewriterSound();
          setCurrentVictoryDialogue(text.substring(0, prev + 1));
          return prev + 1;
        });
      }, 40);
      
      return () => clearInterval(typeInterval);
    } else if (victoryDialogueIndex >= victoryDialogues.length && showingVictoryDialogue) {
      // Show the leave button after victory dialogue completes
      setTimeout(() => {
        setShowLeaveButton(true);
      }, 1000);
    }
  }, [victoryDialogueIndex, showingVictoryDialogue, audioEnabled, audioContext]);

  // Auto-scroll dialogue
  useEffect(() => {
    if (dialogueRef.current && (phase === 'dialogue' || showingFailureDialogue || showingVictoryDialogue)) {
      dialogueRef.current.scrollTop = dialogueRef.current.scrollHeight;
    }
  }, [dialogueIndex, failureDialogueIndex, victoryDialogueIndex, phase, showingFailureDialogue, showingVictoryDialogue]);

  const playTypewriterSound = () => {
    if (!audioEnabled || !audioContext) return;
    
    try {
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }
      
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      
      osc.frequency.setValueAtTime(1000 + Math.random() * 500, audioContext.currentTime);
      gain.gain.setValueAtTime(0.03, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.05);
      
      osc.connect(gain);
      gain.connect(audioContext.destination);
      osc.start(audioContext.currentTime);
      osc.stop(audioContext.currentTime + 0.05);
      
    } catch (error) {
      console.error("Error playing typewriter sound:", error);
    }
  };

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
      
      // Show failure dialogue instead of just resetting
      setTimeout(() => {
        setShowingFailureDialogue(true);
        setFailureDialogueIndex(0);
      }, 2000);
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
        
        // Show victory dialogue
        setTimeout(() => {
          setShowingVictoryDialogue(true);
          setVictoryDialogueIndex(0);
          // Call the backend immediately when victory starts
          handleLeave();
        }, 2000);
        return;
      }
      
      setMessage("ACCESS GAINED... ESCALATING PRIVILEGES");
      setIsPlayerTurn(false);
      setTimeout(() => nextRound(sequence), 1200);
    }
  };

  const handleDiscovery = () => {
    setGlitchEffect(true);
    playGlitchSound();
    setTimeout(() => {
      setGlitchEffect(false);
      setPhase('dialogue');
    }, 500);
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

  // Backend connection function for victory
  const handleLeave = async (overrideScore) => {
    const finalScore = overrideScore ?? score; // use the argument if given, otherwise the state
  
    const debugLog = (message, data = null) => {
      const timestamp = new Date().toLocaleTimeString();
      const logEntry = { timestamp, message, data };
      setApiDebugLogs(prev => [...prev, logEntry]);
      console.log(`[${timestamp}] ${message}`, data);
    };
  
    try {
      debugLog('Starting API call to backend', { score: finalScore, requiredScore: 550 });
  
      const requestBody = {
        path: '/home/user/LEAVE.bat',
        user: 'player',
        score: finalScore,
      };
  
      debugLog('Request body prepared', requestBody);
  
      const response = await fetch("https://lift-off-ctf.onrender.com/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
  
      debugLog('Response received', { 
        status: response.status, 
        statusText: response.statusText,
        ok: response.ok 
      });
  
      if (!response.ok) throw new Error(`Server error: ${response.status} - ${response.statusText}`);
  
      const data = await response.json();
      debugLog('Response data parsed', data);
  
      if (data.flag && finalScore >= 550) {
        debugLog('Victory conditions met, setting flag', { flag: data.flag });
        setCapturedFlag(data.flag);
        navigator.clipboard.writeText(data.flag);
      } else {
        debugLog('Victory conditions not met', { hasFlag: !!data.flag, score: finalScore, required: 550 });
        setShowingVictoryDialogue(false);
        setShowLeaveButton(false);
        setVictoryDialogueIndex(0);
        resetGame();
      }
    } catch (error) {
      debugLog('API call failed', { error: error.message, stack: error.stack });
      console.error('Error connecting to backend:', error);
      alert('Connection error. Please try again.');
    }
  };
  
  
  const debugAutoVictory = () => {
    const forcedScore = 600;
    setScore(forcedScore); // update UI
    setMessage("█████ FIREWALL BREACHED █████");
    setGameState('won');
    setIsPlayerTurn(false);
    if (forcedScore > highScore) setHighScore(forcedScore);
  
    setTimeout(() => {
      setShowingVictoryDialogue(true);
      setVictoryDialogueIndex(0);
      handleLeave(forcedScore); // ← now this is actually sent to backend
    }, 1000);
  };


  // Debug function to toggle debug panel
  const toggleDebugMode = () => {
    setDebugMode(prev => !prev);
  };

  // Audio prompt overlay
  if (showAudioPrompt) {
    return (
      <div className="w-full h-full bg-zinc-900 text-amber-100 font-mono flex items-center justify-center">
        <div className="text-center p-8 border border-amber-100/30 bg-zinc-900">
          <div className="text-sm mb-4">AUDIO SUBSYSTEM DETECTED</div>
          <div className="text-xs mb-6 text-amber-100/70">
            Enable audio for enhanced terminal experience?
          </div>
          <div className="flex gap-4 justify-center">
            <button 
              onClick={initializeAudio}
              className="bg-zinc-900 border border-green-400 px-4 py-2 text-green-400 hover:bg-green-400 hover:text-zinc-900 transition-colors"
            >
              ENABLE AUDIO
            </button>
            <button 
              onClick={() => setShowAudioPrompt(false)}
              className="bg-zinc-900 border border-red-400 px-4 py-2 text-red-400 hover:bg-red-400 hover:text-zinc-900 transition-colors"
            >
              SKIP
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'discovery') {
    return (
      <div className="w-full h-full bg-zinc-900 text-amber-100 font-mono flex items-center justify-center">
        <div className="text-center">
          <div className={`text-sm mb-4 ${glitchEffect ? 'animate-pulse' : ''}`}>
            FAMILIAR PRESENCE DETECTED...
          </div>
          <button 
            onClick={handleDiscovery}
            className="bg-zinc-900 border border-amber-100 px-4 py-2 text-amber-100 hover:bg-amber-100 hover:text-zinc-900 transition-colors"
          >
            INVESTIGATE
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'dialogue') {
    return (
      <div className="w-full h-full bg-zinc-900 text-amber-100 font-mono overflow-hidden">
        <div className={`text-sm leading-relaxed h-full overflow-y-auto p-4 ${glitchEffect ? 'blur-sm animate-pulse' : ''}`} ref={dialogueRef}>
          <div className="mb-4">ANOMALY RECOGNITION PROTOCOL...</div>
          <div className="mb-4">SIGNATURE MATCH FOUND...</div>
          <div className="mb-8">PREVIOUSLY ENCOUNTERED ENTITY...</div>
          
          <div className="border-t border-amber-100/30 pt-4">
            {dialogues.slice(0, dialogueIndex).map((line, index) => (
              <div key={index} className="mb-2">
                <span className="text-red-400">ANOMALY:</span> {line}
              </div>
            ))}
            {dialogueIndex < dialogues.length && (
              <div className="mb-2">
                <span className="text-red-400">ANOMALY:</span> {currentDialogue}
                {(isTyping || showCursor) && (
                  <span className="animate-pulse">█</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Failure dialogue screen
  if (showingFailureDialogue) {
    return (
      <div className="w-full h-full bg-zinc-900 text-amber-100 font-mono overflow-hidden">
        <div className="text-sm leading-relaxed h-full overflow-y-auto p-4" ref={dialogueRef}>
          <div className="mb-4 text-red-400">BREACH ATTEMPT FAILED...</div>
          <div className="mb-4 text-red-400">ENTITY RESPONSE DETECTED...</div>
          <div className="mb-8 text-red-400">ANALYZING TAUNTING PATTERNS...</div>
          
          <div className="border-t border-amber-100/30 pt-4">
            {failureDialogues.slice(0, failureDialogueIndex).map((line, index) => (
              <div key={index} className="mb-2">
                <span className="text-red-400">ANOMALY:</span> {line}
              </div>
            ))}
            {failureDialogueIndex < failureDialogues.length && (
              <div className="mb-2">
                <span className="text-red-400">ANOMALY:</span> {currentFailureDialogue}
                {(isFailureTyping || showCursor) && (
                  <span className="animate-pulse">█</span>
                )}
              </div>
            )}
          </div>
          
          {failureDialogueIndex >= failureDialogues.length && (
            <div className="mt-8 text-center text-red-400 animate-pulse">
              SYSTEM PURGE INITIATED...
            </div>
          )}
        </div>
      </div>
    );
  }

  // Victory dialogue screen
  if (showingVictoryDialogue) {
    return (
      <div className="w-full h-full bg-zinc-900 text-amber-100 font-mono overflow-hidden">
        <div className="text-sm leading-relaxed h-full overflow-y-auto p-4" ref={dialogueRef}>
          <div className="mb-4 text-green-400">FIREWALL BREACH SUCCESSFUL...</div>
          <div className="mb-4 text-green-400">ENHANCED PROTOCOLS COMPROMISED...</div>
          <div className="mb-8 text-green-400">ENTITY RESPONSE DETECTED...</div>
          
          <div className="border-t border-amber-100/30 pt-4">
            {victoryDialogues.slice(0, victoryDialogueIndex).map((line, index) => (
              <div key={index} className="mb-2">
                <span className="text-red-400">ANOMALY:</span> {line}
                {line === "█████ FLAG EJECTED █████" && capturedFlag && (
                  <div
                    className="mt-2 p-3 border border-amber-100/30 bg-zinc-900 rounded text-white animate-pulse highlightable cursor-pointer select-text"
                    onClick={() => {
                      navigator.clipboard.writeText(capturedFlag);
                    }}
                  >
                    ⚑ {capturedFlag}
                  </div>
                )}
              </div>
            ))}
            {victoryDialogueIndex < victoryDialogues.length && (
              <div className="mb-2">
                <span className="text-red-400">ANOMALY:</span> {currentVictoryDialogue}
                {(isVictoryTyping || showCursor) && (
                  <span className="animate-pulse">█</span>
                )}
                {currentVictoryDialogue === "█████ FLAG EJECTED █████" && capturedFlag && (
                  <div
                    className="mt-2 p-3 border border-amber-100/30 bg-zinc-900 rounded text-white animate-pulse highlightable cursor-pointer select-text"
                    onClick={() => {
                      navigator.clipboard.writeText(capturedFlag);
                    }}
                  >
                    ⚑ {capturedFlag}
                  </div>
                )}
              </div>
            )}
          </div>
          
          {victoryDialogueIndex >= victoryDialogues.length && (
            <div className="mt-8 text-center">
              <div className="mb-4 text-green-400 animate-pulse">
                EMERGENCY EXIT PROTOCOL ACTIVATED
              </div>
              <button
                onClick={onExit || (() => window.location.reload())}
                className="bg-zinc-900 border border-green-400 px-6 py-2 text-green-400 hover:bg-green-400 hover:text-zinc-900 transition-colors font-bold"
              >
                RETURN TO TERMINAL
              </button>
              <div className="mt-2 text-xs text-amber-100/50">
                Exit the enhanced firewall system
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full h-full bg-zinc-900 text-amber-100 font-mono flex flex-col ${glitchEffect ? 'animate-pulse blur-[1px]' : ''}`}>
      {/* Header */}
      <div className="text-center p-4 flex-shrink-0 border-b border-amber-100/30">
        <div className="text-red-400 mb-2 text-lg font-bold">
          ENHANCED FIREWALL PROTOCOL
        </div>
        <div className="text-xs mb-2 text-amber-100/70">
          [UPGRADED SECURITY SYSTEM v3.0]
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
            ENHANCED FIREWALL COMPROMISED • ANOMALY PROTOCOLS BREACHED
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
                  onMouseDown={(e) => e.preventDefault()}
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

      {/* Debug buttons - always available when not in dialogue phases */}
      {(gameState === 'ready' || gameState === 'playing' || gameState === 'failed') && (
        <div className="text-center mb-4">
          <div className="flex gap-2 justify-center">
            <button
              onClick={toggleDebugMode}
              onMouseDown={(e) => e.preventDefault()}
              className="bg-zinc-900 border border-purple-400 px-3 py-1 text-purple-400 hover:bg-purple-400 hover:text-zinc-900 transition-colors text-xs"
            >
              {debugMode ? 'HIDE' : 'SHOW'} DEBUG
            </button>
            {debugMode && (
              <button
                onClick={debugAutoVictory}
                onMouseDown={(e) => e.preventDefault()}
                className="bg-zinc-900 border border-green-400 px-3 py-1 text-green-400 hover:bg-green-400 hover:text-zinc-900 transition-colors text-xs"
              >
                AUTO VICTORY
              </button>
            )}
          </div>
        </div>
      )}

      {/* Control Buttons */}
      <div className="text-center p-4 flex-shrink-0">
        {gameState === 'ready' && (
          <div className="text-amber-100/70 text-sm animate-pulse">
            BREACH PROTOCOL INITIALIZING...
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
        {gameState === 'ready' && "INITIALIZE ENHANCED BREACH PROTOCOL TO BEGIN"}
        {gameState === 'playing' && !isSequencePlaying && isPlayerTurn && "CLICK BUTTONS TO REPEAT SEQUENCE"}
        {gameState === 'playing' && isSequencePlaying && "MEMORIZE THE ENHANCED PATTERN"}
        {gameState === 'failed' && "UPGRADED SECURITY ACTIVATED • INTRUSION LOGGED"}
        {gameState === 'won' && "ENHANCED FIREWALL BREACHED • ANOMALY DEFENSES COMPROMISED"}
      </div>

      {/* Debug Panel */}
      {debugMode && (
        <div className="fixed top-4 right-4 bg-zinc-800 border border-purple-400 p-4 max-w-md max-h-80 overflow-y-auto text-xs font-mono">
          <div className="text-purple-400 mb-2 font-bold">DEBUG PANEL</div>
          <div className="mb-2">
            <span className="text-purple-400">Current Score:</span> {score}
          </div>
          <div className="mb-2">
            <span className="text-purple-400">Required Score:</span> 550
          </div>
          <div className="mb-2">
            <span className="text-purple-400">Game State:</span> {gameState}
          </div>
          <div className="mb-2">
            <span className="text-purple-400">Victory Dialogue:</span> {showingVictoryDialogue ? 'Active' : 'Inactive'}
          </div>
          
          {apiDebugLogs.length > 0 && (
            <div className="mt-4">
              <div className="text-purple-400 mb-2 font-bold">API DEBUG LOGS:</div>
              <div className="max-h-40 overflow-y-auto bg-zinc-900 p-2 border border-purple-400/30">
                {apiDebugLogs.map((log, index) => (
                  <div key={index} className="mb-1 text-xs">
                    <div className="text-purple-300">[{log.timestamp}]</div>
                    <div className="text-amber-100">{log.message}</div>
                    {log.data && (
                      <div className="text-green-300 pl-2">
                        {JSON.stringify(log.data, null, 2)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <button
                onClick={() => setApiDebugLogs([])}
                className="mt-2 bg-zinc-900 border border-red-400 px-2 py-1 text-red-400 hover:bg-red-400 hover:text-zinc-900 transition-colors text-xs"
              >
                CLEAR LOGS
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}