import React, { useState, useEffect, useMemo } from 'react';
import AudioPrompt from './final/AudioPrompt';
import DiscoveryScreen from './final/DiscoveryScreen';
import DialogueScreen from './final/DialogueScreen';
import FinalChoiceScreen from './final/FinalChoiceScreen';
import EndingScreen from './final/EndingScreen';
import { useAudioManager } from './final/useAudioManager';
import { useTypewriter } from './final/useTypewriter';
import { useGameLogic } from './final/useGameLogic';
import { dialoguePhases, endings, finalChoices } from './final/gameData';

export default function FinalAnomalyEncounter({ audioContext, audioEnabled, onAudioInit, onExit }) {
  const [gameState, setGameState] = useState('discovery'); // discovery, dialogue, final_choice, ending
  const [currentPhase, setCurrentPhase] = useState('intro');
  const [dialogueIndex, setDialogueIndex] = useState(0);
  const [showChoices, setShowChoices] = useState(false);
  const [endingType, setEndingType] = useState(null);
  const [showCursor, setShowCursor] = useState(true);
  const [showAudioPrompt, setShowAudioPrompt] = useState(false);

  // Custom hooks
  const { playTypewriterSound } = useAudioManager(audioContext, audioEnabled);
  const {
    conversationHistory,
    playerChoices,
    anomalyMood,
    gamePhase,
    handleChoice,
    getAvailableChoices,
    getFilteredFinalChoices,
    getAllAvailableChoices,
    getUniqueChoices,
    isChoiceUsed,
    shouldShowFinalChoices,
    hasGameEnded,
    triggerFinalPhase,
    resetGame
  } = useGameLogic();

  // Track if we're currently displaying a response
  const [isDisplayingResponse, setIsDisplayingResponse] = useState(false);
  const [currentResponse, setCurrentResponse] = useState([]);
  const [responseIndex, setResponseIndex] = useState(0);

  // Get current dialogue text
  const getCurrentDialogueText = () => {
    if (isDisplayingResponse) {
      return currentResponse;
    }
    return dialoguePhases[currentPhase] || [];
  };

  const currentText = getCurrentDialogueText();
  const currentDialogueLine = currentText[isDisplayingResponse ? responseIndex : dialogueIndex] || '';
  
  // Typewriter effect for current dialogue line
  const speed = anomalyMood === 'manic' ? 20 : anomalyMood === 'angry' ? 30 : 50;
  const { displayText: currentDialogue, isTyping, isComplete, skipToEnd } = useTypewriter(
    currentDialogueLine,
    speed,
    () => playTypewriterSound(anomalyMood)
  );

  // Get filtered choices - prevent duplicates
  const currentChoices = useMemo(() => {
    if (gamePhase === 'final') {
      return getFilteredFinalChoices();
    }
    
    const choices = getAvailableChoices();
    // Filter out already used choices
    const filteredChoices = choices.filter(choice => !playerChoices.includes(choice.response));
    console.log("Current choices after filtering:", filteredChoices.length, "from", choices.length);
    console.log("Player choices so far:", playerChoices);
    console.log("Game phase:", gamePhase);
    return filteredChoices;
  }, [getAvailableChoices, getFilteredFinalChoices, playerChoices, gamePhase]);

  // Function to skip entire dialogue section to choices
  const skipToChoices = () => {
    if (isDisplayingResponse) {
      // Skip to end of response
      setResponseIndex(currentResponse.length - 1);
      skipToEnd();
      setTimeout(() => {
        setIsDisplayingResponse(false);
        setCurrentResponse([]);
        setResponseIndex(0);
        setShowChoices(true);
      }, 100);
    } else {
      // Skip to end of current dialogue phase
      setDialogueIndex(currentText.length - 1);
      skipToEnd();
      setTimeout(() => {
        setShowChoices(true);
      }, 100);
    }
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Q to quit
      if (e.key.toLowerCase() === 'q' && onExit) {
        e.preventDefault();
        onExit();
        return;
      }

      // Only handle skip controls during dialogue state
      if (gameState !== 'dialogue') return;

      if (e.code === 'Space') {
        e.preventDefault();
        
        if (isTyping) {
          // Skip current line typing
          skipToEnd();
        } else if (showChoices) {
          // Do nothing if choices are already showing
          return;
        } else {
          // Skip entire dialogue section to choices
          skipToChoices();
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [onExit, gameState, isTyping, showChoices, skipToEnd, skipToChoices]);

  // Cursor blinking effect - only when not typing
  useEffect(() => {
    if (isTyping) {
      setShowCursor(true); // Solid cursor when typing
      return;
    }
    
    // Blinking cursor when not typing
    const interval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);
    return () => clearInterval(interval);
  }, [isTyping]);

  // Audio prompt setup
  useEffect(() => {
    setTimeout(() => {
      if (!audioEnabled && gameState === 'discovery') {
        setShowAudioPrompt(true);
      }
    }, 1000);
  }, [audioEnabled, gameState]);

  // Check for automatic phase transitions
  useEffect(() => {
    if (gamePhase === 'final' && gameState === 'dialogue') {
      console.log("Game logic triggered final phase, transitioning...");
      setTimeout(() => {
        setGameState('final_choice');
      }, 1000);
    }
  }, [gamePhase, gameState]);

  // Dialogue progression
  useEffect(() => {
    if (gameState === 'dialogue' && isComplete && currentDialogueLine && !showChoices) {
      const timer = setTimeout(() => {
        if (isDisplayingResponse) {
          // Handle response progression
          if (responseIndex + 1 < currentResponse.length) {
            setResponseIndex(prev => prev + 1);
          } else {
            // Response complete, show choices or move to next phase
            setIsDisplayingResponse(false);
            setCurrentResponse([]);
            setResponseIndex(0);
            setTimeout(() => {
              // Check if we should move to final phase
              if (gamePhase === 'final') {
                setGameState('final_choice');
              } else {
                setShowChoices(true);
              }
            }, 1000);
          }
        } else {
          // Handle normal dialogue progression
          if (dialogueIndex + 1 < currentText.length) {
            setDialogueIndex(prev => prev + 1);
          } else {
            // Show choices when dialogue is complete
            setTimeout(() => {
              // Check if we should move to final phase
              if (gamePhase === 'final') {
                setGameState('final_choice');
              } else {
                setShowChoices(true);
              }
            }, 1000);
          }
        }
      }, anomalyMood === 'manic' ? 300 : 600);

      return () => clearTimeout(timer);
    }
  }, [isComplete, dialogueIndex, responseIndex, currentText.length, gameState, anomalyMood, currentDialogueLine, isDisplayingResponse, currentResponse.length, showChoices, gamePhase]);

  // Audio initialization
  const initializeAudio = async () => {
    try {
      if (onAudioInit) {
        const success = await onAudioInit();
        if (success) {
          setShowAudioPrompt(false);
        }
      } else {
        setShowAudioPrompt(false);
      }
    } catch (error) {
      console.error("Audio initialization failed:", error);
      setShowAudioPrompt(false);
    }
  };

  // Event handlers
  const handleDiscovery = () => {
    setGameState('dialogue');
    setCurrentPhase('intro');
    setDialogueIndex(0);
  };

  const handleChoiceSelection = (choice) => {
    // Prevent duplicate choice selection
    if (playerChoices.includes(choice.response)) {
      console.log("Choice already used, ignoring:", choice.response);
      return;
    }
    
    console.log("Processing choice:", choice.response, "Current playerChoices:", playerChoices);
    setShowChoices(false);
    
    handleChoice(choice, (shouldMoveToFinal, responseText) => {
      if (responseText && Array.isArray(responseText)) {
        // Display the response with typewriter effect
        setCurrentResponse(responseText);
        setIsDisplayingResponse(true);
        setResponseIndex(0);
      } else if (shouldMoveToFinal) {
        setTimeout(() => {
          setGameState('final_choice');
        }, 2000);
      } else {
        // Continue conversation with new choices
        setTimeout(() => {
          // Check if we should show final choices
          if (gamePhase === 'final') {
            setGameState('final_choice');
          } else {
            setShowChoices(true);
          }
        }, 1500);
      }
    });
  };

  const handleFinalChoice = (choice) => {
    setEndingType(choice.ending);
    setGameState('ending');
  };

  const handleRestart = () => {
    resetGame();
    setGameState('discovery');
    setCurrentPhase('intro');
    setDialogueIndex(0);
    setShowChoices(false);
    setEndingType(null);
    setShowAudioPrompt(false);
    setIsDisplayingResponse(false);
    setCurrentResponse([]);
    setResponseIndex(0);
  };

  // Render components based on game state
  if (showAudioPrompt) {
    return (
      <AudioPrompt
        onEnable={initializeAudio}
        onSkip={() => setShowAudioPrompt(false)}
      />
    );
  }

  if (gameState === 'discovery') {
    return <DiscoveryScreen onDiscovery={handleDiscovery} />;
  }

  if (gameState === 'dialogue') {
    return (
      <div className="w-full h-full relative">
        <DialogueScreen
          conversationHistory={conversationHistory}
          currentDialogue={currentDialogue}
          currentPhase={currentPhase}
          dialogueIndex={isDisplayingResponse ? responseIndex : dialogueIndex}
          isTyping={isTyping}
          showCursor={showCursor}
          showChoices={showChoices}
          anomalyMood={anomalyMood}
          availableChoices={currentChoices}
          onChoice={handleChoiceSelection}
          dialoguePhases={dialoguePhases}
          isDisplayingResponse={isDisplayingResponse}
        />
        
        {/* Skip instruction overlay */}
        {!showChoices && (
          <div className="absolute bottom-4 right-4 text-xs text-amber-100/50 font-mono">
            SPACE: {isTyping ? 'Skip line' : 'Skip to choices'} | Q: Quit
          </div>
        )}
      </div>
    );
  }

  if (gameState === 'final_choice') {
    return (
      <FinalChoiceScreen
        anomalyMood={anomalyMood}
        playerChoices={playerChoices}
        finalChoices={currentChoices}
        onFinalChoice={handleFinalChoice}
      />
    );
  }

  if (gameState === 'ending') {
    return (
      <EndingScreen
        ending={endings[endingType]}
        onRestart={handleRestart}
      />
    );
  }

  return null;
}