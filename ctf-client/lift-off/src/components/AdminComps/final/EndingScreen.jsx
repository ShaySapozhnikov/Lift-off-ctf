import React, { useRef, useEffect } from 'react';

export default function EndingScreen({ ending, onRestart }) {
  const dialogueRef = useRef();

  useEffect(() => {
    if (dialogueRef.current) {
      dialogueRef.current.scrollTop = dialogueRef.current.scrollHeight;
    }
  }, []);

  const getLineStyle = (line, index) => {
    if (line.startsWith('MISSION CONTROL:')) {
      return 'text-green-400 font-bold';
    }
    if (line === '...') {
      return 'h-4';
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
          {ending.text.map((line, index) => (
            <div 
              key={index} 
              className={getLineStyle(line, index)}
              style={{
                animationDelay: `${index * 0.2}s`
              }}
            >
              {line}
            </div>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <button
            onClick={onRestart}
            className="bg-zinc-900 border border-amber-400 px-8 py-3 text-amber-400 hover:bg-amber-400 hover:text-zinc-900 transition-colors font-bold"
          >
            RESTART ENCOUNTER
          </button>
          <div className="mt-2 text-xs text-amber-100/50">
            Return to anomaly discovery phase
          </div>
        </div>
      </div>
    </div>
  );
}