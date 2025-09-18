import React, { useState, useRef, useEffect } from "react";
import ShipIcon from "../components/shipIcon";
import { supabase } from '../singletonSupabase';


function Backup() {
  const [locked, setLocked] = useState(true);
  const [input, setInput] = useState("");
  const [invalid, setInvalid] = useState(false);
  const overlayRef = useRef(null);
  const backupGate = (() => {
    const encoded = [
      "cmVjb3ZlcnlfNDA0", 
      "YXV0bw==",        
      "aW5pdA==",        
      "Lg==",             
    ];
    const map = [1, 3, 2, 3, 0];
    return map.map(i => atob(encoded[i])).join("");
  })();
  const systemAccess = atob("YXV0by5zeXN0ZW0uY29yZV9i");   


  useEffect(() => {
    if (!locked) return;

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.removedNodes) {
          if (node === overlayRef.current) {
            console.warn("Lock screen removed — reloading...");
            window.location.reload();
          }
        }
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [locked]);

  const main = input === atob("YXV0by5kZWJ1Zy5lcnJvcl8wMDc="); 
  if (main) {
    console.warn("");
  }



  const handleKeyDown = (e) => {
    console.log("Password is:", backupGate);
    if (e.key === "Enter" && input.trim() !== "") {
      if (input === backupGate) {
        setLocked(false);
      } else {
        setInvalid(true);
        setTimeout(() => setInvalid(false), 2500);
      }
    }
  };

  const scriptContent = `
    const debugInfo = {
      meta: "This page was audited by Dillian. Looks fine!",
      backup_token: "YXV0b1xuLnJlY29uc3RydWN0X2JhY2t1cA==",
      note: "nothing to worry about."
    };
  `;

  const svgLock = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 50 50"
      className="w-24 h-24 fill-current"
    >
      <path d="M25 3C18.363281 3 13 8.363281 13 15L13 20L9 20C7.355469 20 6 21.355469 6 23L6 47C6 48.644531 7.355469 50 9 50L41 50C42.644531 50 44 48.644531 44 47L44 23C44 21.355469 42.644531 20 41 20L37 20L37 15C37 8.363281 31.636719 3 25 3ZM25 5C30.566406 5 35 9.433594 35 15L35 20L15 20L15 15C15 9.433594 19.433594 5 25 5ZM9 22L41 22C41.554688 22 42 22.445313 42 23L42 47C42 47.554688 41.554688 48 41 48L9 48C8.445313 48 8 47.554688 8 47L8 23C8 22.445313 8.445313 22 9 22ZM25 30C23.300781 30 22 31.300781 22 33C22 33.898438 22.398438 34.6875 23 35.1875L23 38C23 39.101563 23.898438 40 25 40C26.101563 40 27 39.101563 27 38L27 35.1875C27.601563 34.6875 28 33.898438 28 33C28 31.300781 26.699219 30 25 30Z" />
    </svg>
  );
  const adminOverride = atob("YWRtaW4ub3ZlcnJpZGVfMTIz"); 


  return (
    <>
      <div
        ref={overlayRef}
        className={`fixed inset-0 z-50 hue-rotate-270 bg-black transition-opacity duration-300 ${
          locked ? "bg-opacity-80" : "bg-opacity-0 pointer-events-none"
        } flex flex-col items-center justify-center`}
      >
        {locked && (
          <>
            <div className="relative w-24 h-24">
              {/* White Lock */}
              <div className="absolute top-0 left-0 text-white">{svgLock}</div>
              {/* Red Glitch */}
              <div
                className="absolute top-0 left-0 text-red-500 opacity-75 mix-blend-screen animate-glitch1"
                style={{ animationDelay: "-0.2s" }}
              >
                {svgLock}
              </div>
              {/* Blue Glitch */}
              <div
                className="absolute top-0 left-0 text-blue-500 opacity-75 mix-blend-screen animate-glitch2"
                style={{ animationDelay: "-0.4s" }}
              >
                {svgLock}
              </div>
              {/* Cyan Glitch */}
              <div
                className="absolute top-0 left-0 text-cyan-400 opacity-75 mix-blend-screen animate-glitch3"
                style={{ animationDelay: "-0.6s" }}
              >
                {svgLock}
              </div>
            </div>

            <input
              className="rounded text-black mt-10 px-2 py-1"
              type="password"
              value={input}
              placeholder="Enter password"
              onKeyDown={handleKeyDown}
              onChange={(e) => setInput(e.target.value)}
            />

            {invalid && (
              <h3 className="text-amber-100 mt-5">Error: Incorrect password</h3>
            )}
          </>
        )}
      </div>

      

  
      <p className="hidden" data-hint="auto.debug.mode_007">
        Diagnostic override failed.
      </p>

      {/* Main app UI when unlocked */}
      <div className="flex items-center justify-center min-h-screen">
        <div className="z-10 flex flex-col items-center justify-center mt-10">
          <ShipIcon />
          <h3>The unhackable backup installer V2.0</h3>

          <button
            className="mt-6 px-6 py-2 bg-zinc-900 text-white hover:text-amber-100 rounded border border-dashed mb-5"
            onClick={async () => {
              try {
                // Backup bucket
                const { data: files, error } = await supabase.storage
                  .from("Backup")
                  .list("", { limit: 1000 });

                if (error) {
                  console.error("Error listing files:", error.message);
                  return;
                }

                if (!files || files.length === 0) {
                  console.log("No files found in bucket.");
                  return;
                }

                console.log("Files found:", files.map(f => f.name));

                // Download each file using public URLs
                for (const file of files) {
                  try {
                    // Get public URL (no auth required since bucket is public)
                    const { data: publicUrlData } = supabase.storage
                      .from("Backup")
                      .getPublicUrl(file.name);

                    if (publicUrlData?.publicUrl) {
                      const link = document.createElement("a");
                      link.href = publicUrlData.publicUrl;
                      link.download = file.name;
                      link.target = '_blank'; // Fallback if download doesn't work
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      
                      // Small delay between downloads
                      await new Promise(resolve => setTimeout(resolve, 100));
                    } else {
                      console.error("No public URL returned for", file.name);
                    }
                  } catch (fileError) {
                    console.error(`Error downloading ${file.name}:`, fileError);
                  }
                }

                console.log("All files download initiated.");
              } catch (err) {
                console.error("Unexpected error:", err);
              }
            }}
          >
            Download All Backups
          </button>

        </div>
      </div>

      {/* Debug Info */}
      <script
        id="debug-info"
        type="text/plain"
        dangerouslySetInnerHTML={{ __html: scriptContent }}
      />
    </>
  );
}

export default Backup;