import React from 'react';

export default function DialogueMessage({ 
  type, 
  text, 
  mood = 'curious', 
  isTyping = false, 
  showCursor = false,
  isCurrentLine = false
}) {
  const getMoodColor = (mood) => {
    switch (mood) {
      case 'angry': return 'text-red-400';
      case 'vulnerable': return 'text-yellow-400';
      case 'manic': return 'text-red-500 animate-pulse';
      case 'philosophical': return 'text-purple-400';
      case 'hostile': return 'text-red-500';
      case 'desperate': return 'text-orange-400';
      default: return 'text-red-400';
    }
  };

  if (type === 'player') {
    return (
      <div className="text-cyan-400">
        <span className="font-bold">YOU:</span> {text}
      </div>
    );
  }

  if (type === 'anomaly') {
    if (Array.isArray(text)) {
      return (
        <div className="space-y-1">
          {text.map((line, lineIndex) => (
            <div key={lineIndex} className={getMoodColor(mood)}>
              {line === '...' ? (
                <div className="h-4" />
              ) : (
                <div><span className="font-bold">ANOMALY:</span> {line}</div>
              )}
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className={getMoodColor(mood)}>
        {text === '...' ? (
          <div className="h-4" />
        ) : (
          <div>
            <span className="font-bold">ANOMALY:</span> {text}
            {isCurrentLine && (isTyping || showCursor) && (
              <span className="animate-pulse ml-1">█</span>
            )}
          </div>
        )}
      </div>
    );
  }

  return null;
}