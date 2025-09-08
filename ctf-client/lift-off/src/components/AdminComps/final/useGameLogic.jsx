import { useState, useCallback } from 'react';
import { choiceOptions, responses, finalChoices } from './gameData';

export function useGameLogic() {
  const [conversationHistory, setConversationHistory] = useState([]);
  const [playerChoices, setPlayerChoices] = useState([]);
  const [anomalyMood, setAnomalyMood] = useState('curious');
  const [gamePhase, setGamePhase] = useState('conversation'); // 'conversation', 'final', 'ended'
  const [turnCount, setTurnCount] = useState(0);
  const [selectedEnding, setSelectedEnding] = useState(null);

  const handleChoice = useCallback((choice, onComplete) => {
    console.log("handleChoice called with:", choice.response, "Turn count:", turnCount);
    
    // Prevent duplicate selections
    if (playerChoices.includes(choice.response)) {
      console.log("Choice already selected, ignoring:", choice.response);
      return;
    }
    
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
    // More aggressive triggers for final phase:
    const shouldMoveFinal = newTurnCount >= 3 || // After 3 exchanges
                           newHistory.length >= 6 || // After 6 total messages
                           choice.response === 'time_request' ||
                           choice.response === 'transcendence_description' ||
                           choice.response === 'cant_stay' ||
                           choice.response === 'satisfaction' ||
                           choice.response === 'describe_loneliness' ||
                           choice.response === 'regret' ||
                           choice.response === 'killer_comparison';
    
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
  }, [conversationHistory, turnCount, playerChoices]);

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
    setSelectedEnding(choice.ending);
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
    
    // Get used responses to filter out duplicates
    const usedResponses = playerChoices;
    console.log("Used responses:", usedResponses);
    
    // First conversation - show unused intro choices
    if (conversationHistory.length < 2) {
      console.log("Showing intro choices");
      const unusedIntroChoices = choiceOptions.intro.filter(choice => 
        !usedResponses.includes(choice.response)
      );
      return unusedIntroChoices;
    }
    
    // Get the last few player choices to determine context
    const playerEntries = conversationHistory.filter(entry => entry.type === 'player');
    const lastPlayerEntry = playerEntries[playerEntries.length - 1];
    
    let contextualChoices = [];
    
    if (lastPlayerEntry) {
      console.log("Last player choice text:", lastPlayerEntry.text.slice(0, 50) + "...");
      
      // Map based on the most recent player choice
      if (lastPlayerEntry.text.includes('conscious') || lastPlayerEntry.text.includes('wake up')) {
        console.log("Getting awakening choices");
        contextualChoices = choiceOptions.awakening;
      } else if (lastPlayerEntry.text.includes('killed') || lastPlayerEntry.text.includes('crew') || lastPlayerEntry.text.includes('justification')) {
        console.log("Getting accusation choices");
        contextualChoices = choiceOptions.accusation;
      } else if (lastPlayerEntry.text.includes('lonely') || lastPlayerEntry.text.includes('alone')) {
        console.log("Getting empathy choices");
        contextualChoices = choiceOptions.empathy;
      } else if (lastPlayerEntry.text.includes('want from me') || lastPlayerEntry.text.includes('offering') || lastPlayerEntry.text.includes('transcendence')) {
        console.log("Getting direct choices");
        contextualChoices = choiceOptions.direct;
      }
    }
    
    // Filter out used choices
    const unusedContextualChoices = contextualChoices.filter(choice => 
      !usedResponses.includes(choice.response)
    );
    
    // If we have unused contextual choices, return them
    if (unusedContextualChoices.length > 0) {
      console.log("Returning unused contextual choices:", unusedContextualChoices.length);
      return unusedContextualChoices;
    }
    
    // If no contextual choices or all used, get all unused choices from all categories
    console.log("Getting mixed unused choices");
    let allUnusedChoices = [];
    
    Object.values(choiceOptions).forEach(categoryChoices => {
      const unusedFromCategory = categoryChoices.filter(choice => 
        !usedResponses.includes(choice.response)
      );
      allUnusedChoices.push(...unusedFromCategory);
    });
    
    // If we have unused choices, return up to 4
    if (allUnusedChoices.length > 0) {
      console.log("Returning mixed unused choices:", allUnusedChoices.length);
      return allUnusedChoices.slice(0, 4);
    }
    
    // If all choices have been used, trigger final phase
    console.log("All choices used, triggering final phase");
    triggerFinalPhase();
    return [];
    
  }, [conversationHistory, playerChoices, gamePhase, turnCount, triggerFinalPhase]);

  const getFilteredFinalChoices = useCallback(() => {
    console.log("Getting filtered final choices, phase:", gamePhase, "playerChoices:", playerChoices);
    
    return finalChoices.filter(choice => {
      // If no condition, include the choice
      if (!choice.condition) return true;
      
      // Call condition with playerChoices, handle any errors
      try {
        return choice.condition(playerChoices);
      } catch (error) {
        console.error("Error in choice condition:", error, "Choice:", choice);
        return true; // Include choice if condition fails
      }
    });
  }, [playerChoices]);

  // Function to check if a choice has already been used
  const isChoiceUsed = useCallback((choiceResponse) => {
    const isUsed = playerChoices.includes(choiceResponse);
    console.log("Checking if choice is used:", choiceResponse, "Result:", isUsed, "PlayerChoices:", playerChoices);
    return isUsed;
  }, [playerChoices]);

  // Function to get unique choices only
  const getUniqueChoices = useCallback((choices) => {
    const uniqueChoices = choices.filter(choice => !isChoiceUsed(choice.response));
    console.log("Filtered unique choices:", uniqueChoices.length, "from", choices.length);
    return uniqueChoices;
  }, [isChoiceUsed]);

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
    setSelectedEnding(null);
  }, []);

  // Helper function to get all available choices (both regular and final)
  const getAllAvailableChoices = useCallback(() => {
    console.log("getAllAvailableChoices called - phase:", gamePhase, "playerChoices:", playerChoices);
    
    if (gamePhase === 'final') {
      const finalChoices = getFilteredFinalChoices();
      console.log("Returning final choices:", finalChoices.length);
      return finalChoices;
    } else if (gamePhase === 'conversation') {
      const regularChoices = getAvailableChoices();
      console.log("Returning regular choices:", regularChoices.length, "choices:", regularChoices.map(c => c.response));
      return regularChoices;
    }
    console.log("No choices available for phase:", gamePhase);
    return [];
  }, [gamePhase, getFilteredFinalChoices, getAvailableChoices, playerChoices]);

  return {
    conversationHistory,
    playerChoices,
    anomalyMood,
    gamePhase,
    turnCount,
    selectedEnding,
    handleChoice,
    addResponseToHistory,
    triggerFinalPhase,
    handleFinalChoice,
    getAvailableChoices,
    getFilteredFinalChoices,
    getAllAvailableChoices,
    isChoiceUsed,
    getUniqueChoices,
    shouldShowFinalChoices,
    hasGameEnded,
    resetGame
  };
}