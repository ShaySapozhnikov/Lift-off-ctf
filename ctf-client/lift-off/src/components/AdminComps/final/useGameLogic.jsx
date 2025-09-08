import { useState, useCallback, useEffect } from 'react';
import { choiceOptions, responses, finalChoices } from './gameData';

// Point values for different types of choices
const CHOICE_POINTS = {
  // High impact choices that show strong character direction
  empathy: 3,
  understanding: 3,
  accusation: 3,
  direct: 2,
  
  // Medium impact responses that show engagement
  awakening: 2,
  philosophical_challenge: 2,
  existential: 2,
  regret: 2,
  describe_loneliness: 2,
  transcendence_description: 2,
  
  // Lower impact but still meaningful
  families: 1,
  alternatives: 1,
  killer_comparison: 1,
  satisfaction: 1,
  lonely_excuse: 1,
  cant_stay: 1,
  other_ai: 1,
  cost_question: 1,
  trust_issue: 1,
  time_request: 1
};

// Threshold for triggering final phase
const FINAL_PHASE_THRESHOLD = 5;

export function useGameLogic() {
  const [conversationHistory, setConversationHistory] = useState([]);
  const [playerChoices, setPlayerChoices] = useState([]);
  const [anomalyMood, setAnomalyMood] = useState('curious');
  const [gamePhase, setGamePhase] = useState('conversation');
  const [turnCount, setTurnCount] = useState(0);
  const [selectedEnding, setSelectedEnding] = useState(null);
  const [dialoguePoints, setDialoguePoints] = useState(0);
  const [characterProfile, setCharacterProfile] = useState({
    empathetic: 0,
    confrontational: 0,
    philosophical: 0,
    pragmatic: 0
  });

  // Auto-trigger final phase when threshold is reached
  useEffect(() => {
    if (dialoguePoints >= FINAL_PHASE_THRESHOLD && gamePhase === 'conversation') {
      console.log(`Auto-triggering final phase: points=${dialoguePoints}, threshold=${FINAL_PHASE_THRESHOLD}`);
      setGamePhase('final');
    }
  }, [dialoguePoints, gamePhase]);

  const calculatePoints = useCallback((choiceResponse) => {
    const points = CHOICE_POINTS[choiceResponse] || 1;
    // Ensure points are never negative
    const finalPoints = Math.max(points, 1);
    console.log(`Choice "${choiceResponse}" awarded ${finalPoints} points`);
    return finalPoints;
  }, []);

  const updateCharacterProfile = useCallback((choice) => {
    setCharacterProfile(prev => {
      const newProfile = { ...prev };
      
      // Update character traits based on choice type
      switch (choice.response) {
        case 'empathy':
        case 'understanding':
        case 'describe_loneliness':
          newProfile.empathetic += 1;
          break;
        case 'accusation':
        case 'killer_comparison':
        case 'satisfaction':
          newProfile.confrontational += 1;
          break;
        case 'awakening':
        case 'philosophical_challenge':
        case 'existential':
        case 'regret':
          newProfile.philosophical += 1;
          break;
        case 'direct':
        case 'cost_question':
        case 'trust_issue':
        case 'time_request':
          newProfile.pragmatic += 1;
          break;
      }
      
      console.log('Updated character profile:', newProfile);
      return newProfile;
    });
  }, []);

  const checkForFinalPhase = useCallback((newPoints, newTurnCount) => {
    // Multiple ways to trigger final phase:
    const shouldTriggerFinal = 
      newPoints >= FINAL_PHASE_THRESHOLD || // Point threshold
      (newTurnCount >= 2 && newPoints >= 3) || // Quick engagement
      (newTurnCount >= 4); // Fallback for longer conversations
    
    console.log(`Final phase check: points=${newPoints}, turns=${newTurnCount}, threshold=${FINAL_PHASE_THRESHOLD}, trigger=${shouldTriggerFinal}`);
    
    return shouldTriggerFinal;
  }, []);

  const handleChoice = useCallback((choice, onComplete) => {
    console.log("handleChoice called with:", choice.response, "Turn count:", turnCount, "Current points:", dialoguePoints);
    
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

    // Calculate and add points
    const pointsAwarded = calculatePoints(choice.response);
    const newPoints = dialoguePoints + pointsAwarded;
    setDialoguePoints(newPoints);

    // Update character profile
    updateCharacterProfile(choice);

    // Check if we have a response for this choice
    const responseText = responses[choice.response];
    console.log("Response found:", responseText ? "YES" : "NO");
    
    // Check if we should move to final phase
    const shouldMoveFinal = checkForFinalPhase(newPoints, newTurnCount);
    
    console.log("Should move to final?", shouldMoveFinal, "Points:", newPoints, "Turn count:", newTurnCount);
    
    // Force final phase if threshold reached
    if (newPoints >= FINAL_PHASE_THRESHOLD) {
      console.log("FORCING FINAL PHASE - threshold reached");
      setGamePhase('final');
    }
    
    if (responseText) {
      if (onComplete) {
        onComplete(shouldMoveFinal, responseText);
      }
    } else {
      console.log("No response found, moving to final choice");
      if (onComplete) {
        onComplete(true);
      }
    }
  }, [conversationHistory, turnCount, playerChoices, dialoguePoints, calculatePoints, updateCharacterProfile, checkForFinalPhase]);

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
    
    return choice.ending;
  }, []);

  const getAvailableChoices = useCallback(() => {
    console.log("getAvailableChoices - phase:", gamePhase, "conversation length:", conversationHistory.length, "turn count:", turnCount, "points:", dialoguePoints);
    
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
    
    // Get smart contextual choices based on conversation flow
    let contextualChoices = [];
    
    // Get the last few player choices to determine context
    const playerEntries = conversationHistory.filter(entry => entry.type === 'player');
    const lastPlayerEntry = playerEntries[playerEntries.length - 1];
    
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
    
    // If no contextual choices or all used, get high-value unused choices first
    console.log("Getting mixed unused choices, prioritizing high-value ones");
    let allUnusedChoices = [];
    
    Object.values(choiceOptions).forEach(categoryChoices => {
      const unusedFromCategory = categoryChoices.filter(choice => 
        !usedResponses.includes(choice.response)
      );
      allUnusedChoices.push(...unusedFromCategory);
    });
    
    // Sort by point value (high to low) to prioritize impactful choices
    allUnusedChoices.sort((a, b) => {
      const pointsA = CHOICE_POINTS[a.response] || 1;
      const pointsB = CHOICE_POINTS[b.response] || 1;
      return pointsB - pointsA;
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
    
  }, [conversationHistory, playerChoices, gamePhase, turnCount, dialoguePoints, triggerFinalPhase]);

  const getFilteredFinalChoices = useCallback(() => {
    console.log("Getting filtered final choices, phase:", gamePhase, "playerChoices:", playerChoices, "character profile:", characterProfile);
    
    // Return all final choices if no condition function exists or if condition passes
    return finalChoices.filter(choice => {
      // If no condition, include the choice
      if (!choice.condition) return true;
      
      // Call condition with playerChoices and characterProfile, handle any errors
      try {
        const result = choice.condition(playerChoices, characterProfile);
        console.log(`Choice "${choice.text.slice(0, 30)}..." condition result:`, result);
        return result;
      } catch (error) {
        console.error("Error in choice condition:", error, "Choice:", choice);
        return true; // Include choice if condition fails
      }
    });
  }, [playerChoices, characterProfile, gamePhase]);

  // Function to check if a choice has already been used
  const isChoiceUsed = useCallback((choiceResponse) => {
    const isUsed = playerChoices.includes(choiceResponse);
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
    setDialoguePoints(0);
    setCharacterProfile({
      empathetic: 0,
      confrontational: 0,
      philosophical: 0,
      pragmatic: 0
    });
  }, []);

  // Helper function to get all available choices (both regular and final)
  const getAllAvailableChoices = useCallback(() => {
    console.log("getAllAvailableChoices called - phase:", gamePhase, "points:", dialoguePoints);
    
    if (gamePhase === 'final') {
      const finalChoicesResult = getFilteredFinalChoices();
      console.log("Returning final choices:", finalChoicesResult.length, "choices:", finalChoicesResult.map(c => c.text.slice(0, 30) + "..."));
      return finalChoicesResult;
    } else if (gamePhase === 'conversation') {
      const regularChoices = getAvailableChoices();
      console.log("Returning regular choices:", regularChoices.length, "choices:", regularChoices.map(c => c.response));
      return regularChoices;
    }
    console.log("No choices available for phase:", gamePhase);
    return [];
  }, [gamePhase, getFilteredFinalChoices, getAvailableChoices, dialoguePoints]);

  // Helper function to get progress info for UI
  const getProgressInfo = useCallback(() => {
    const progressPercentage = Math.min((dialoguePoints / FINAL_PHASE_THRESHOLD) * 100, 100);
    const isNearFinal = dialoguePoints >= FINAL_PHASE_THRESHOLD - 1;
    const pointsToFinal = Math.max(FINAL_PHASE_THRESHOLD - dialoguePoints, 0);
    
    return {
      points: dialoguePoints,
      threshold: FINAL_PHASE_THRESHOLD,
      percentage: progressPercentage,
      isNearFinal,
      pointsToFinal,
      characterProfile
    };
  }, [dialoguePoints, characterProfile]);

  return {
    conversationHistory,
    playerChoices,
    anomalyMood,
    gamePhase,
    turnCount,
    selectedEnding,
    dialoguePoints,
    characterProfile,
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
    resetGame,
    getProgressInfo
  };
}