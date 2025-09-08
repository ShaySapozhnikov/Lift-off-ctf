import React from 'react';

export default function DialogueProgressIndicator({ 
  points, 
  threshold, 
  characterProfile, 
  isNearFinal, 
  className = "" 
}) {
  const progressPercentage = Math.min((points / threshold) * 100, 100);
  
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
    <div className={`font-mono text-xs space-y-2 ${className}`}>
      {/* Progress Bar */}
      <div className="flex items-center space-x-2">
        <span className="text-amber-100/70 text-xs">ANALYSIS:</span>
        <div className="flex-1 bg-gray-800 h-1 rounded overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 ${
              isNearFinal ? 'bg-amber-400' : 'bg-amber-600'
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
          {dominantTrait[1] > 1 && (
            <div className="flex space-x-1">
              {Array(Math.min(dominantTrait[1], 3)).fill(0).map((_, i) => (
                <div 
                  key={i} 
                  className={`w-1 h-1 ${traitColors[dominantTrait[0]].replace('text-', 'bg-')} rounded-full`} 
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Status */}
      {isNearFinal && (
        <div className="text-amber-400 text-xs animate-pulse">
          › CRITICAL THRESHOLD APPROACHING
        </div>
      )}
      
      {progressPercentage >= 100 && (
        <div className="text-green-400 text-xs animate-pulse">
          › FINAL PHASE AVAILABLE
        </div>
      )}
    </div>
  );
}