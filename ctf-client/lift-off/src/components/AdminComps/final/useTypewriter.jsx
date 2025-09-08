import { useState, useEffect, useRef } from 'react';

export function useTypewriter(text, speed = 50, onCharacterTyped) {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (!text || text === '...') {
      setDisplayText(text || '');
      setCurrentIndex(0);
      setIsTyping(false);
      setIsComplete(true);
      return;
    }

    // Reset state for new text
    setIsTyping(true);
    setIsComplete(false);
    setCurrentIndex(0);
    setDisplayText('');

    intervalRef.current = setInterval(() => {
      setCurrentIndex(prevIndex => {
        if (prevIndex >= text.length) {
          setIsTyping(false);
          setIsComplete(true);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          return prevIndex;
        }

        if (onCharacterTyped) {
          onCharacterTyped();
        }

        setDisplayText(text.substring(0, prevIndex + 1));
        return prevIndex + 1;
      });
    }, speed);

    // Cleanup function
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [text, speed]); // Removed onCharacterTyped from dependencies to prevent constant re-renders
  
  return {
    displayText,
    isTyping,
    isComplete,
    currentIndex
  };
}