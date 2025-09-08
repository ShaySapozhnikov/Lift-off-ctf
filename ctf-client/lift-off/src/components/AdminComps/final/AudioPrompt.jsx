import React from 'react';

export default function AudioPrompt({ onEnable, onSkip }) {
  return (
    <div className="w-full h-full bg-zinc-900 text-amber-100 font-mono flex items-center justify-center">
      <div className="text-center p-8 border border-amber-100/30 bg-zinc-900">
        <div className="text-sm mb-4">AUDIO SUBSYSTEM DETECTED</div>
        <div className="text-xs mb-6 text-amber-100/70">
          Enable audio for enhanced terminal experience?
        </div>
        <div className="flex gap-4 justify-center">
          <button 
            onClick={onEnable}
            className="bg-zinc-900 border border-green-400 px-4 py-2 text-green-400 hover:bg-green-400 hover:text-zinc-900 transition-colors"
          >
            ENABLE AUDIO
          </button>
          <button 
            onClick={onSkip}
            className="bg-zinc-900 border border-red-400 px-4 py-2 text-red-400 hover:bg-red-400 hover:text-zinc-900 transition-colors"
          >
            SKIP
          </button>
        </div>
      </div>
    </div>
  );
}