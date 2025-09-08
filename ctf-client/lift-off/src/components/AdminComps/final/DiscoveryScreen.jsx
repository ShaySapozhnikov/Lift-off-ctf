import React from 'react';

export default function DiscoveryScreen({ onDiscovery }) {
  return (
    <div className="w-full h-full bg-zinc-900 text-amber-100 font-mono flex items-center justify-center">
      <div className="text-center">
        <div className="text-sm mb-4">
          CRITICAL ANOMALY DETECTED...
        </div>
        <div className="text-xs mb-6 text-amber-100/70">
          CORE SYSTEM INTELLIGENCE IDENTIFIED
        </div>
        <button 
          onClick={onDiscovery}
          className="bg-zinc-900 border border-amber-100 px-6 py-2 text-amber-100 hover:bg-amber-100 hover:text-zinc-900 transition-colors"
        >
          ESTABLISH COMMUNICATION
        </button>
      </div>
    </div>
  );
}