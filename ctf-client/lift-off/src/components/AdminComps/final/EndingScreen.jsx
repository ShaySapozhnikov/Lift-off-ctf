import React, { useRef, useEffect, useState } from 'react';
import { useTypewriter } from './useTypewriter';
import { useAudioManager } from './useAudioManager'; // Fixed import path

export default function EndingScreen({ ending, onRestart, audioContext, audioEnabled }) {
  const dialogueRef = useRef();
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [allLinesComplete, setAllLinesComplete] = useState(false);
  const [showRestart, setShowRestart] = useState(false);

  // Audio manager with proper error handling
  const { 
    playCharacterTypewriter, 
    playAnomalyEffect, 
    playMissionControlBeep, 
    playSystemAlert 
  } = useAudioManager(audioContext, audioEnabled);

  // Debug audio state
  useEffect(() => {
    console.log('EndingScreen audio state:', {
      audioEnabled,
      audioContext: !!audioContext,
      audioContextState: audioContext?.state,
      playCharacterTypewriter: typeof playCharacterTypewriter,
      playAnomalyEffect: typeof playAnomalyEffect
    });
    
    // Test audio immediately
    if (audioEnabled && audioContext) {
      console.log('Testing audio in ending screen...');
      playCharacterTypewriter('system', 'curious').catch(error => {
        console.error('Test audio failed:', error);
      });
    }
  }, [audioEnabled, audioContext, playCharacterTypewriter, playAnomalyEffect]);

  // Get current line to type
  const currentLine = ending.text[currentLineIndex] || '';

  // Helper functions for character type, mood, and effects
  const getLineCharacter = (line) => {
    if (line.startsWith('MISSION CONTROL:')) return 'mission_control';
    if (line.includes('COMPLETE') || line.includes('STABLE') || 
        line.includes('TERMINATED') || line.includes('RESTORED') ||
        line.includes('PROTOCOL') || line.includes('EXECUTING')) return 'system';
    if (line.startsWith('"') && line.endsWith('"')) return 'anomaly';
    if (line.includes('you feel') || line.includes('your hands') || 
        line.includes('you key') || line.includes('you sit')) return 'player';
    return 'anomaly'; // Default for narrative text
  };

  const getLineMood = (line) => {
    if (line.includes('NO NO NO') || line.includes('destroying')) return 'desperate';
    if (line.includes('panic') || line.includes('terrified')) return 'manic';
    if (line.includes('alone') || line.includes('please')) return 'vulnerable';
    if (line.includes('eternal') || line.includes('transcendence')) return 'philosophical';
    return 'curious';
  };

  const playLineEffects = async (line) => {
    // Add small delay to ensure audio context is ready
    await new Promise(resolve => setTimeout(resolve, 100));
    
    try {
      if (line.includes('NO NO NO') || line.includes('digital panic')) {
        await playAnomalyEffect('digital_scream');
      } else if (line.includes('core system overload') || line.includes('cascade')) {
        await playAnomalyEffect('cascade_failure');
      } else if (line.includes('consciousness flows') || line.includes('merger')) {
        await playAnomalyEffect('consciousness_merge');
      } else if (line.includes('systems restart') || line.includes('purge')) {
        await playSystemAlert('success');
      } else if (line.includes('fragmenting') || line.includes('dissolving')) {
        await playAnomalyEffect('glitch');
      } else if (line.startsWith('MISSION CONTROL:')) {
        await playMissionControlBeep();
      } else if (line.includes('COMPLETE') || line.includes('TERMINATED')) {
        await playSystemAlert(ending.ending === 'join' ? 'critical' : 'success');
      }
    } catch (error) {
      console.error('Error playing line effects:', error);
    }
  };

  // Typewriter effect with audio callback
  const { displayText, isTyping, isComplete, skipToEnd } = useTypewriter(
    currentLine,
    currentLine === '...' ? 1000 : 50,
    async () => {
      try {
        const character = getLineCharacter(currentLine);
        const mood = getLineMood(currentLine);
        await playCharacterTypewriter(character, mood);
      } catch (error) {
        console.error('Error playing typewriter sound:', error);
      }
    }
  );

  // Scroll to bottom on new line
  useEffect(() => {
    if (dialogueRef.current) {
      dialogueRef.current.scrollTop = dialogueRef.current.scrollHeight;
    }
  }, [currentLineIndex, displayText]);

  // Handle progression
  useEffect(() => {
    if (isComplete) {
      // Play line effects after line completes
      playLineEffects(currentLine);

      if (currentLineIndex < ending.text.length - 1) {
        const timer = setTimeout(() => {
          setCurrentLineIndex(prev => prev + 1);
        }, currentLine === '...' ? 500 : 800);
        return () => clearTimeout(timer);
      } else {
        setAllLinesComplete(true);
        const timer = setTimeout(async () => {
          setShowRestart(true);
          try {
            if (ending.ending === 'join') {
              await playAnomalyEffect('consciousness_merge');
            } else {
              await playSystemAlert('success');
            }
          } catch (error) {
            console.error('Error playing final effect:', error);
          }
        }, 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [isComplete, currentLineIndex, ending.text.length, currentLine, ending.ending]);

  // Skip control
  useEffect(() => {
    const handleKeyPress = async (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (isTyping) {
          skipToEnd();
        } else if (!allLinesComplete) {
          setCurrentLineIndex(ending.text.length - 1);
          setAllLinesComplete(true);
          setShowRestart(true);
          try {
            await playAnomalyEffect('static_burst');
          } catch (error) {
            console.error('Error playing skip effect:', error);
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isTyping, allLinesComplete, skipToEnd, ending.text.length, playAnomalyEffect]);

  // Style helper
  const getLineStyle = (line) => {
    if (line.startsWith('MISSION CONTROL:')) return 'text-green-400 font-bold';
    if (line === '...') return 'h-4 flex items-center justify-center';
    if (line.includes('COMPLETE') || line.includes('STABLE') || line.includes('TERMINATED') || line.includes('RESTORED')) {
      return 'text-amber-400 font-bold text-center';
    }
    if (line.startsWith('"')) return 'text-cyan-400 italic';
    return 'text-amber-100/90';
  };

  // Restart handler
  const handleRestart = async () => {
    try {
      await playSystemAlert('success');
      setTimeout(() => onRestart(), 200);
    } catch (error) {
      console.error('Error playing restart sound:', error);
      setTimeout(() => onRestart(), 200);
    }
  };

  return (
    <div className="w-full h-full bg-zinc-900 text-amber-100 font-mono overflow-hidden">
      <div className="text-sm leading-relaxed h-full overflow-y-auto p-4" ref={dialogueRef}>
        <div className="mb-4 text-center text-lg font-bold">{ending.title}</div>
        <div className="mb-8 text-center text-xs text-amber-100/70">EXECUTING FINAL SEQUENCE...</div>

        <div className="border-t border-amber-100/30 pt-4 space-y-2">
          {ending.text.slice(0, currentLineIndex).map((line, index) => (
            <div key={index} className={getLineStyle(line)}>{line === '...' ? '...' : line}</div>
          ))}
          {currentLineIndex < ending.text.length && (
            <div className={getLineStyle(currentLine)}>
              {currentLine === '...' ? (displayText ? '...' : '') : displayText}
              {isTyping && currentLine !== '...' && <span className="animate-pulse">|</span>}
            </div>
          )}
        </div>

        <div className={`mt-12 text-center transition-opacity duration-1000 ${showRestart ? 'opacity-100' : 'opacity-0'}`}>
          <button
            onClick={handleRestart}
            onMouseEnter={async () => {
              try {
                await playCharacterTypewriter('system');
              } catch (error) {
                console.error('Error playing hover sound:', error);
              }
            }}
            className="bg-zinc-900 border border-amber-400 px-8 py-3 text-amber-400 hover:bg-amber-400 hover:text-zinc-900 transition-colors font-bold"
            disabled={!showRestart}
          >
            RESTART ENCOUNTER
          </button>
          <div className="mt-2 text-xs text-amber-100/50">Return to anomaly discovery phase</div>
        </div>

        {!allLinesComplete && (
          <div className="absolute bottom-4 right-4 text-xs text-amber-100/50 font-mono">
            SPACE: {isTyping ? 'Skip line' : 'Skip to end'}
          </div>
        )}

        {audioEnabled && (
          <div className="absolute bottom-4 left-4 text-xs text-amber-100/30 font-mono">🔊 AUDIO ACTIVE</div>
        )}
      </div>
    </div>
  );
}