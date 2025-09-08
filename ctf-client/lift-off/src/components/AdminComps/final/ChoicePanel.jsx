import React from 'react';

export default function ChoicePanel({ choices, onChoice, isFinal = false }) {
  return (
    <div className="border-t border-amber-100/30 p-4">
      <div className="mb-4 text-xs text-amber-100/70">
        {isFinal ? 'FINAL DECISION MATRIX:' : 'RESPONSE OPTIONS AVAILABLE:'}
      </div>
      <div className="space-y-2">
        {choices.map((choice) => (
          <button
            key={choice.id}
            onClick={() => onChoice(choice)}
            className={`block w-full text-left p-3 bg-zinc-900 border transition-colors ${
              isFinal
                ? choice.ending === 'join' 
                  ? 'border-red-400/50 hover:border-red-400 hover:bg-red-950/20'
                  : 'border-green-400/50 hover:border-green-400 hover:bg-green-950/20'
                : 'border-amber-100/30 hover:border-cyan-400 hover:bg-zinc-800'
            }`}
          >
            <span className={`font-bold ${
              isFinal
                ? choice.ending === 'join' ? 'text-red-400' : 'text-green-400'
                : 'text-cyan-400'
            }`}>
              {choice.id}.
            </span>
            <span className="ml-2 text-amber-100">{choice.text}</span>
            {choice.condition && (
              <div className="text-xs text-amber-100/50 ml-6 mt-1">
                [Available due to previous choices]
              </div>
            )}
          </button>
        ))}
      </div>
      {isFinal && (
        <div className="text-center mt-4 text-xs text-amber-100/50">
          FINAL DECISION WILL DETERMINE MISSION OUTCOME
        </div>
      )}
    </div>
  );
}