import { useState, useCallback } from 'react';
import { choiceOptions, responses, finalChoices } from './gameData';

export function useGameLogic() {
  const [conversationHistory, setConversationHistory] = useState([]);
  const [playerChoices, setPlayerChoices] = useState([]);
  const [anomalyMood, setAnomalyMood] = useState('curious');

  const handleChoice = useCallback((choice, onComplete) => {
    const newHistory = [...conversationHistory, {
      type: 'player',
      text: choice.text,
      id: choice.id
    }];
    setConversationHistory(newHistory);
    setPlayerChoices(prev => [...prev, choice.response]);

    // Add response to history and change mood
    if (responses[choice.response]) {
      setTimeout(() => {
        setConversationHistory(prev => [...prev, {
          type: 'anomaly',
          text: responses[choice.response],
          mood: choice.mood
        }]);
        
        setAnomalyMood(choice.mood);
        
        // Call completion callback
        if (onComplete) {
          onComplete(newHistory.length > 6 || choice.response === 'satisfaction');
        }
      }, 1000);
    } else {
      // Move to final choice if no specific response
      if (onComplete) {
        onComplete(true);
      }
    }
  }, [conversationHistory]);

  const getAvailableChoices = useCallback(() => {
    const phase = conversationHistory.length < 2 ? 'intro' : 
                 conversationHistory.length < 4 ? 'awakening' : 'accusation';
    
    return choiceOptions[phase] || choiceOptions.intro;
  }, [conversationHistory.length]);

  const getFilteredFinalChoices = useCallback(() => {
    return finalChoices.filter(choice => 
      !choice.condition || choice.condition(playerChoices)
    );
  }, [playerChoices]);

  const resetGame = useCallback(() => {
    setConversationHistory([]);
    setPlayerChoices([]);
    setAnomalyMood('curious');
  }, []);

  return {
    conversationHistory,
    playerChoices,
    anomalyMood,
    handleChoice,
    getAvailableChoices,
    getFilteredFinalChoices,
    resetGame
  };
}