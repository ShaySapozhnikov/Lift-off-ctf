import React, { useState, useEffect, useCallback, useRef } from 'react';

function SnakeAdmin() {
  const [phase, setPhase] = useState('discovery');
  const [dialogueIndex, setDialogueIndex] = useState(0);
  const [isGlitching, setIsGlitching] = useState(false);
  const [showCursor, setShowCursor] = useState(true);
  const [gameState, setGameState] = useState('waiting');
  const [snake, setSnake] = useState([{x: 10, y: 10}]);
  const [food, setFood] = useState({x: 5, y: 5});
  const [direction, setDirection] = useState({x: 0, y: 0});
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
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

  // Auto-scroll dialogue
  useEffect(() => {
    if (dialogueRef.current && phase === 'dialogue') {
      dialogueRef.current.scrollTop = dialogueRef.current.scrollHeight;
    }
  }, [dialogueIndex, phase]);

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
      if (Math.random() < 0.1 && phase === 'dialogue') {
        setIsGlitching(true);
        setTimeout(() => setIsGlitching(false), 200);
      }
    }, 2000);
    return () => clearInterval(glitchInterval);
  }, [phase]);

  // Dialogue progression
  useEffect(() => {
    if (phase === 'dialogue' && dialogueIndex < dialogues.length) {
      const timer = setTimeout(() => {
        setDialogueIndex(prev => prev + 1);
      }, 1500);
      return () => clearTimeout(timer);
    } else if (dialogueIndex >= dialogues.length && phase === 'dialogue') {
      setPhase('game');
      setGameState('ready');
    }
  }, [dialogueIndex, phase, dialogues.length]);

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
    setDirection({x: 0, y: 0});
    setScore(0);
    setGameOver(false);
    setGameState('ready');
  };

  const moveSnake = useCallback(() => {
    if (gameState !== 'playing' || gameOver) return;

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
  }, [direction, food, gameState, gameOver]);

  useEffect(() => {
    const gameLoop = setInterval(moveSnake, 150);
    return () => clearInterval(gameLoop);
  }, [moveSnake]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (gameOver && gameState === 'playing') {
        e.preventDefault();
        if (e.key === ' ' || e.key === 'Enter') {
          resetGame();
          return;
        }
      }

      if (gameState === 'ready') {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
          e.preventDefault();
          setGameState('playing');
          switch(e.key) {
            case 'ArrowUp':
              setDirection({x: 0, y: -1});
              break;
            case 'ArrowDown':
              setDirection({x: 0, y: 1});
              break;
            case 'ArrowLeft':
              setDirection({x: -1, y: 0});
              break;
            case 'ArrowRight':
              setDirection({x: 1, y: 0});
              break;
          }
        }
        return;
      }
      
      if (gameState !== 'playing' || gameOver) return;
      
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
        case ' ':
        case 'Escape':
          setGameState('paused');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState, direction, gameOver]);

  // Game over effect - show reboot sequence
  useEffect(() => {
    if (gameOver) {
      const timer = setTimeout(() => {
        setPhase('reboot');
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

  const renderSnakeBoard = () => {
    const rows = [];
    
    for (let y = 0; y < BOARD_SIZE; y++) {
      const row = [];
      for (let x = 0; x < BOARD_SIZE; x++) {
        let cellContent = '';
        let cellClass = 'w-3 h-3 border border-amber-100/20 flex items-center justify-center text-xs';
        
        // Check if this position has the snake head
        if (snake[0] && snake[0].x === x && snake[0].y === y) {
          cellContent = '█';
          cellClass += ' bg-amber-100 text-zinc-900';
        }
        // Check if this position has snake body
        else if (snake.slice(1).some(segment => segment.x === x && segment.y === y)) {
          cellContent = '▓';
          cellClass += ' bg-amber-100/70 text-zinc-900';
        }
        // Check if this position has food
        else if (food.x === x && food.y === y) {
          cellContent = '●';
          cellClass += ' bg-red-500 text-amber-100';
        }
        else {
          cellClass += ' bg-zinc-900';
        }
        
        row.push(
          <div key={`${x}-${y}`} className={cellClass}>
            {cellContent}
          </div>
        );
      }
      rows.push(
        <div key={y} className="flex">
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
    return (
      <div className="w-full h-full bg-zinc-900 text-amber-100 font-mono flex flex-col">
        <div className="text-center p-3 flex-shrink-0">
          <div className="text-red-400 mb-2 text-sm">TERMINAL TEST INITIATED</div>
          <div className="text-xs mb-2">SCORE: {score}</div>
          {gameState === 'ready' && (
            <div className="text-xs animate-pulse">PRESS ANY ARROW KEY TO BEGIN</div>
          )}
          {gameState === 'paused' && (
            <div className="text-xs animate-pulse">PAUSED - PRESS ARROW KEY TO RESUME</div>
          )}
          {gameOver && (
            <div className="text-xs">
              <div className="text-red-400 animate-pulse mb-1">TEST FAILED... ANALYZING...</div>
              <div className="text-amber-100">PRESS SPACE OR ENTER TO RETRY</div>
            </div>
          )}
        </div>
        
        <div className="flex-1 flex items-center justify-center px-2 min-h-0">
  <div className="border border-amber-100/30 bg-zinc-900 p-1 scale-150 origin-center">
    <div className="grid grid-cols-20 gap-0 max-w-fit">
      {renderSnakeBoard()}
    </div>
  </div>
</div>

        
        <div className="text-center p-2 text-xs flex-shrink-0">
          {gameState === 'ready' && "USE ARROW KEYS TO CONTROL • COLLECT FOOD • AVOID WALLS"}
          {gameState === 'playing' && "USE ARROW KEYS • SPACE TO PAUSE • COLLECT ● FOOD"}
          {gameState === 'paused' && "GAME PAUSED • PRESS ARROW KEY TO RESUME"}
          {gameOver && "GAME OVER • PRESS SPACE OR ENTER TO RETRY"}
        </div>
      </div>
    );
  }

  if (phase === 'reboot') {
    return (
      <div className="w-full h-full bg-zinc-900 text-amber-100 font-mono p-4">
        <div className="text-sm leading-relaxed">
          <div className="mb-4">rebooting...</div>
          <div className="mb-4 animate-pulse">scanning for anomaly...</div>
          <div className="mb-4">status: UNKNOWN</div>
          <div className="mt-8 text-xs opacity-50">
            {showCursor && <span className="animate-pulse">█</span>}
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default SnakeAdmin;