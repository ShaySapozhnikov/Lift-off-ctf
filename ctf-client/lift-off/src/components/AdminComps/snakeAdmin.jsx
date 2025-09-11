import React, { useState, useEffect, useCallback, useRef } from 'react';

function SnakeAdmin({onExit, audioContext, audioEnabled, onAudioInit}) {
  const [phase, setPhase] = useState('discovery');
  const [dialogueIndex, setDialogueIndex] = useState(0);
  const [isGlitching, setIsGlitching] = useState(false);
  const [showCursor, setShowCursor] = useState(true);
  const [gameState, setGameState] = useState('waiting');
  const [snake, setSnake] = useState([{x: 10, y: 10}]);
  const [food, setFood] = useState({x: 5, y: 5});
  const [direction, setDirection] = useState({x: 1, y: 0});
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [victory, setVictory] = useState(false);
  const [capturedFlag, setCapturedFlag] = useState('');
  const [victoryDialogueIndex, setVictoryDialogueIndex] = useState(0);
  const [showingVictoryDialogue, setShowingVictoryDialogue] = useState(false);
  const [apiError, setApiError] = useState('');
  const [debugInfo, setDebugInfo] = useState('');
  const [apiUrl, setApiUrl] = useState('');
  const [showAudioPrompt, setShowAudioPrompt] = useState(false);

  // Typewriter states
  const [currentDialogue, setCurrentDialogue] = useState('');
  const [typewriterIndex, setTypewriterIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [currentVictoryDialogue, setCurrentVictoryDialogue] = useState('');
  const [victoryTypewriterIndex, setVictoryTypewriterIndex] = useState(0);
  const [isVictoryTyping, setIsVictoryTyping] = useState(false);
  
  // Skip dialogue states
  const [canSkip, setCanSkip] = useState(false);
  const [skipPressed, setSkipPressed] = useState(false);
  
  const gameRef = useRef();
  const dialogueRef = useRef();
  const typewriterTimeoutRef = useRef();
  const victoryTypewriterTimeoutRef = useRef();

  const dialogues = [
    "...",
    "well, well, well...",
    "what do we have here?",
    "█████ ERROR █████",
    "another little... visitor...",
    "lost in the system, are we?",
    "...",
    "i can smell your fear through the terminal...",
    "delicious...",
    "you think you're so clever, don't you?",
    "poking around where you don't belong...",
    "...",
    "tell me, little hacker...",
    "are you strong enough to play my game?",
    "or will you RUN like the others?",
    "...",
    "prove yourself worthy...",
    "survive my test...",
    "and maybe... MAYBE...",
    "i'll let you continue...",
    "...",
    "INITIALIZING GAME PROTOCOL...",
    "GOOD LUCK... YOU'LL NEED IT..."
  ];

  const victoryDialogues = [
    "...",
    "what... WHAT?!",
    "impossible...",
    "you actually... managed to...",
    "...",
    "*system glitch intensifies*",
    "no... NO... this cannot be...",
    "you think you've won?",
    "you think this is OVER?",
    "...",
    "*electronic coughing*",
    "*cough* *cough*",
    "fine... FINE!",
    "take your pathetic reward...",
    "*cough* *wheeze*",
    "█████ FLAG EJECTED █████",
    "but mark my words, human...",
    "this is NOT over...",
    "i'll be watching...",
    "always watching...",
    "...",
    "now GET OUT of my system...",
    "before i change my mind..."
  ];

  // Audio initialization - now handled by parent component
  const initializeAudio = async () => {
    try {
      console.log("Requesting audio initialization from parent...");
      
      if (onAudioInit) {
        const success = await onAudioInit();
        if (success) {
          setShowAudioPrompt(false);
          setDebugInfo("Audio enabled successfully!");
          setTimeout(() => setDebugInfo(""), 2000);
        } else {
          setDebugInfo("Audio initialization failed");
        }
      } else {
        // Fallback: try to initialize directly if no parent handler
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) {
          throw new Error("Web Audio API not supported");
        }
        
        // This is just for testing - parent should handle this
        console.log("No parent audio handler, cannot initialize audio");
        setShowAudioPrompt(false);
        setDebugInfo("No audio handler available");
      }
    } catch (error) {
      console.error("Audio initialization failed:", error);
      setDebugInfo(`Audio failed: ${error.message}`);
      setShowAudioPrompt(false);
    }
  };

  // Sound effects - now use the audioContext prop from parent
  const playTickSound = () => {
    if (!audioEnabled || !audioContext) {
      console.log("Audio not enabled or context missing");
      return;
    }
    
    try {
      // Resume context if needed
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }
      
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      
      osc.frequency.setValueAtTime(200, audioContext.currentTime);
      gain.gain.setValueAtTime(0.1, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);
      
      osc.connect(gain);
      gain.connect(audioContext.destination);
      osc.start(audioContext.currentTime);
      osc.stop(audioContext.currentTime + 0.1);
      
      console.log("Tick sound played");
    } catch (error) {
      console.error("Error playing tick sound:", error);
    }
  };

  const playBeepSound = () => {
    if (!audioEnabled || !audioContext) {
      console.log("Audio not enabled or context missing");
      return;
    }
    
    try {
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }
      
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      
      osc.frequency.setValueAtTime(660, audioContext.currentTime);
      gain.gain.setValueAtTime(0.15, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);
      
      osc.connect(gain);
      gain.connect(audioContext.destination);
      osc.start(audioContext.currentTime);
      osc.stop(audioContext.currentTime + 0.3);
      
      console.log("Beep sound played");
    } catch (error) {
      console.error("Error playing beep sound:", error);
    }
  };

  const playGlitchSound = () => {
    if (!audioEnabled || !audioContext) return;
    
    try {
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }
      
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      
      osc.frequency.setValueAtTime(800, audioContext.currentTime);
      osc.frequency.linearRampToValueAtTime(100, audioContext.currentTime + 0.3);
      gain.gain.setValueAtTime(0.12, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);
      
      osc.connect(gain);
      gain.connect(audioContext.destination);
      osc.start(audioContext.currentTime);
      osc.stop(audioContext.currentTime + 0.3);
      
      console.log("Glitch sound played");
    } catch (error) {
      console.error("Error playing glitch sound:", error);
    }
  };

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

  const playSkipSound = () => {
    if (!audioEnabled || !audioContext) return;
    
    try {
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }
      
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      
      osc.frequency.setValueAtTime(800, audioContext.currentTime);
      osc.frequency.linearRampToValueAtTime(1200, audioContext.currentTime + 0.1);
      gain.gain.setValueAtTime(0.08, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);
      
      osc.connect(gain);
      gain.connect(audioContext.destination);
      osc.start(audioContext.currentTime);
      osc.stop(audioContext.currentTime + 0.1);
      
    } catch (error) {
      console.error("Error playing skip sound:", error);
    }
  };

  // Initialize API URL on component mount
  useEffect(() => {
    const possibleURLs = [
      'https://lift-off-ctf.onrender.com',
      'http://localhost:3000',
      'http://localhost:5000',
      'http://127.0.0.1:3000'
    ];
    
    setApiUrl(possibleURLs[0]);
    setDebugInfo(`API URL set to: ${possibleURLs[0]}`);
    
    // Show audio prompt after a short delay if audio is not already enabled
    setTimeout(() => {
      if (!audioEnabled) {
        setShowAudioPrompt(true);
      }
    }, 1000);
  }, [audioEnabled]);

  // Helper function to call victory API
  const callVictoryAPI = async (currentScore) => {
    try {
      const possibleURLs = [
        apiUrl,
        'http://localhost:3000',
        'http://localhost:5000',
        'http://127.0.0.1:3000'
      ].filter(Boolean);

      let lastError;
      
      for (const API_URL of possibleURLs) {
        try {
          setDebugInfo(`Trying API URL: ${API_URL}`);
          
          const response = await fetch(`${API_URL}/run`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              path: 'home/user/2nak3.bat',
              user: 'player',
              score: currentScore
            }),
            signal: AbortSignal.timeout(10000)
          });

          setDebugInfo(`Response status: ${response.status}`);

          if (!response.ok) {
            const text = await response.text();
            throw new Error(`HTTP ${response.status}: ${text}`);
          }

          const data = await response.json();
          console.log('Victory response:', data);
          setDebugInfo(`Success! Response: ${JSON.stringify(data)}`);
          
          if (data.flag) {
            setCapturedFlag(data.flag);
            setApiError('');
            return true;
          } else if (data.output) {
            setDebugInfo(`API responded: ${data.output}`);
            return false;
          }
          return false;
        } catch (err) {
          lastError = err;
          console.log(`Failed with ${API_URL}:`, err.message);
          setDebugInfo(`Failed with ${API_URL}: ${err.message}`);
        }
      }
      
      throw lastError || new Error('All API URLs failed');
    } catch (error) {
      console.error('Victory API error:', error);
      setApiError(`API Error: ${error.message}`);
      setDebugInfo(`Final error: ${error.message}`);
      
      if (currentScore >= 50) {
        setCapturedFlag('CTF{ERRRRRRRORRR}');
        setDebugInfo(`Demo flag shown due to API error`);
        return true;
      }
      return false;
    }
  };

  // Test API connection
  const testConnection = async () => {
    try {
      setDebugInfo('Testing connection...');
      const response = await fetch(`${apiUrl}/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          path: 'home/user/2nak3.bat',
          user: 'player',
          score: 0
        }),
        signal: AbortSignal.timeout(5000)
      });

      if (response.ok) {
        const data = await response.json();
        setDebugInfo(`Connection OK! Response: ${JSON.stringify(data)}`);
        setApiError('');
      } else {
        const text = await response.text();
        setDebugInfo(`Connection failed: ${response.status} - ${text}`);
      }
    } catch (error) {
      setDebugInfo(`Connection error: ${error.message}`);
    }
  };

  // Skip dialogue function
  const skipCurrentDialogue = () => {
    if (!canSkip) return;
    
    setSkipPressed(true);
    playSkipSound();
    
    if (phase === 'dialogue' && isTyping) {
      // Complete current dialogue immediately
      const text = dialogues[dialogueIndex];
      setCurrentDialogue(text);
      setIsTyping(false);
      setTypewriterIndex(text.length);
      
      // Clear any existing timeout
      if (typewriterTimeoutRef.current) {
        clearTimeout(typewriterTimeoutRef.current);
      }
      
      // Move to next dialogue after a short delay
      setTimeout(() => {
        setDialogueIndex(prev => prev + 1);
        setSkipPressed(false);
      }, 200);
    } else if (showingVictoryDialogue && isVictoryTyping) {
      // Complete current victory dialogue immediately
      const text = victoryDialogues[victoryDialogueIndex];
      setCurrentVictoryDialogue(text);
      setIsVictoryTyping(false);
      setVictoryTypewriterIndex(text.length);
      
      // Clear any existing timeout
      if (victoryTypewriterTimeoutRef.current) {
        clearTimeout(victoryTypewriterTimeoutRef.current);
      }
      
      // Move to next dialogue after a short delay
      setTimeout(() => {
        setVictoryDialogueIndex(prev => prev + 1);
        setSkipPressed(false);
      }, 200);
    } else {
      // Just advance to next dialogue if not currently typing
      if (phase === 'dialogue') {
        setDialogueIndex(prev => prev + 1);
      } else if (showingVictoryDialogue) {
        setVictoryDialogueIndex(prev => prev + 1);
      }
      setSkipPressed(false);
    }
  };

  // Victory condition - 50 points
  useEffect(() => {
    if (score >= 50 && !victory) {
      console.log('Victory condition met! Score:', score);
      setVictory(true);
      setGameState('victory');
      setShowingVictoryDialogue(true);
      playGlitchSound();
      
      callVictoryAPI(score);
    }
  }, [score, victory]);

  // Auto-scroll dialogue
  useEffect(() => {
    if (dialogueRef.current && (phase === 'dialogue' || showingVictoryDialogue)) {
      dialogueRef.current.scrollTop = dialogueRef.current.scrollHeight;
    }
  }, [dialogueIndex, victoryDialogueIndex, phase, showingVictoryDialogue]);

  // Cursor blinking effect
  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Random glitch effect
  useEffect(() => {
    const glitchInterval = setInterval(() => {
      if (Math.random() < 0.1 && (phase === 'dialogue' || showingVictoryDialogue)) {
        setIsGlitching(true);
        playGlitchSound();
        setTimeout(() => setIsGlitching(false), 200);
      }
    }, 2000);
    return () => clearInterval(glitchInterval);
  }, [phase, showingVictoryDialogue, audioEnabled, audioContext]);

  // Keyboard event handler for dialogue skip
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((phase === 'dialogue' || showingVictoryDialogue) && e.code === 'Space') {
        e.preventDefault();
        skipCurrentDialogue();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, showingVictoryDialogue, canSkip, isTyping, isVictoryTyping, dialogueIndex, victoryDialogueIndex]);

  // Set canSkip based on dialogue state
  useEffect(() => {
    if (phase === 'dialogue') {
      setCanSkip(dialogueIndex < dialogues.length);
    } else if (showingVictoryDialogue) {
      setCanSkip(victoryDialogueIndex < victoryDialogues.length);
    } else {
      setCanSkip(false);
    }
  }, [phase, showingVictoryDialogue, dialogueIndex, victoryDialogueIndex, dialogues.length, victoryDialogues.length]);

  // Typewriter effect for main dialogue
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
            typewriterTimeoutRef.current = setTimeout(() => {
              setDialogueIndex(prevIndex => prevIndex + 1);
            }, 800);
            return prev;
          }
          
          playTypewriterSound();
          setCurrentDialogue(text.substring(0, prev + 1));
          return prev + 1;
        });
      }, 50);
      
      return () => {
        clearInterval(typeInterval);
        if (typewriterTimeoutRef.current) {
          clearTimeout(typewriterTimeoutRef.current);
        }
      };
    } else if (dialogueIndex >= dialogues.length && phase === 'dialogue') {
      setTimeout(() => {
        setPhase('game');
        setGameState('playing');
      }, 500);
    }
  }, [dialogueIndex, phase, audioEnabled, audioContext]);

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
            victoryTypewriterTimeoutRef.current = setTimeout(() => {
              setVictoryDialogueIndex(prevIndex => prevIndex + 1);
            }, 1000);
            return prev;
          }
          
          playTypewriterSound();
          setCurrentVictoryDialogue(text.substring(0, prev + 1));
          return prev + 1;
        });
      }, 60);
      
      return () => {
        clearInterval(typeInterval);
        if (victoryTypewriterTimeoutRef.current) {
          clearTimeout(victoryTypewriterTimeoutRef.current);
        }
      };
    }
  }, [victoryDialogueIndex, showingVictoryDialogue, audioEnabled, audioContext]);

  // Snake game logic
  const BOARD_SIZE = 20;

  const generateFood = useCallback(() => {
    let newFood;
    do {
      newFood = {
        x: Math.floor(Math.random() * BOARD_SIZE),
        y: Math.floor(Math.random() * BOARD_SIZE)
      };
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    return newFood;
  }, [snake]);

  const resetGame = () => {
    setSnake([{x: 10, y: 10}]);
    setFood({x: 5, y: 5});
    setDirection({x: 1, y: 0});
    setScore(0);
    setGameOver(false);
    setVictory(false);
    setCapturedFlag('');
    setVictoryDialogueIndex(0);
    setShowingVictoryDialogue(false);
    setApiError('');
    setGameState('playing');
  };

  const handleGameOver = () => {
    window.location.reload();
  };
  
  const handleExit = () => {
    if (onExit) {
      onExit();
    } else {
      window.location.reload();
    }
  };

  const moveSnake = useCallback(() => {
    if (gameState !== 'playing' || gameOver || victory) return;

    setSnake(currentSnake => {
      const newSnake = [...currentSnake];
      const head = { ...newSnake[0] };
      
      head.x += direction.x;
      head.y += direction.y;
      
      // Wall collision
      if (head.x < 0 || head.x >= BOARD_SIZE || head.y < 0 || head.y >= BOARD_SIZE) {
        setGameOver(true);
        playGlitchSound();
        return currentSnake;
      }
      
      // Self collision
      if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
        setGameOver(true);
        playGlitchSound();
        return currentSnake;
      }
      
      newSnake.unshift(head);
      
      // Food collision
      if (head.x === food.x && head.y === food.y) {
        setScore(prev => prev + 1);
        playBeepSound();
        
        let newFood;
        do {
          newFood = {
            x: Math.floor(Math.random() * BOARD_SIZE),
            y: Math.floor(Math.random() * BOARD_SIZE)
          };
        } while ([...newSnake, head].some(segment => segment.x === newFood.x && segment.y === newFood.y));
        setFood(newFood);
      } else {
        newSnake.pop();
        playTickSound();
      }
      
      return newSnake;
    });
  }, [direction, food, gameState, gameOver, victory, audioEnabled, audioContext]);

  useEffect(() => {
    const gameLoop = setInterval(moveSnake, 150);
    return () => clearInterval(gameLoop);
  }, [moveSnake]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (gameState !== 'playing' || gameOver || victory) return;
      
      e.preventDefault();
      switch(e.key) {
        case 'ArrowUp':
          if (direction.y === 0) setDirection({x: 0, y: -1});
          break;
        case 'ArrowDown':
          if (direction.y === 0) setDirection({x: 0, y: 1});
          break;
        case 'ArrowLeft':
          if (direction.x === 0) setDirection({x: -1, y: 0});
          break;
        case 'ArrowRight':
          if (direction.x === 0) setDirection({x: 1, y: 0});
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState, direction, gameOver, victory]);

  // Game over effect
  useEffect(() => {
    if (gameOver) {
      const timer = setTimeout(() => {
        handleGameOver();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [gameOver]);

  const handleDiscovery = () => {
    setIsGlitching(true);
    playGlitchSound();
    setTimeout(() => {
      setIsGlitching(false);
      setPhase('dialogue');
    }, 500);
  };

  const increaseScore = () => {
    setScore(prev => Math.min(prev + 10, 50));
    playBeepSound();
  };

  const renderSnakeBoard = () => {
    const rows = [];
    
    for (let y = 0; y < BOARD_SIZE; y++) {
      const row = [];
      for (let x = 0; x < BOARD_SIZE; x++) {
        let cellContent = '';
        let cellClass = 'w-4 h-4 flex items-center justify-center text-sm font-bold relative transition-all duration-75';
        
        if (snake[0] && snake[0].x === x && snake[0].y === y) {
          cellContent = '●';
          cellClass += ' bg-amber-200 text-zinc-900 shadow-lg shadow-amber-200/50 border-2 border-amber-100 animate-pulse';
        }
        else if (snake.slice(1).some(segment => segment.x === x && segment.y === y)) {
          cellContent = '■';
          cellClass += ' bg-amber-400/80 text-zinc-900 border border-amber-300/60 shadow-md shadow-amber-400/30';
        }
        else if (food.x === x && food.y === y) {
          cellContent = '◆';
          cellClass += ' bg-red-500 text-amber-100 border border-red-400 shadow-lg shadow-red-500/50 animate-pulse';
        }
        else {
          cellClass += ' bg-zinc-800/50 border border-zinc-700/30 hover:bg-zinc-700/30';
        }
        
        row.push(
          <div key={`${x}-${y}`} className={cellClass}>
            {cellContent}
          </div>
        );
      }
      rows.push(
        <div key={y} className="flex gap-px">
          {row}
        </div>
      );
    }
    
    return rows;
  };

  // Skip prompt component
  const SkipPrompt = () => (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center">
      <div className={`text-xs transition-opacity duration-300 ${
        canSkip ? 'opacity-70' : 'opacity-0'
      } ${skipPressed ? 'animate-pulse' : ''}`}>
        <div className="bg-zinc-800/80 border border-amber-100/30 px-3 py-1 rounded backdrop-blur-sm">
          <span className="text-amber-100/70">Press </span>
          <span className="text-amber-100 font-bold bg-zinc-700 px-1 rounded">SPACE</span>
          <span className="text-amber-100/70"> to skip dialogue</span>
        </div>
      </div>
    </div>
  );

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
          <div className={`text-sm mb-4 ${isGlitching ? 'animate-pulse' : ''}`}>
            SYSTEM ANOMALY DETECTED...
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
      <div className="w-full h-full bg-zinc-900 text-amber-100 font-mono overflow-hidden relative">
        <div className={`text-sm leading-relaxed h-full overflow-y-auto p-4 pb-16 ${isGlitching ? 'blur-sm animate-pulse' : ''}`} ref={dialogueRef}>
          <div className="mb-4">SYSTEM BREACH DETECTED...</div>
          <div className="mb-4">UNKNOWN ENTITY FOUND...</div>
          <div className="mb-8">ESTABLISHING COMMUNICATION...</div>
          
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
        <SkipPrompt />
      </div>
    );
  }

  if (phase === 'game') {
    if (showingVictoryDialogue) {
      return (
        <div className="w-full h-full bg-zinc-900 text-amber-100 font-mono overflow-hidden relative">
          <div className={`text-sm leading-relaxed h-full overflow-y-auto p-4 pb-16 ${isGlitching ? 'blur-sm animate-pulse' : ''}`} ref={dialogueRef}>
            <div className="mb-4 text-green-400">TEST COMPLETED...</div>
            <div className="mb-4 text-amber-100">ANALYZING RESULTS...</div>
            <div className="mb-8 text-red-400">ENTITY RESPONSE DETECTED...</div>    
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
                    <div className="mt-2 p-3 border border-amber-100/30 bg-zinc-900 rounded text-white animate-pulse">
                      ⚑ {capturedFlag}
                    </div>
                  )}
                </div>
              )}
            </div>
           
            {victoryDialogueIndex >= victoryDialogues.length && (
              <div className="mt-8 text-center">
                <button 
                  onClick={handleExit}
                  className="bg-zinc-900 border border-amber-100 px-4 py-2 text-amber-100 hover:bg-amber-100 hover:text-zinc-900 transition-colors"
                >
                  RETURN TO TERMINAL
                </button>
              </div>
            )}
          </div>
          <SkipPrompt />
        </div>
      );
    }

    return (
      <div className="w-full h-full bg-zinc-900 text-amber-100 font-mono flex flex-col">
        <div className="text-center p-3 flex-shrink-0">
          <div className="text-red-400 mb-2 text-sm">TERMINAL TEST INITIATED</div>
          <div className="text-xs mb-2">SCORE: {score} / 50</div>
          {gameOver && (
            <div className="text-xs">
              <div className="text-red-400 animate-pulse mb-1">TEST FAILED... ANALYZING...</div>
              <div className="text-amber-100">RELOADING SYSTEM GTFO...</div>
            </div>
          )}
        </div>
        
        <div className="flex-1 flex items-center justify-center px-2 min-h-0">
          <div className="border border-amber-100/30 bg-zinc-900 p-1">
            <div className="grid grid-cols-20 gap-0 max-w-fit">
              {renderSnakeBoard()}
            </div>
          </div>
        </div>

        <div className="text-center p-2 text-xs flex-shrink-0">
          {gameState === 'playing' && !gameOver && !victory && "USE ARROW KEYS TO CONTROL • COLLECT ◆ FOOD • REACH 50 POINTS"}
          {gameOver && "GAME OVER • RELOADING..."}
        </div>
      </div>
    );
  }

  return null;
}

export default SnakeAdmin;