import { useCallback } from 'react';
//need fixing!
export function useAudioManager(audioContext, audioEnabled) {
  // helper to make sure context is active before playing any sound
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

  const playTypewriterSound = useCallback(async (anomalyMood = 'curious') => {
    if (!audioEnabled || !audioContext) return;
    await ensureContext();

    try {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();

      const frequency = 1000 + Math.random() * 500;
      const volume =
        anomalyMood === 'manic' ? 0.05 :
        anomalyMood === 'angry' ? 0.06 : 0.03;

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
  }, [audioContext, audioEnabled, ensureContext]);

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
      switch (effectType) {
        case 'glitch': playGlitchEffect(); break;
        case 'digital_scream': playDigitalScream(); break;
        case 'system_surge': playSystemSurge(); break;
        case 'consciousness_merge': playConsciousnessMerge(); break;
        case 'cascade_failure': playCascadeFailure(); break;
        case 'static_burst': playStaticBurst(); break;
        default: playGlitchEffect();
      }
    } catch (error) {
      console.error("Error playing anomaly effect:", error);
    }
  }, [audioContext, audioEnabled, ensureContext]);

  const playGlitchEffect = useCallback(() => {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();

    osc.type = 'square';
    osc.frequency.setValueAtTime(800, audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.3);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2000, audioContext.currentTime);
    filter.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.3);

    gain.gain.setValueAtTime(0.08, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(audioContext.destination);

    osc.start(audioContext.currentTime);
    osc.stop(audioContext.currentTime + 0.3);
  }, [audioContext]);

  const playDigitalScream = useCallback(() => {
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
  }, [audioContext]);

  const playSystemSurge = useCallback(() => {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(60, audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, audioContext.currentTime + 0.5);

    gain.gain.setValueAtTime(0.05, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5);

    osc.connect(gain);
    gain.connect(audioContext.destination);
    osc.start(audioContext.currentTime);
    osc.stop(audioContext.currentTime + 0.5);
  }, [audioContext]);

  const playConsciousnessMerge = useCallback(() => {
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
  }, [audioContext]);

  const playCascadeFailure = useCallback(() => {
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
  }, [audioContext]);

  const playStaticBurst = useCallback(() => {
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
  }, [audioContext]);

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

  return { 
    playTypewriterSound,
    playCharacterTypewriter,
    playAnomalyEffect,
    playMissionControlBeep,
    playSystemAlert
  };
}
