// src/Public.jsx
import React from "react";
import { SpeedInsights } from "@vercel/speed-insights/next";

export default function Public() {
  return (
    <div className="p-8 bg-zinc-900 text-white min-h-screen">
      <SpeedInsights />
      <h1 className="text-3xl mb-6">LIFT OFF - Public Files</h1>
      <ul>
        <li>
          <a
            href="/backup.jsx"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 hover:underline"
          >
            backup.jsx
          </a>
        </li>
      </ul>
    </div>
  );
}
