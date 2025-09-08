import React, { useRef, useEffect } from 'react';
import DialogueMessage from './DialogueMessage';
import ChoicePanel from './ChoicePanel';

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
  dialoguePhases
}) {
  const dialogueRef = useRef();

  useEffect(() => {
    if (dialogueRef.current) {
      dialogueRef.current.scrollTop = dialogueRef.current.scrollHeight;
    }
  }, [dialogueIndex, currentDialogue, conversationHistory]);

  const currentText = dialoguePhases[currentPhase] || [];

  return (
    <div className="w-full h-full bg-zinc-900 text-amber-100 font-mono flex flex-col">
      <div className="flex-1 overflow-y-auto p-4" ref={dialogueRef}>
        <div className="mb-4">ANOMALY COMMUNICATION PROTOCOL ACTIVE...</div>
        <div className="mb-4">ENTITY CONSCIOUSNESS: CONFIRMED</div>
        <div className="mb-4">THREAT LEVEL: MAXIMUM</div>
        <div className="mb-8">PSYCHOLOGICAL PROFILE: COMPLEX</div>
        
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
          {currentText.slice(0, dialogueIndex).map((line, index) => (
            <DialogueMessage
              key={index}
              type="anomaly"
              text={line}
              mood={anomalyMood}
              isCurrentLine={false}
            />
          ))}
          
          {dialogueIndex < currentText.length && (
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