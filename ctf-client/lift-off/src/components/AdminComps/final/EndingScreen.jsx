import React, { useRef, useEffect, useState } from 'react';
import { useTypewriter } from './useTypewriter';

export default function EndingScreen({ ending, onRestart }) {
  const dialogueRef = useRef();
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [allLinesComplete, setAllLinesComplete] = useState(false);
  const [showRestart, setShowRestart] = useState(false);

  // Get current line to type
  const currentLine = ending.text[currentLineIndex] || '';
  
  // Typewriter effect for current line
  const { displayText, isTyping, isComplete, skipToEnd } = useTypewriter(
    currentLine,
    currentLine === '...' ? 1000 : 50 // Slower for ellipsis, normal for text
  );

  useEffect(() => {
    if (dialogueRef.current) {
      dialogueRef.current.scrollTop = dialogueRef.current.scrollHeight;
    }
  }, [currentLineIndex, displayText]);

  // Handle line completion and progression
  useEffect(() => {
    if (isComplete && currentLineIndex < ending.text.length - 1) {
      const timer = setTimeout(() => {
        setCurrentLineIndex(prev => prev + 1);
      }, currentLine === '...' ? 500 : 800); // Shorter delay for ellipsis

      return () => clearTimeout(timer);
    } else if (isComplete && currentLineIndex >= ending.text.length - 1) {
      setAllLinesComplete(true);
      // Show restart button after a brief delay
      const timer = setTimeout(() => {
        setShowRestart(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isComplete, currentLineIndex, ending.text.length, currentLine]);

  // Keyboard controls for skipping
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (isTyping) {
          skipToEnd();
        } else if (!allLinesComplete) {
          // Skip to end of all lines
          setCurrentLineIndex(ending.text.length - 1);
          setAllLinesComplete(true);
          setShowRestart(true);
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isTyping, allLinesComplete, skipToEnd, ending.text.length]);

  const getLineStyle = (line, index) => {
    if (line.startsWith('MISSION CONTROL:')) {
      return 'text-green-400 font-bold';
    }
    if (line === '...') {
      return 'h-4 flex items-center justify-center';
    }
    if (line.includes('COMPLETE') || line.includes('STABLE') || 
        line.includes('TERMINATED') || line.includes('RESTORED')) {
      return 'text-amber-400 font-bold text-center';
    }
    if (line.startsWith('"')) {
      return 'text-cyan-400 italic';
    }
    return 'text-amber-100/90';
  };

  return (
    <div className="w-full h-full bg-zinc-900 text-amber-100 font-mono overflow-hidden">
      <div className="text-sm leading-relaxed h-full overflow-y-auto p-4" ref={dialogueRef}>
        <div className="mb-4 text-center text-lg font-bold">
          {ending.title}
        </div>
        <div className="mb-8 text-center text-xs text-amber-100/70">
          EXECUTING FINAL SEQUENCE...
        </div>
        
        <div className="border-t border-amber-100/30 pt-4 space-y-2">
          {/* Render completed lines */}
          {ending.text.slice(0, currentLineIndex).map((line, index) => (
            <div 
              key={index} 
              className={getLineStyle(line, index)}
            >
              {line === '...' ? '...' : line}
            </div>
          ))}
          
          {/* Render current typing line */}
          {currentLineIndex < ending.text.length && (
            <div 
              className={getLineStyle(currentLine, currentLineIndex)}
            >
              {currentLine === '...' ? 
                (displayText ? '...' : '') : 
                displayText
              }
              {isTyping && currentLine !== '...' && (
                <span className="animate-pulse">|</span>
              )}
            </div>
          )}
        </div>
        
        {/* Restart button with fade-in animation */}
        <div className={`mt-12 text-center transition-opacity duration-1000 ${
          showRestart ? 'opacity-100' : 'opacity-0'
        }`}>
          <button
            onClick={onRestart}
            className="bg-zinc-900 border border-amber-400 px-8 py-3 text-amber-400 hover:bg-amber-400 hover:text-zinc-900 transition-colors font-bold"
            disabled={!showRestart}
          >
            RESTART ENCOUNTER
          </button>
          <div className="mt-2 text-xs text-amber-100/50">
            Return to anomaly discovery phase
          </div>
        </div>
        
        {/* Skip instruction */}
        {!allLinesComplete && (
          <div className="absolute bottom-4 right-4 text-xs text-amber-100/50 font-mono">
            SPACE: {isTyping ? 'Skip line' : 'Skip to end'}
          </div>
        )}
      </div>
    </div>
  );
}