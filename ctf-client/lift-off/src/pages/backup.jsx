import React, { useState } from "react";

function Backup() {
  const [locked, setLocked] = useState(true); // Toggle this to test

  return (
    <>
      <div
        className={`fixed inset-0 z-50 bg-black transition-opacity duration-300 ${
          locked ? "bg-opacity-80" : "bg-opacity-0 pointer-events-none"
        } flex flex-col items-center justify-center`}
      >
        {locked && (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 50 50"
              className="w-24 h-24 text-white fill-current"
            >
              <path d="M25 3C18.363281 3 13 8.363281 13 15L13 20L9 20C7.355469 20 6 21.355469 6 23L6 47C6 48.644531 7.355469 50 9 50L41 50C42.644531 50 44 48.644531 44 47L44 23C44 21.355469 42.644531 20 41 20L37 20L37 15C37 8.363281 31.636719 3 25 3ZM25 5C30.566406 5 35 9.433594 35 15L35 20L15 20L15 15C15 9.433594 19.433594 5 25 5ZM9 22L41 22C41.554688 22 42 22.445313 42 23L42 47C42 47.554688 41.554688 48 41 48L9 48C8.445313 48 8 47.554688 8 47L8 23C8 22.445313 8.445313 22 9 22ZM25 30C23.300781 30 22 31.300781 22 33C22 33.898438 22.398438 34.6875 23 35.1875L23 38C23 39.101563 23.898438 40 25 40C26.101563 40 27 39.101563 27 38L27 35.1875C27.601563 34.6875 28 33.898438 28 33C28 31.300781 26.699219 30 25 30Z" />
            </svg>
            <input className="rounded text-black mt-10" type="password" />
          </>
        )}
      </div>

      
      <div className="relative z-10 flex flex-col items-center justify-center">
        <h1>BackUp</h1>
        <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">
          backup
        </button>
      </div>
    </>
  );
}

export default Backup;
