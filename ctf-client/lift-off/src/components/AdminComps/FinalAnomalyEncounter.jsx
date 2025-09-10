import React, { useState, useEffect, useMemo } from 'react';
import AudioPrompt from './final/AudioPrompt';
import DiscoveryScreen from './final/DiscoveryScreen';
import DialogueScreen from './final/DialogueScreen';
import FinalChoiceScreen from './final/FinalChoiceScreen';
import EndingScreen from './final/EndingScreen';
import { useAudioManager } from './final/useAudioManager';
import { useTypewriter } from './final/useTypewriter';
import { useGameLogic } from './final/useGameLogic';
import { dialoguePhases, endings } from './final/gameData';

export default function FinalAnomalyEncounter({ audioContext, audioEnabled, onAudioInit, onExit }) {
  const [gameState, setGameState] = useState('discovery');
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
    dialoguePoints,
    characterProfile,
    handleChoice,
    getAvailableChoices,
    getFilteredFinalChoices,
    resetGame,
    getProgressInfo
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

  // Get current choices based on game phase
  const currentChoices = useMemo(() => {
    console.log("Getting current choices - gamePhase:", gamePhase, "gameState:", gameState, "points:", dialoguePoints);
    
    if (gamePhase === 'final' || gameState === 'final_choice') {
      const finalChoices = getFilteredFinalChoices();
      console.log("Final choices available:", finalChoices.length, finalChoices.map(c => c.text.slice(0, 30) + "..."));
      return finalChoices;
    }
    
    const choices = getAvailableChoices();
    const filteredChoices = choices.filter(choice => !playerChoices.includes(choice.response));
    console.log("Regular choices available:", filteredChoices.length, filteredChoices.map(c => c.response));
    return filteredChoices;
  }, [getAvailableChoices, getFilteredFinalChoices, playerChoices, gamePhase, gameState, dialoguePoints]);

  // Get progress information
  const progressInfo = getProgressInfo();

  // Function to skip entire dialogue section to choices
  const skipToChoices = () => {
    if (isDisplayingResponse) {
      setResponseIndex(currentResponse.length - 1);
      skipToEnd();
      setTimeout(() => {
        setIsDisplayingResponse(false);
        setCurrentResponse([]);
        setResponseIndex(0);
        setShowChoices(true);
      }, 100);
    } else {
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
      if (e.key.toLowerCase() === 'q' && onExit) {
        e.preventDefault();
        onExit();
        return;
      }

      if (gameState !== 'dialogue') return;

      if (e.code === 'Space') {
        e.preventDefault();
        
        if (isTyping) {
          skipToEnd();
        } else if (showChoices) {
          return;
        } else {
          skipToChoices();
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [onExit, gameState, isTyping, showChoices, skipToEnd, skipToChoices]);

  // Cursor blinking effect
  useEffect(() => {
    if (isTyping) {
      setShowCursor(true);
      return;
    }
    
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

  // Check for automatic phase transitions based on points
  useEffect(() => {
    console.log("Phase transition check - gamePhase:", gamePhase, "gameState:", gameState, "points:", dialoguePoints);
    
    if (gamePhase === 'final' && gameState === 'dialogue' && !isDisplayingResponse) {
      console.log("Point system triggered final phase, transitioning to final_choice...");
      setTimeout(() => {
        setGameState('final_choice');
      }, 1000);
    }
  }, [gamePhase, gameState, dialoguePoints, isDisplayingResponse]);

  // Dialogue progression
  useEffect(() => {
    if (gameState === 'dialogue' && isComplete && currentDialogueLine && !showChoices) {
      const timer = setTimeout(() => {
        if (isDisplayingResponse) {
          if (responseIndex + 1 < currentResponse.length) {
            setResponseIndex(prev => prev + 1);
          } else {
            setIsDisplayingResponse(false);
            setCurrentResponse([]);
            setResponseIndex(0);
            setTimeout(() => {
              if (gamePhase === 'final') {
                console.log("Response complete, moving to final choice phase");
                setGameState('final_choice');
              } else {
                setShowChoices(true);
              }
            }, 1000);
          }
        } else {
          if (dialogueIndex + 1 < currentText.length) {
            setDialogueIndex(prev => prev + 1);
          } else {
            setTimeout(() => {
              if (gamePhase === 'final') {
                console.log("Dialogue complete, moving to final choice phase");
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
    if (playerChoices.includes(choice.response)) {
      console.log("Choice already used, ignoring:", choice.response);
      return;
    }
    
    console.log("Processing choice:", choice.response, "Current total points:", dialoguePoints);
    setShowChoices(false);
    
    handleChoice(choice, (shouldMoveToFinal, responseText) => {
      console.log("Choice processed - shouldMoveToFinal:", shouldMoveToFinal, "hasResponse:", !!responseText, "gamePhase:", gamePhase);
      
      if (responseText && Array.isArray(responseText)) {
        setCurrentResponse(responseText);
        setIsDisplayingResponse(true);
        setResponseIndex(0);
      } else if (shouldMoveToFinal || gamePhase === 'final') {
        console.log("Moving to final choice immediately");
        setTimeout(() => {
          setGameState('final_choice');
        }, 1000);
      } else {
        setTimeout(() => {
          if (gamePhase === 'final') {
            console.log("Game phase is final, moving to final_choice");
            setGameState('final_choice');
          } else {
            setShowChoices(true);
          }
        }, 1500);
      }
    });
  };

  const handleFinalChoice = (choice) => {
    console.log("Final choice selected:", choice.ending);
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
          progressInfo={progressInfo}
        />
        
        {/* Skip instruction overlay */}
        {!showChoices && (
          <div className="absolute bottom-4 right-4 text-xs text-amber-100/50 font-mono space-y-1">
            <div>SPACE: {isTyping ? 'Skip line' : 'Skip to choices'}</div>
            <div>Q: Quit</div>
            {progressInfo.pointsToFinal > 0 && (
              <div className="text-amber-400 animate-pulse">
                › {progressInfo.pointsToFinal} more to final phase
              </div>
            )}
            {progressInfo.points >= progressInfo.threshold && (
              <div className="text-green-400 animate-pulse">
                › Final phase ready - space to continue
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  if (gameState === 'final_choice') {
    console.log("Rendering final choice screen with", currentChoices.length, "choices");
    return (
      <FinalChoiceScreen
        anomalyMood={anomalyMood}
        playerChoices={playerChoices}
        characterProfile={characterProfile}
        finalChoices={currentChoices}
        onFinalChoice={handleFinalChoice}
      />
    );
  }

  if (gameState === 'ending') {
    return (
      <EndingScreen
        ending={endings[endingType]}
        characterProfile={characterProfile}
        finalPoints={dialoguePoints}
        onRestart={handleRestart}
        audioContext={audioContext}   
        audioEnabled={audioEnabled} 
      />
    );
  }

  return null;
}