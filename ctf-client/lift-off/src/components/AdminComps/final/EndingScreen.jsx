import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useTypewriter } from './useTypewriter';

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
  const [copied, setCopied] = useState(false);

  // Audio Functions - Integrated directly into the component
  const ensureContext = useCallback(async () => {
    if (audioContext && audioContext.state === 'suspended') {
      try {
        await audioContext.resume();
        console.log("AudioContext resumed");
      } catch (err) {
        console.warn("Failed to resume AudioContext:", err);
      }
    }
  }, [audioContext]);

  const playCharacterTypewriter = useCallback(async (character = 'anomaly', mood = 'curious') => {
    if (!audioEnabled || !audioContext) {
      console.log('Audio disabled or no context:', { audioEnabled, audioContext: !!audioContext });
      return;
    }
    await ensureContext();

    try {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();

      let frequency, volume, duration;

      switch (character) {
        case 'anomaly':
          frequency = 800 + Math.random() * 600;
          volume = mood === 'manic' ? 0.06 :
                   mood === 'angry' ? 0.07 :
                   mood === 'desperate' ? 0.04 : 0.03;
          duration = mood === 'manic' ? 0.03 : 0.05;
          osc.type = 'square';
          break;

        case 'mission_control':
          frequency = 300 + Math.random() * 200;
          volume = 0.04;
          duration = 0.08;
          osc.type = 'sine';
          break;

        case 'player':
          frequency = 600 + Math.random() * 300;
          volume = 0.035;
          duration = 0.06;
          osc.type = 'triangle';
          break;

        case 'system':
          frequency = 1200 + Math.random() * 400;
          volume = 0.025;
          duration = 0.04;
          osc.type = 'sawtooth';
          break;

        default:
          frequency = 1000 + Math.random() * 500;
          volume = 0.03;
          duration = 0.05;
          osc.type = 'square';
      }

      osc.frequency.setValueAtTime(frequency, audioContext.currentTime);
      gain.gain.setValueAtTime(volume, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);

      osc.connect(gain);
      gain.connect(audioContext.destination);
      osc.start(audioContext.currentTime);
      osc.stop(audioContext.currentTime + duration);
    } catch (error) {
      console.error("Error playing character typewriter sound:", error);
    }
  }, [audioContext, audioEnabled, ensureContext]);

  const playAnomalyEffect = useCallback(async (effectType = 'glitch') => {
    if (!audioEnabled || !audioContext) return;
    await ensureContext();

    try {
      const playEffect = () => {
        switch (effectType) {
          case 'glitch':
            const osc1 = audioContext.createOscillator();
            const gain1 = audioContext.createGain();
            const filter = audioContext.createBiquadFilter();

            osc1.type = 'square';
            osc1.frequency.setValueAtTime(800, audioContext.currentTime);
            osc1.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.3);

            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(2000, audioContext.currentTime);
            filter.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.3);

            gain1.gain.setValueAtTime(0.08, audioContext.currentTime);
            gain1.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);

            osc1.connect(filter);
            filter.connect(gain1);
            gain1.connect(audioContext.destination);

            osc1.start(audioContext.currentTime);
            osc1.stop(audioContext.currentTime + 0.3);
            break;

          case 'digital_scream':
            for (let i = 0; i < 5; i++) {
              setTimeout(() => {
                const osc = audioContext.createOscillator();
                const gain = audioContext.createGain();

                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(1500 + Math.random() * 1000, audioContext.currentTime);

                gain.gain.setValueAtTime(0.06, audioContext.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);

                osc.connect(gain);
                gain.connect(audioContext.destination);
                osc.start(audioContext.currentTime);
                osc.stop(audioContext.currentTime + 0.1);
              }, i * 50);
            }
            break;

          case 'consciousness_merge':
            const frequencies = [220, 330, 440, 660];
            frequencies.forEach((freq, index) => {
              setTimeout(() => {
                const osc = audioContext.createOscillator();
                const gain = audioContext.createGain();

                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, audioContext.currentTime);

                gain.gain.setValueAtTime(0.02, audioContext.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 2);

                osc.connect(gain);
                gain.connect(audioContext.destination);
                osc.start(audioContext.currentTime);
                osc.stop(audioContext.currentTime + 2);
              }, index * 200);
            });
            break;

          case 'cascade_failure':
            for (let i = 0; i < 10; i++) {
              setTimeout(() => {
                const osc = audioContext.createOscillator();
                const gain = audioContext.createGain();

                osc.type = 'square';
                osc.frequency.setValueAtTime(2000 - (i * 150), audioContext.currentTime);

                gain.gain.setValueAtTime(0.04, audioContext.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2);

                osc.connect(gain);
                gain.connect(audioContext.destination);
                osc.start(audioContext.currentTime);
                osc.stop(audioContext.currentTime + 0.2);
              }, i * 100);
            }
            break;

          case 'static_burst':
            const bufferSize = audioContext.sampleRate * 0.1;
            const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
            const data = buffer.getChannelData(0);

            for (let i = 0; i < bufferSize; i++) {
              data[i] = (Math.random() * 2 - 1) * 0.1;
            }

            const source = audioContext.createBufferSource();
            const gain = audioContext.createGain();

            source.buffer = buffer;
            gain.gain.setValueAtTime(0.3, audioContext.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);

            source.connect(gain);
            gain.connect(audioContext.destination);
            source.start(audioContext.currentTime);
            break;

          default:
            // Default glitch effect
            const oscDefault = audioContext.createOscillator();
            const gainDefault = audioContext.createGain();

            oscDefault.type = 'square';
            oscDefault.frequency.setValueAtTime(800, audioContext.currentTime);
            oscDefault.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.3);

            gainDefault.gain.setValueAtTime(0.08, audioContext.currentTime);
            gainDefault.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);

            oscDefault.connect(gainDefault);
            gainDefault.connect(audioContext.destination);

            oscDefault.start(audioContext.currentTime);
            oscDefault.stop(audioContext.currentTime + 0.3);
        }
      };

      playEffect();
    } catch (error) {
      console.error("Error playing anomaly effect:", error);
    }
  }, [audioContext, audioEnabled, ensureContext]);

  const playMissionControlBeep = useCallback(async () => {
    if (!audioEnabled || !audioContext) return;
    await ensureContext();

    try {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, audioContext.currentTime);

      gain.gain.setValueAtTime(0.1, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2);

      osc.connect(gain);
      gain.connect(audioContext.destination);
      osc.start(audioContext.currentTime);
      osc.stop(audioContext.currentTime + 0.2);
    } catch (error) {
      console.error("Error playing mission control beep:", error);
    }
  }, [audioContext, audioEnabled, ensureContext]);

  const playSystemAlert = useCallback(async (alertType = 'warning') => {
    if (!audioEnabled || !audioContext) return;
    await ensureContext();

    try {
      const frequencies = {
        warning: [800, 600],
        critical: [1000, 500],
        success: [600, 800],
        error: [400, 300]
      };

      const freqs = frequencies[alertType] || frequencies.warning;

      freqs.forEach((freq, index) => {
        setTimeout(() => {
          const osc = audioContext.createOscillator();
          const gain = audioContext.createGain();

          osc.type = 'square';
          osc.frequency.setValueAtTime(freq, audioContext.currentTime);

          gain.gain.setValueAtTime(0.05, audioContext.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.15);

          osc.connect(gain);
          gain.connect(audioContext.destination);
          osc.start(audioContext.currentTime);
          osc.stop(audioContext.currentTime + 0.15);
        }, index * 200);
      });
    } catch (error) {
      console.error("Error playing system alert:", error);
    }
  }, [audioContext, audioEnabled, ensureContext]);

  // Copy-to-clipboard handler
  const handleCopyFlag = async (flag) => {
    try {
      await navigator.clipboard.writeText(flag);
      alert("Flag copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy flag:", err);
    }
  };

  // Backend connection function for flag retrieval
  const fetchEndingFlag = async () => {
    if (flagLoading || capturedFlag) return;
    
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
        path: '/root/vault/pleasedont.exe',
        user: 'player',
        passkey: 'forensics_expert',
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

        <SkipPrompt 
          canSkip={canShowSkipPrompt} 
          skipPressed={skipPressed} 
          isTyping={isTyping} 
        />

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