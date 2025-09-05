import React from "react";
import { Link } from "react-router-dom";

function FlagIcon() {
  return (
    <Link
      to="/flags"
      className="absolute top-9 left-8 group"
    >
      <div className="w-12 h-12 bg-transparent border-2 border-dotted border-zinc-700 rounded-full flex items-center justify-center transition-all duration-300 group">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-6 h-6 text-white group-hover:text-amber-300 group-hover:drop-shadow-[0_0_8px_rgba(251,191,36,0.8)] group-hover:scale-110 transition-all duration-300"
        >
          <path d="M4 4v16h2v-6h5l1 2h8V6h-7l-1-2H4z"/>
        </svg>
      </div>
    </Link>
  );
}

export default FlagIcon;