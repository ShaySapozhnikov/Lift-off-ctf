import React, { useState, useEffect, useCallback, useRef } from 'react';

function SnakeAdmin({ onExit }) {
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
  const gameRef = useRef();
  const dialogueRef = useRef();

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

  // Initialize API URL on component mount
  useEffect(() => {
    const possibleURLs = [
      'https://lift-off-ctf.onrender.com',
      'http://localhost:3000',
      'http://localhost:5000',
      'http://127.0.0.1:3000'
    ];
    
    // Set the first URL as default
    setApiUrl(possibleURLs[0]);
    setDebugInfo(`API URL set to: ${possibleURLs[0]}`);
  }, []);

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
              path: 'home/user/2nak3.bat', // Correct path based on your fs.js structure
              user: 'player',
              score: currentScore
            }),
            // Add timeout
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
      
      // For demo purposes, show a mock flag if API fails
      if (currentScore >= 50) {
        setCapturedFlag('CTF{demo_flag_api_unavailable}');
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

  // Victory condition - 50 points
  useEffect(() => {
    if (score >= 50 && !victory) {
      console.log('Victory condition met! Score:', score);
      setVictory(true);
      setGameState('victory');
      setShowingVictoryDialogue(true);
      
      // Call API
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
        setTimeout(() => setIsGlitching(false), 200);
      }
    }, 2000);
    return () => clearInterval(glitchInterval);
  }, [phase, showingVictoryDialogue]);

  // Dialogue progression
  useEffect(() => {
    if (phase === 'dialogue' && dialogueIndex < dialogues.length) {
      const timer = setTimeout(() => {
        setDialogueIndex(prev => prev + 1);
      }, 1500);
      return () => clearTimeout(timer);
    } else if (dialogueIndex >= dialogues.length && phase === 'dialogue') {
      setPhase('game');
      setGameState('playing');
    }
  }, [dialogueIndex, phase, dialogues.length]);

  // Victory dialogue progression
  useEffect(() => {
    if (showingVictoryDialogue && victoryDialogueIndex < victoryDialogues.length) {
      const timer = setTimeout(() => {
        setVictoryDialogueIndex(prev => prev + 1);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [victoryDialogueIndex, showingVictoryDialogue, victoryDialogues.length]);

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
      onExit(); // Call the parent's exit handler
    } else {
      window.location.reload(); // Fallback to reload if no onExit provided
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
        return currentSnake;
      }
      
      // Self collision
      if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
        setGameOver(true);
        return currentSnake;
      }
      
      newSnake.unshift(head);
      
      // Food collision
      if (head.x === food.x && head.y === food.y) {
        setScore(prev => prev + 1);
        // Generate new food that doesn't spawn on snake
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
      }
      
      return newSnake;
    });
  }, [direction, food, gameState, gameOver, victory]);

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
    setTimeout(() => {
      setIsGlitching(false);
      setPhase('dialogue');
    }, 500);
  };

  // Quick score increase for testing
  const increaseScore = () => {
    setScore(prev => Math.min(prev + 10, 50));
  };

  const renderSnakeBoard = () => {
    const rows = [];
    
    for (let y = 0; y < BOARD_SIZE; y++) {
      const row = [];
      for (let x = 0; x < BOARD_SIZE; x++) {
        let cellContent = '';
        let cellClass = 'w-4 h-4 flex items-center justify-center text-sm font-bold relative transition-all duration-75';
        
        // Check if this position has the snake head
        if (snake[0] && snake[0].x === x && snake[0].y === y) {
          cellContent = '●';
          cellClass += ' bg-amber-200 text-zinc-900 shadow-lg shadow-amber-200/50 border-2 border-amber-100 animate-pulse';
        }
        // Check if this position has snake body
        else if (snake.slice(1).some(segment => segment.x === x && segment.y === y)) {
          cellContent = '■';
          cellClass += ' bg-amber-400/80 text-zinc-900 border border-amber-300/60 shadow-md shadow-amber-400/30';
        }
        // Check if this position has food
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
      <div className="w-full h-full bg-zinc-900 text-amber-100 font-mono overflow-hidden">
        <div className={`text-sm leading-relaxed h-full overflow-y-auto p-4 ${isGlitching ? 'blur-sm animate-pulse' : ''}`} ref={dialogueRef}>
          <div className="mb-4">SYSTEM BREACH DETECTED...</div>
          <div className="mb-4">UNKNOWN ENTITY FOUND...</div>
          <div className="mb-8">ESTABLISHING COMMUNICATION...</div>
          
          <div className="border-t border-amber-100/30 pt-4">
            {dialogues.slice(0, dialogueIndex + 1).map((line, index) => (
              <div key={index} className="mb-2">
                <span className="text-red-400">ANOMALY:</span> {line}
                {index === dialogueIndex && showCursor && (
                  <span className="animate-pulse">█</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'game') {
    // Show victory dialogue overlay if victory is achieved
    if (showingVictoryDialogue) {
      return (
        <div className="w-full h-full bg-zinc-900 text-amber-100 font-mono overflow-hidden">
          <div className={`text-sm leading-relaxed h-full overflow-y-auto p-4 ${isGlitching ? 'blur-sm animate-pulse' : ''}`} ref={dialogueRef}>
            <div className="mb-4 text-green-400">TEST COMPLETED...</div>
            <div className="mb-4 text-amber-100">ANALYZING RESULTS...</div>
            <div className="mb-8 text-red-400">ENTITY RESPONSE DETECTED...</div>
            
            {apiError && (
              <div className="mb-4 p-2 border border-red-400 bg-red-900/20 text-red-300 text-xs">
                {apiError}
              </div>
            )}
            
            {debugInfo && (
              <div className="mb-4 p-2 border border-blue-400 bg-blue-900/20 text-blue-300 text-xs">
                Debug: {debugInfo}
              </div>
            )}
            
            <div className="border-t border-amber-100/30 pt-4">
              {victoryDialogues.slice(0, victoryDialogueIndex + 1).map((line, index) => (
                <div key={index} className="mb-2">
                  <span className="text-red-400">ANOMALY:</span> {line}
                  {index === victoryDialogueIndex && showCursor && (
                    <span className="animate-pulse">█</span>
                  )}
                  {line === "█████ FLAG EJECTED █████" && capturedFlag && (
                    <div className="mt-2 p-3 border border-amber-100/30 bg-zinc-900 rounded text-white animate-pulse">
                      ⚑ {capturedFlag}
                    </div>
                  )}
                </div>
              ))}
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
        </div>
      );
    }

    // Regular game view
    return (
      <div className="w-full h-full bg-zinc-900 text-amber-100 font-mono flex flex-col">
        {/* Debug panel */}
        <div className="text-xs p-2 border-b border-amber-100/30 space-y-1">
          <div className="flex gap-2 items-center flex-wrap">
            <input
              type="text"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="API URL"
              className="bg-zinc-800 border border-amber-100 px-2 py-1 text-amber-100 text-xs flex-1 min-w-40"
            />
            <button
              onClick={testConnection}
              className="bg-zinc-800 border border-blue-400 px-2 py-1 text-blue-400 hover:bg-blue-400 hover:text-zinc-900 transition-colors text-xs"
            >
              TEST
            </button>
            <button
              onClick={() => callVictoryAPI(score)}
              className="bg-zinc-800 border border-amber-100 px-2 py-1 text-amber-100 hover:bg-amber-100 hover:text-zinc-900 transition-colors text-xs"
            >
              TEST API
            </button>
            <button
              onClick={increaseScore}
              className="bg-zinc-800 border border-green-400 px-2 py-1 text-green-400 hover:bg-green-400 hover:text-zinc-900 transition-colors text-xs"
            >
              +10 SCORE
            </button>
            <button
              onClick={resetGame}
              className="bg-zinc-800 border border-red-400 px-2 py-1 text-red-400 hover:bg-red-400 hover:text-zinc-900 transition-colors text-xs"
            >
              RESET
            </button>
          </div>
          {debugInfo && (
            <div className="text-blue-300">Debug: {debugInfo}</div>
          )}
          {apiError && (
            <div className="text-red-300">Error: {apiError}</div>
          )}
        </div>

        <div className="text-center p-3 flex-shrink-0">
          <div className="text-red-400 mb-2 text-sm">TERMINAL TEST INITIATED</div>
          <div className="text-xs mb-2">SCORE: {score} / 50</div>
          {gameOver && (
            <div className="text-xs">
              <div className="text-red-400 animate-pulse mb-1">TEST FAILED... ANALYZING...</div>
              <div className="text-amber-100">RELOADING SYSTEM...</div>
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