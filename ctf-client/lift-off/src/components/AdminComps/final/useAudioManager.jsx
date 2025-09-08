import { useCallback } from 'react';

export function useAudioManager(audioContext, audioEnabled) {
  const playTypewriterSound = useCallback((anomalyMood = 'curious') => {
    if (!audioEnabled || !audioContext) return;
    
    try {
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }
      
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      
      const frequency = 1000 + Math.random() * 500;
      const volume = anomalyMood === 'manic' ? 0.05 : anomalyMood === 'angry' ? 0.06 : 0.03;
      
      osc.frequency.setValueAtTime(frequency, audioContext.currentTime);
      gain.gain.setValueAtTime(volume, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.05);
      
      osc.connect(gain);
      gain.connect(audioContext.destination);
      osc.start(audioContext.currentTime);
      osc.stop(audioContext.currentTime + 0.05);
      
    } catch (error) {
      console.error("Error playing typewriter sound:", error);
    }
  }, [audioContext, audioEnabled]);

  return { playTypewriterSound };
}