import React, { useState, useEffect } from 'react';
import AudioPrompt from './final/AudioPrompt';
import DiscoveryScreen from './final/DiscoveryScreen';
import DialogueScreen from './final/DialogueScreen';
import FinalChoiceScreen from './final/FinalChoiceScreen';
import EndingScreen from './final/EndingScreen';
import { useAudioManager } from './final/useAudioManager';
import { useTypewriter } from './final/useTypewriter';
import { useGameLogic } from './final/useGameLogic';
import { dialoguePhases, endings, finalChoices } from './final/gameData';

export default function FinalAnomalyEncounter({ audioContext, audioEnabled, onAudioInit, onReturnToTerminal }) {
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
    handleChoice,
    getAvailableChoices,
    getFilteredFinalChoices,
    resetGame
  } = useGameLogic();

  // Get current dialogue text
  const getCurrentDialogueText = () => {
    return dialoguePhases[currentPhase] || [];
  };

  const currentText = getCurrentDialogueText();
  const currentDialogueLine = currentText[dialogueIndex] || '';
  
  // Typewriter effect for current dialogue line
  const speed = anomalyMood === 'manic' ? 20 : anomalyMood === 'angry' ? 30 : 50;
  const { displayText: currentDialogue, isTyping, isComplete } = useTypewriter(
    currentDialogueLine,
    speed,
    () => playTypewriterSound(anomalyMood)
  );

  // Debug log to see what typewriter is returning
  console.log('Main component - Typewriter state:', { 
    currentDialogueLine, 
    isTyping, 
    isComplete, 
    currentDialogue 
  });

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

  // Dialogue progression
  useEffect(() => {
    if (gameState === 'dialogue' && isComplete && currentDialogueLine) {
      const timer = setTimeout(() => {
        if (dialogueIndex + 1 < currentText.length) {
          setDialogueIndex(prev => prev + 1);
        } else {
          // Show choices when dialogue is complete
          setTimeout(() => {
            setShowChoices(true);
          }, 1000);
        }
      }, anomalyMood === 'manic' ? 300 : 600);

      return () => clearTimeout(timer);
    }
  }, [isComplete, dialogueIndex, currentText.length, gameState, anomalyMood, currentDialogueLine]);

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
    setShowChoices(false);
    
    handleChoice(choice, (shouldMoveToFinal) => {
      if (shouldMoveToFinal) {
        setTimeout(() => {
          setGameState('final_choice');
        }, 2000);
      } else {
        // Continue conversation with new choices
        setTimeout(() => {
          setShowChoices(true);
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
      <DialogueScreen
        conversationHistory={conversationHistory}
        currentDialogue={currentDialogue}
        currentPhase={currentPhase}
        dialogueIndex={dialogueIndex}
        isTyping={isTyping}
        showCursor={showCursor}
        showChoices={showChoices}
        anomalyMood={anomalyMood}
        availableChoices={getAvailableChoices()}
        onChoice={handleChoiceSelection}
        dialoguePhases={dialoguePhases}
      />
    );
  }

  if (gameState === 'final_choice') {
    return (
      <FinalChoiceScreen
        anomalyMood={anomalyMood}
        playerChoices={playerChoices}
        finalChoices={getFilteredFinalChoices()}
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