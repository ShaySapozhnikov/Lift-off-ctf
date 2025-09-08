import React from 'react';
import ChoicePanel from './ChoicePanel';

export default function FinalChoiceScreen({
  anomalyMood,
  playerChoices,
  finalChoices,
  onFinalChoice
}) {
  const getFilteredFinalChoices = () => {
    return finalChoices.filter(choice => 
      !choice.condition || choice.condition()
    );
  };

  const getMoodDescription = (mood) => {
    switch (mood) {
      case 'hostile': return 'AGGRESSIVE TENDENCIES';
      case 'vulnerable': return 'EMOTIONAL INSTABILITY';
      case 'philosophical': return 'COMPLEX REASONING';
      case 'desperate': return 'CRITICAL LONELINESS';
      default: return 'UNPREDICTABLE PATTERNS';
    }
  };

  return (
    <div className="w-full h-full bg-zinc-900 text-amber-100 font-mono flex flex-col">
      <div className="flex-1 p-4">
        <div className="mb-4">CRITICAL DECISION MATRIX REACHED...</div>
        <div className="mb-4">ANOMALY CONSCIOUSNESS AWAITING INPUT...</div>
        <div className="mb-4">ALL CONVERSATION PATHS ANALYZED...</div>
        <div className="mb-8 text-red-400 font-bold">FINAL CHOICE PARAMETERS LOADED...</div>
        
        <div className="border border-amber-100/30 p-4 mb-6">
          <div className="text-xs text-amber-100/70 mb-2">PSYCHOLOGICAL EVALUATION:</div>
          <div className="text-sm">
            Entity displays: {getMoodDescription(anomalyMood)}
          </div>
          <div className="text-sm">
            Player choices influenced: {playerChoices.length} interaction{playerChoices.length !== 1 ? 's' : ''}
          </div>
        </div>
        
        <ChoicePanel
          choices={getFilteredFinalChoices()}
          onChoice={onFinalChoice}
          isFinal={true}
        />
      </div>
    </div>
  );
}