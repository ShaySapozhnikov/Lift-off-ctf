import React, { useRef, useEffect } from 'react';
import DialogueMessage from './DialogueMessage';
import ChoicePanel from './ChoicePanel';

// Progress indicator component
function ProgressIndicator({ points, threshold, characterProfile, pointsToFinal }) {
  const progressPercentage = Math.min((points / threshold) * 100, 100);
  const isNearFinal = points >= threshold - 1;
  const isFinalReady = points >= threshold;
  
  // Find dominant character trait
  const traits = Object.entries(characterProfile);
  const dominantTrait = traits.reduce((max, current) => 
    current[1] > max[1] ? current : max
  );

  const traitColors = {
    empathetic: 'text-blue-400',
    confrontational: 'text-red-400', 
    philosophical: 'text-purple-400',
    pragmatic: 'text-green-400'
  };

  const traitDescriptions = {
    empathetic: 'Understanding',
    confrontational: 'Defiant',
    philosophical: 'Contemplative', 
    pragmatic: 'Direct'
  };

  return (
    <div className="bg-black/90 backdrop-blur-sm border-b border-amber-600/30 p-4">
      <div className="font-mono text-xs space-y-2">
        {/* Progress Bar */}
        <div className="flex items-center space-x-2">
          <span className="text-amber-100/70 text-xs">ANALYSIS:</span>
          <div className="flex-1 bg-gray-800 h-1 rounded overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${
                isFinalReady ? 'bg-green-400' : isNearFinal ? 'bg-amber-400' : 'bg-amber-600'
              }`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <span className="text-amber-100/70 text-xs">
            {points}/{threshold}
          </span>
        </div>

        {/* Character Profile */}
        {dominantTrait[1] > 0 && (
          <div className="flex items-center space-x-2">
            <span className="text-amber-100/50 text-xs">PROFILE:</span>
            <span className={`text-xs ${traitColors[dominantTrait[0]]}`}>
              {traitDescriptions[dominantTrait[0]].toUpperCase()}
            </span>
          </div>
        )}

        {/* Status */}
        {isFinalReady ? (
          <div className="text-green-400 text-xs animate-pulse">
            › FINAL PHASE READY
          </div>
        ) : isNearFinal ? (
          <div className="text-amber-400 text-xs animate-pulse">
            › CRITICAL THRESHOLD APPROACHING
          </div>
        ) : pointsToFinal > 0 ? (
          <div className="text-amber-100/70 text-xs">
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function DialogueScreen({
  conversationHistory,
  currentDialogue,
  currentPhase,
  dialogueIndex,
  isTyping,
  showCursor,
  showChoices,
  anomalyMood,
  availableChoices,
  onChoice,
  dialoguePhases,
  isDisplayingResponse = false,
  // Add these new props for the progress indicator
  progressInfo
}) {
  const dialogueRef = useRef();

  useEffect(() => {
    if (dialogueRef.current) {
      dialogueRef.current.scrollTop = dialogueRef.current.scrollHeight;
    }
  }, [dialogueIndex, currentDialogue, conversationHistory]);

  const currentText = isDisplayingResponse ? [] : (dialoguePhases[currentPhase] || []);

  return (
    <div className="w-full h-full bg-zinc-900 text-amber-100 font-mono flex flex-col">
      {/* Fixed progress indicator at top */}
      {progressInfo && (
        <ProgressIndicator
          points={progressInfo.points}
          threshold={progressInfo.threshold}
          characterProfile={progressInfo.characterProfile}
          pointsToFinal={progressInfo.pointsToFinal}
        />
      )}
      
      {/* Main dialogue content */}
      <div className="flex-1 overflow-y-auto p-4" ref={dialogueRef}>
        <div className="mb-4"></div>
        <div className="mb-4"></div>
        <div className="mb-4"></div>
        <div className="mb-8"></div>
        
        {/* Conversation history */}
        <div className="border-t border-amber-100/30 pt-4 space-y-3">
          {conversationHistory.map((entry, index) => (
            <DialogueMessage
              key={index}
              type={entry.type}
              text={entry.text}
              mood={entry.mood}
            />
          ))}
          
          {/* Previous dialogue lines - completed, no cursor */}
          {!isDisplayingResponse && currentText.slice(0, dialogueIndex).map((line, index) => (
            <DialogueMessage
              key={index}
              type="anomaly"
              text={line}
              mood={anomalyMood}
              isCurrentLine={false}
            />
          ))}
          
          {(dialogueIndex < currentText.length || isDisplayingResponse) && (
            <DialogueMessage
              type="anomaly"
              text={currentDialogue}
              mood={anomalyMood}
              isTyping={isTyping}
              showCursor={showCursor}
              isCurrentLine={true}
            />
          )}
        </div>
      </div>
      
      {showChoices && (
        <ChoicePanel
          choices={availableChoices}
          onChoice={onChoice}
        />
      )}
    </div>
  );
}