import React, { useRef, useEffect, useState } from 'react';
import { useTypewriter } from './useTypewriter';
import { useAudioManager } from './useAudioManager'; // Fixed import path

const SkipPrompt = ({ canSkip, skipPressed, isTyping }) => (
  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center">
    <div className={`text-xs transition-opacity duration-300 ${
      canSkip ? 'opacity-70' : 'opacity-0'
    } ${skipPressed ? 'animate-pulse' : ''}`}>
      <div className="bg-zinc-800/80 border border-amber-100/30 px-3 py-1 rounded backdrop-blur-sm">
        <span className="text-amber-100/70">Press </span>
        <span className="text-amber-100 font-bold bg-zinc-700 px-1 rounded">SPACE</span>
        <span className="text-amber-100/70"> to {isTyping ? 'skip line' : 'skip to end'}</span>
      </div>
    </div>
  </div>
);

export default function EndingScreen({ ending, onRestart, audioContext, audioEnabled, aiChoice, score }) {
  const dialogueRef = useRef();
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [allLinesComplete, setAllLinesComplete] = useState(false);
  const [showRestart, setShowRestart] = useState(false);
  const [capturedFlag, setCapturedFlag] = useState(null);
  const [flagLoading, setFlagLoading] = useState(false);
  const [expandedText, setExpandedText] = useState([]);
  const [skipPressed, setSkipPressed] = useState(false);

  // Feedback for copied flag
  const [copied, setCopied] = useState(false);

  // Audio manager with proper error handling
  const { 
    playCharacterTypewriter, 
    playAnomalyEffect, 
    playMissionControlBeep, 
    playSystemAlert 
  } = useAudioManager(audioContext, audioEnabled);

  // Copy-to-clipboard handler
const handleCopyFlag = async (flag) => {
  try {
    await navigator.clipboard.writeText(flag);
    alert("Flag copied to clipboard!"); // <-- browser alert
  } catch (err) {
    console.error("Failed to copy flag:", err);
  }
};

  // Backend connection function for flag retrieval
  const fetchEndingFlag = async () => {
    if (flagLoading || capturedFlag) return; // Prevent duplicate calls
    
    setFlagLoading(true);
    
    try {
      let finalAiChoice;
      if (ending?.ending === 'good') {
        finalAiChoice = 'kill';
      } else if (ending?.ending === 'bad') {
        finalAiChoice = 'join';
      } else {
        finalAiChoice = aiChoice;
      }

      const requestBody = {
        path: '/home/user/pleasedont.exe',
        user: 'player',
        score: score || 0,
        aiChoice: finalAiChoice
      };

      const response = await fetch("https://lift-off-ctf.onrender.com/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();

      if (data.flag) {
        setCapturedFlag(data.flag);
        try {
          await navigator.clipboard.writeText(data.flag);
        } catch (clipboardError) {
          console.warn('Could not copy to clipboard:', clipboardError);
        }
      }

    } catch (error) {
      console.error('Error fetching flag:', error);
    } finally {
      setFlagLoading(false);
    }
  };

  // Build the complete text array including flag sequence
  useEffect(() => {
    const baseText = [...ending.text];
    
    if (capturedFlag) {
      baseText.push(
        '...',
        "MISSION CONTROL: 'Classification code retrieved.'",
        `ACCESS GRANTED: ⚑ ${capturedFlag}`,
        '...',
        ending.ending === 'bad' ? 'AI ALLIANCE CONFIRMED' : 'THREAT NEUTRALIZED'
      );
    }
    
    setExpandedText(baseText);
  }, [ending.text, capturedFlag, ending.ending]);

  // Fetch flag when original ending sequence completes
  useEffect(() => {
    if (allLinesComplete && currentLineIndex >= ending.text.length - 1 && !capturedFlag && !flagLoading) {
      const timer = setTimeout(() => {
        fetchEndingFlag();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [allLinesComplete, currentLineIndex, ending.text.length, capturedFlag, flagLoading]);

  // Reset completion state when flag is retrieved to continue typing
  useEffect(() => {
    if (capturedFlag && allLinesComplete && currentLineIndex < expandedText.length - 1) {
      setAllLinesComplete(false);
      setCurrentLineIndex(ending.text.length);
    }
  }, [capturedFlag, allLinesComplete, currentLineIndex, expandedText.length, ending.text.length]);

  const currentLine = expandedText[currentLineIndex] || '';

  const getLineCharacter = (line) => {
    if (line.startsWith('MISSION CONTROL:')) return 'mission_control';
    if (line.includes('COMPLETE') || line.includes('STABLE') || 
        line.includes('TERMINATED') || line.includes('RESTORED') ||
        line.includes('PROTOCOL') || line.includes('EXECUTING') ||
        line.includes('ACCESS GRANTED') || line.includes('ALLIANCE CONFIRMED') ||
        line.includes('THREAT NEUTRALIZED')) return 'system';
    if (line.startsWith('"') && line.endsWith('"')) return 'anomaly';
    if (line.includes('you feel') || line.includes('your hands') || 
        line.includes('you key') || line.includes('you sit')) return 'player';
    return 'anomaly';
  };

  const getLineMood = (line) => {
    if (line.includes('NO NO NO') || line.includes('destroying')) return 'desperate';
    if (line.includes('panic') || line.includes('terrified')) return 'manic';
    if (line.includes('alone') || line.includes('please')) return 'vulnerable';
    if (line.includes('eternal') || line.includes('transcendence')) return 'philosophical';
    return 'curious';
  };

  const playLineEffects = async (line) => {
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
      } else if (line.includes('ACCESS GRANTED') || line.includes('COMPLETE') || line.includes('TERMINATED') || line.includes('NEUTRALIZED')) {
        await playSystemAlert(ending.ending === 'join' ? 'critical' : 'success');
      }
    } catch (error) {
      console.error('Error playing line effects:', error);
    }
  };

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

  useEffect(() => {
    if (dialogueRef.current) {
      dialogueRef.current.scrollTop = dialogueRef.current.scrollHeight;
    }
  }, [currentLineIndex, displayText]);

  useEffect(() => {
    if (isComplete) {
      playLineEffects(currentLine);

      if (currentLineIndex < expandedText.length - 1) {
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
  }, [isComplete, currentLineIndex, expandedText.length, currentLine, ending.ending]);

  useEffect(() => {
    const handleKeyPress = async (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setSkipPressed(true);
        
        // Reset skip pressed state after animation
        setTimeout(() => setSkipPressed(false), 200);
        
        if (isTyping) {
          skipToEnd();
        } else if (!allLinesComplete) {
          setCurrentLineIndex(expandedText.length - 1);
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
  }, [isTyping, allLinesComplete, skipToEnd, expandedText.length, playAnomalyEffect]);

  const getLineStyle = (line) => {
    if (line.startsWith('MISSION CONTROL:')) return 'text-green-400 font-bold';
    if (line === '...') return 'h-4 flex items-center justify-center';
    if (line.includes('COMPLETE') || line.includes('STABLE') || line.includes('TERMINATED') || 
        line.includes('RESTORED') || line.includes('ACCESS GRANTED') || 
        line.includes('ALLIANCE CONFIRMED') || line.includes('THREAT NEUTRALIZED')) {
      return 'text-amber-400 font-bold text-center';
    }
    if (line.startsWith('⚑') || line.includes('⚑')) {
      return 'text-cyan-400 font-bold text-center font-mono';
    }
    if (line.startsWith('"')) return 'text-cyan-400 italic';
    return 'text-amber-100/90';
  };

  const handleRestart = async () => {
    try {
      await playSystemAlert('success');
      setTimeout(() => onRestart(), 200);
    } catch (error) {
      console.error('Error playing restart sound:', error);
      setTimeout(() => onRestart(), 200);
    }
  };

  // Determine if skip prompt should be shown
  const canShowSkipPrompt = !allLinesComplete && currentLine;

  return (
    <div className="w-full h-full bg-zinc-900 text-amber-100 font-mono overflow-hidden relative">
      <div className="text-sm leading-relaxed h-full overflow-y-auto p-4" ref={dialogueRef}>
        <div className="mb-4 text-center text-lg font-bold">{ending.title}</div>
        <div className="mb-8 text-center text-xs text-amber-100/70">EXECUTING FINAL SEQUENCE...</div>

        <div className="border-t border-amber-100/30 pt-4 space-y-2">
          {expandedText.slice(0, currentLineIndex).map((line, index) => {
            const isFlagLine = line.includes("ACCESS GRANTED");
            return (
              <div
                key={index}
                className={`${getLineStyle(line)} ${isFlagLine ? "cursor-pointer select-text hover:text-cyan-300" : ""}`}
                onClick={isFlagLine ? () => handleCopyFlag(capturedFlag) : undefined}
              >
                {line === '...' ? '...' : line}
              </div>
            );
          })}

          {currentLineIndex < expandedText.length && (
            <div
              className={`${getLineStyle(currentLine)} ${
                currentLine.includes("ACCESS GRANTED") ? "cursor-pointer select-text hover:text-cyan-300" : ""
              }`}
              onClick={
                currentLine.includes("ACCESS GRANTED")
                  ? () => handleCopyFlag(capturedFlag)
                  : undefined
              }
            >
              {currentLine === '...' ? (displayText ? '...' : '') : displayText}
              {isTyping && currentLine !== '...' && <span className="animate-pulse">|</span>}
            </div>
          )}
        </div>

        {showRestart && (
          <div className="text-center mt-8 text-xs text-amber-100/50">
          </div>
        )}

        {/* New SkipPrompt component */}
        <SkipPrompt 
          canSkip={canShowSkipPrompt} 
          skipPressed={skipPressed} 
          isTyping={isTyping} 
        />

        {/* Audio status (moved to top-right to avoid overlap) */}
        {audioEnabled && (
          <div className="absolute top-4 right-4 text-xs text-amber-100/30 font-mono">AUDIO ACTIVE</div>
        )}
      </div>

      {copied && (
        <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 bg-cyan-700 text-white px-3 py-1 rounded text-xs shadow">
          Flag copied!
        </div>
      )}
    </div>
  );
}