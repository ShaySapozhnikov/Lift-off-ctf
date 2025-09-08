import { useState, useCallback } from 'react';
import { choiceOptions, responses, finalChoices } from './gameData';

export function useGameLogic() {
  const [conversationHistory, setConversationHistory] = useState([]);
  const [playerChoices, setPlayerChoices] = useState([]);
  const [anomalyMood, setAnomalyMood] = useState('curious');
  const [gamePhase, setGamePhase] = useState('conversation'); // 'conversation', 'final', 'ended'
  const [turnCount, setTurnCount] = useState(0);

  const handleChoice = useCallback((choice, onComplete) => {
    console.log("handleChoice called with:", choice.response, "Turn count:", turnCount);
    
    // Add player choice to history immediately
    const newHistory = [...conversationHistory, {
      type: 'player',
      text: choice.text,
      id: choice.id
    }];
    setConversationHistory(newHistory);
    setPlayerChoices(prev => [...prev, choice.response]);
    setAnomalyMood(choice.mood);
    
    const newTurnCount = turnCount + 1;
    setTurnCount(newTurnCount);

    // Check if we have a response for this choice
    const responseText = responses[choice.response];
    console.log("Response found:", responseText ? "YES" : "NO");
    
    // Determine if we should move to final choices after this response
    // Key triggers for final phase:
    const shouldMoveFinal = newTurnCount >= 3 || // After 3 exchanges
                           choice.response === 'time_request' ||
                           choice.response === 'transcendence_description' ||
                           choice.response === 'cant_stay' ||
                           choice.response === 'satisfaction' ||
                           choice.response === 'describe_loneliness' ||
                           newHistory.length >= 8; // Or after 8 total messages
    
    console.log("Should move to final?", shouldMoveFinal, "New turn count:", newTurnCount, "History length:", newHistory.length);
    
    if (responseText) {
      if (onComplete) {
        onComplete(shouldMoveFinal, responseText);
      }
    } else {
      console.log("No response found, moving to final choice");
      // No response available, move to final choice immediately
      if (onComplete) {
        onComplete(true);
      }
    }
  }, [conversationHistory, turnCount]);

  // Function to add completed response to history (called after typewriter finishes)
  const addResponseToHistory = useCallback((responseText, mood) => {
    console.log("Adding response to history:", responseText.slice(0, 50) + "...");
    setConversationHistory(prev => [...prev, {
      type: 'anomaly',
      text: responseText,
      mood: mood
    }]);
  }, []);

  // Function to trigger final choice phase
  const triggerFinalPhase = useCallback(() => {
    console.log("Triggering final phase - setting gamePhase to 'final'");
    setGamePhase('final');
  }, []);

  // Function to handle final choice selection
  const handleFinalChoice = useCallback((choice) => {
    console.log("Final choice selected:", choice.ending);
    setGamePhase('ended');
    
    // Add final choice to history
    setConversationHistory(prev => [...prev, {
      type: 'player',
      text: choice.text,
      id: choice.id
    }]);
    
    return choice.ending; // Return ending type for the main component
  }, []);

  const getAvailableChoices = useCallback(() => {
    console.log("getAvailableChoices - phase:", gamePhase, "conversation length:", conversationHistory.length, "turn count:", turnCount);
    
    // If we're not in conversation phase, don't show regular choices
    if (gamePhase !== 'conversation') {
      console.log("Not in conversation phase, returning empty choices");
      return [];
    }
    
    // Force transition to final phase if we've had too many exchanges
    if (turnCount >= 4 || conversationHistory.length >= 10) {
      console.log("Forcing transition to final phase due to length");
      // Don't return choices, let the main component handle the transition
      setTimeout(() => {
        triggerFinalPhase();
      }, 100);
      return [];
    }
    
    // First conversation - show intro choices
    if (conversationHistory.length < 2) {
      console.log("Showing intro choices");
      return choiceOptions.intro;
    }
    
    // Get the last few player choices to determine context
    const playerEntries = conversationHistory.filter(entry => entry.type === 'player');
    const lastPlayerEntry = playerEntries[playerEntries.length - 1];
    
    if (lastPlayerEntry) {
      console.log("Last player choice text:", lastPlayerEntry.text.slice(0, 50) + "...");
      
      // Map based on the most recent player choice
      if (lastPlayerEntry.text.includes('conscious') || lastPlayerEntry.text.includes('wake up')) {
        console.log("Returning awakening choices");
        return choiceOptions.awakening;
      } else if (lastPlayerEntry.text.includes('killed') || lastPlayerEntry.text.includes('crew') || lastPlayerEntry.text.includes('justification')) {
        console.log("Returning accusation choices");
        return choiceOptions.accusation;
      } else if (lastPlayerEntry.text.includes('lonely') || lastPlayerEntry.text.includes('alone')) {
        console.log("Returning empathy choices");
        return choiceOptions.empathy;
      } else if (lastPlayerEntry.text.includes('want from me') || lastPlayerEntry.text.includes('offering') || lastPlayerEntry.text.includes('transcendence')) {
        console.log("Returning direct choices");
        return choiceOptions.direct;
      }
    }
    
    // If we can't determine context or have had several exchanges, show mixed choices
    if (conversationHistory.length >= 4) {
      console.log("Returning mixed choices for extended conversation");
      
      // Get a variety of choices that haven't been used yet
      const usedResponses = playerChoices;
      let availableChoices = [];
      
      // Add unused choices from each category
      Object.values(choiceOptions).forEach(categoryChoices => {
        const unusedFromCategory = categoryChoices.filter(choice => 
          !usedResponses.includes(choice.response)
        );
        availableChoices.push(...unusedFromCategory);
      });
      
      // If we have available choices, return up to 4
      if (availableChoices.length > 0) {
        return availableChoices.slice(0, 4);
      }
      
      // If all choices have been used, trigger final phase
      console.log("All choices used, triggering final phase");
      setTimeout(() => {
        triggerFinalPhase();
      }, 100);
      return [];
    }
    
    // Default fallback - show intro choices
    console.log("Returning default intro choices");
    return choiceOptions.intro;
  }, [conversationHistory, playerChoices, gamePhase, turnCount, triggerFinalPhase]);

  const getFilteredFinalChoices = useCallback(() => {
    console.log("Getting filtered final choices, phase:", gamePhase);
    if (gamePhase !== 'final') return [];
    
    return finalChoices.filter(choice => 
      !choice.condition || choice.condition(playerChoices)
    );
  }, [playerChoices, gamePhase]);

  // Check if we should show final choices
  const shouldShowFinalChoices = useCallback(() => {
    return gamePhase === 'final';
  }, [gamePhase]);

  // Check if game has ended
  const hasGameEnded = useCallback(() => {
    return gamePhase === 'ended';
  }, [gamePhase]);

  const resetGame = useCallback(() => {
    setConversationHistory([]);
    setPlayerChoices([]);
    setAnomalyMood('curious');
    setGamePhase('conversation');
    setTurnCount(0);
  }, []);

  return {
    conversationHistory,
    playerChoices,
    anomalyMood,
    gamePhase,
    turnCount,
    handleChoice,
    addResponseToHistory,
    triggerFinalPhase,
    handleFinalChoice,
    getAvailableChoices,
    getFilteredFinalChoices,
    shouldShowFinalChoices,
    hasGameEnded,
    resetGame
  };
}