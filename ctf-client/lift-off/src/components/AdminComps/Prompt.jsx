import { useEffect, useRef, useState } from "react";

// Replace localhost with your Render-hosted backend
const BACKEND_URL = "https://lift-off-ctf.onrender.com";

// Generate unique session ID for each user
const generateSessionId = () => {
  return 'user_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now().toString(36);
};

// Simplified cookie-based progress management functions
const loadProgressFromCookie = () => {
  try {
    const cookieData = document.cookie
      .split('; ')
      .find(row => row.startsWith('ctf_progress='));
    
    if (cookieData) {
      const progress = JSON.parse(decodeURIComponent(cookieData.split('=')[1]));
      
      // Ensure all required fields exist with proper defaults
      return {
        session_id: progress.session_id || generateSessionId(),
        flags_collected: Array.isArray(progress.flags_collected) ? progress.flags_collected : [],
        challenges_solved: Array.isArray(progress.challenges_solved) ? progress.challenges_solved : [],
        total_flags: progress.total_flags || 0,
        total_challenges: progress.total_challenges || 0,
        last_updated: progress.last_updated || Date.now()
      };
    }
  } catch (e) {
    console.error("Failed to load progress from cookie:", e);
  }
  
  // Default progress for new users
  return {
    session_id: generateSessionId(),
    flags_collected: [],
    challenges_solved: [],
    total_flags: 0,
    total_challenges: 0,
    last_updated: Date.now()
  };
};

const saveProgressToCookie = (progress) => {
  try {
    const progressWithTimestamp = {
      ...progress,
      last_updated: Date.now()
    };
    
    const cookieValue = encodeURIComponent(JSON.stringify(progressWithTimestamp));
    // Set cookie for 7 days with proper path and security
    document.cookie = `ctf_progress=${cookieValue}; path=/; max-age=${7*24*60*60}; SameSite=Lax`;
  } catch (e) {
    console.error("Failed to save progress to cookie:", e);
  }
};

export default function Prompt({ onEvent, playTypingSound, audioEnabled, onAudioInit }) {
  const [buf, setBuf] = useState("");
  const [history, setHistory] = useState([]);
  const [commands, setCommands] = useState([]);
  const [cursor, setCursor] = useState(0);
  const [cwd, setCwd] = useState(["/"]);
  const [currentUser, setCurrentUser] = useState("user");
  const [userProgress, setUserProgress] = useState(loadProgressFromCookie());
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => inputRef.current?.focus(), []);
  useEffect(() => inputRef.current?.focus(), [history]);
  useEffect(() => setCursor(commands.length), [commands]);

  // Load user progress on startup
  useEffect(() => {
    const progress = loadProgressFromCookie();
    setUserProgress(progress);
    
    // Show welcome message with actual progress
    const welcomeMessages = [
      "=== DEEP SPACE VESSEL UNHACKABLE - TERMINAL ACCESS ===",
      `Session ID: ${progress.session_id}`,
      "",
      `Flags Collected: ${progress.total_flags || 0}`,
      `Challenges Solved: ${progress.total_challenges || 0}`,
      "",
      "Type 'help' for available commands.",
      "Begin your investigation with 'cat mission_briefing.txt'",
      ""
    ];
    setHistory(welcomeMessages);
  }, []);

  // Sync progress changes to cookies
  useEffect(() => {
    if (userProgress.session_id) {
      saveProgressToCookie(userProgress);
    }
  }, [userProgress]);

  // --- Helper: resolve relative paths ---
  const resolvePath = (cwd, input) => {
    const parts = input.split("/").filter(Boolean);
    const newPath = [...cwd];
    parts.forEach((part) => {
      if (part === ".") return;
      if (part === "..") newPath.pop();
      else newPath.push(part);
    });
    if (newPath.length === 0) newPath.push("/");
    return newPath;
  };

  // Build proper query parameters for backend requests
  const buildQueryParams = (additionalParams = {}) => {
    const params = new URLSearchParams({
      user: currentUser,
      flags: JSON.stringify(userProgress.flags_collected || []),
      challenges: JSON.stringify(userProgress.challenges_solved || []),
      session_id: userProgress.session_id,
      ...additionalParams
    });
    return params;
  };

  // Build proper request body for POST requests
  const buildRequestBody = (additionalData = {}) => {
    return {
      user: currentUser,
      flags: JSON.stringify(userProgress.flags_collected || []),
      challenges: JSON.stringify(userProgress.challenges_solved || []),
      session_id: userProgress.session_id,
      ...additionalData
    };
  };

  // Check if file should be hidden
  const isHidden = (filename, node) => {
    return filename.startsWith('.') || (node && node.hidden);
  };

  // --- API Calls ---
  const lsDir = async (path, showHidden = false) => {
    try {
      setIsLoading(true);
      const params = buildQueryParams({
        path,
        showHidden: showHidden.toString()
      });

      const res = await fetch(`${BACKEND_URL}/ls?${params}`);
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: "Unknown error" }));
        return [`Error: ${errorData.error || "Access denied"}`];
      }
      
      const data = await res.json();
      
      if (Array.isArray(data.files) && data.files.length > 0) {
        const output = [];
        
        data.files.forEach(file => {
          let indicator = "";
          if (file.type === "directory") indicator = "/";
          
          // Show lock status for inaccessible files
          if (file.locked) {
            indicator += " [ACCESS DENIED]";
          } else if (file.passkey_required) {
            indicator += " [PASSKEY REQUIRED]";
          }
          
          output.push(`${file.name}${indicator}`);
        });
        
        return output.length > 0 ? output : ["Directory is empty"];
      } else {
        return ["Directory is empty"];
      }
    } catch (e) {
      console.error("Network error in lsDir:", e);
      return [`Network error: ${e.message}`];
    } finally {
      setIsLoading(false);
    }
  };

  const catFile = async (path) => {
    try {
      setIsLoading(true);
      const params = buildQueryParams({ path });

      const res = await fetch(`${BACKEND_URL}/file?${params}`);
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: "Access denied" }));
        return [`Error: ${errorData.error || "Access denied"}`];
      }
      
      const data = await res.json();
      
      const output = [data.content];
      
      // Show metadata if available
      if (data.metadata) {
        output.push("", "=== METADATA ===");
        Object.entries(data.metadata).forEach(([key, value]) => {
          output.push(`${key}: ${value}`);
        });
      }
      
      // Show hint if available
      if (data.hint) {
        output.push("", `Hint: ${data.hint}`);
      }
      
      // Show available flags
      if (data.flags_available && data.flags_available.length > 0) {
        output.push("", "Flags available in this file:");
        data.flags_available.forEach(flag => output.push(`   ${flag}`));
      }
      
      return output;
    } catch (e) {
      console.error("Network error in catFile:", e);
      return [`Network error: ${e.message}`];
    } finally {
      setIsLoading(false);
    }
  };

  const runFileAPI = async (path, score = undefined, passkey = undefined, aiChoice = undefined) => {
    try {
      setIsLoading(true);
      const requestBody = buildRequestBody({ path });
      
      if (score !== undefined) requestBody.score = score;
      if (passkey !== undefined) requestBody.passkey = passkey;
      if (aiChoice !== undefined) requestBody.aiChoice = aiChoice;

      const res = await fetch(`${BACKEND_URL}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: "Access denied" }));
        return [`Error: ${errorData.error || "Access denied"}`];
      }
      
      const data = await res.json();

      // Handle events
      if (data.event && typeof onEvent === "function") {
        console.log("Backend returned event:", data.event);
        onEvent(data.event);
      }

      // Handle privilege escalation
      if (data.output === "exploit" || data.output?.includes("ROOT ACCESS GRANTED")) {
        setCurrentUser("root");
      }

      const output = [data.output];
      
      // Handle flags and update progress (silently)
      if (data.flag) {
        const updatedProgress = {
          ...userProgress,
          flags_collected: [...(userProgress.flags_collected || []), data.flag],
          total_flags: (userProgress.total_flags || 0) + 1
        };
        
        setUserProgress(updatedProgress);
        // Don't display flag capture message
      }
      
      if (data.master_flag) {
        const updatedProgress = {
          ...userProgress,
          flags_collected: [...(userProgress.flags_collected || []), data.master_flag],
          total_flags: (userProgress.total_flags || 0) + 1
        };
        setUserProgress(updatedProgress);
        // Don't display master flag message
      }
      
      // Handle story progression
      if (data.story_progression) {
        output.push("", `Story: ${data.story_progression}`);
      }
      
      if (data.story_conclusion) {
        output.push("", `${data.story_conclusion}`);
      }

      return output;
    } catch (e) {
      console.error("Network error in runFileAPI:", e);
      return [`Network error: ${e.message}`];
    } finally {
      setIsLoading(false);
    }
  };
  
  const solveChallengeAPI = async (challenge, solution) => {
    try {
      setIsLoading(true);
      const requestBody = buildRequestBody({ 
        challenge, 
        solution
      });

      const res = await fetch(`${BACKEND_URL}/solve-challenge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
      
      const data = await res.json();
      
      const output = [data.message];
      
      if (data.success && data.flag) {
        // Update local progress with new flag
        const updatedProgress = {
          ...userProgress,
          flags_collected: [...(userProgress.flags_collected || []), data.flag],
          challenges_solved: [...(userProgress.challenges_solved || []), challenge],
          total_flags: (userProgress.total_flags || 0) + 1,
          total_challenges: (userProgress.total_challenges || 0) + 1
        };
        
        setUserProgress(updatedProgress);
        
        output.push(`FLAG CAPTURED: ${data.flag}`);
      }
      
      if (data.hint) {
        output.push("", `HINT: ${data.hint}`);
      }
      
      return output;
    } catch (e) {
      console.error("Network error in solveChallengeAPI:", e);
      return [`Network error: ${e.message}`];
    } finally {
      setIsLoading(false);
    }
  };

  // Expose functions for games to submit scores
  window.submitGameScore = async (gamePath, score) => {
    const result = await runFileAPI(gamePath, score);
    if (result && result.length) {
      setHistory((h) => [...h, ...result]);
    }
  };

  // --- Commands ---
  const commandsMap = {
    help: async () => [
      "=== UNHACKABLE VESSEL TERMINAL COMMANDS ===",
      "",
      "NAVIGATION:",
      "  help            - Show this help message",
      "  ls [-a]         - List directory contents (-a shows hidden)",
      "  cd <dir>        - Change directory",
      "  pwd             - Show current directory",
      "  find <query>    - Search for files containing text",
      "",
      "FILE OPERATIONS:", 
      "  cat <file>      - Display file contents",
      "  run <file>      - Execute a file",
      "  strings <file>  - Extract strings from binary files",
      "  hexdump <file>  - Show hex dump of file",
      "",
      "CHALLENGE SOLVING:",
      "  solve <challenge> <solution> - Submit solution to challenge",
      "  decode <type> <data>         - Decode various formats",
      "  progress                     - Show your current progress",
      "",
      "SYSTEM:",
      "  clear      - Clear screen",
      "  whoami     - Show current user", 
      "  su <user>  - Switch user (if you have credentials)",
      "  session    - Show session information",
      "",
      "CHALLENGE FILES:",
      "  2nak3.bat       - Consciousness Simulation Game",
      "  LEAVE.bat       - Digital Interface Challenge", 
      "  pleasedont.exe  - Final Confrontation",
      "",
      "START HERE: cat mission_briefing.txt",
    ],
    clear: async ({ clear }) => {
      clear();
      return [];
    },
    pwd: async ({ cwd }) => [cwd.join("/")],
    pwd: async ({ cwd }) => [cwd.join("/")],
    whoami: async () => [`Current user: ${currentUser}`],
    session: async () => [
      `Session ID: ${userProgress.session_id}`,
      `Started: ${new Date(userProgress.last_updated).toLocaleString()}`,
      `Current user: ${currentUser}`
    ],
    progress: async () => {
      const output = [
        "=== MISSION PROGRESS ===",
        "",
        `Session ID: ${userProgress.session_id}`,
        `Current User: ${currentUser}`,
        `Flags Collected: ${userProgress.total_flags || 0}`,
        `Challenges Solved: ${userProgress.total_challenges || 0}`
      ];
      
      if (userProgress.flags_collected && userProgress.flags_collected.length > 0) {
        output.push("", "FLAGS COLLECTED:");
        userProgress.flags_collected.forEach(flag => {
          output.push(`  ${flag}`);
        });
      }
      
      return output;
    },
    ls: async ({ cwd, args }) => {
      const showHidden = args.includes("-a") || args.includes("--all");
      const result = await lsDir(cwd.join("/"), showHidden);
      return ["", ...result, ""];
    },
    cd: async ({ cwd, args, setCwd }) => {
      if (!args[0]) return [];
      const newPath = resolvePath(cwd, args[0]);
      
      const dirCheck = await lsDir(newPath.join("/"));
      if (dirCheck[0]?.startsWith("Error") || dirCheck[0]?.startsWith("Access denied")) {
        return [`cd: cannot access '${args[0]}': ${dirCheck[0].replace("Error: ", "")}`];
      }
      setCwd(newPath);
      return [`Changed directory to: ${newPath.join("/")}`];
    },
    cat: async ({ cwd, args }) => {
      if (!args[0]) return ["cat: missing filename"];
      const path = resolvePath(cwd, args[0]).join("/");
      return await catFile(path);
    },
    run: async ({ cwd, args }) => {
      if (!args[0]) return ["run: missing filename"];
      const path = resolvePath(cwd, args[0]).join("/");
      const filename = args[0];
      
      // Handle special executables with passkey requirements
      if (filename === "2nak3.bat" || filename === "LEAVE.bat" || filename === "pleasedont.exe") {
        const passkey = args[1];
        if (!passkey) {
          return [
            `${filename} requires a passkey to execute`,
            `Usage: run ${filename} <passkey>`,
            "",
            "Find passkeys by solving challenges in:",
            "  • /home/user/crypto/ - cryptography puzzles",
            "  • /home/classified/reversing/ - reverse engineering", 
            "  • /root/anomaly_core/ - forensics challenges",
            "",
            "Hint: Passkeys are earned by mastering each skill domain"
          ];
        }
        return await runFileAPI(path, undefined, passkey);
      }
      
      return await runFileAPI(path);
    },
    solve: async ({ args }) => {
      if (args.length < 2) {
        return [
          "solve: Usage: solve <challenge> <solution>",
          "",
          "Available challenges:",
          "  caesar_cipher    - ROT13 encrypted message",
          "  base64_distress  - Base64 encoded transmission", 
          "  xor_challenge    - XOR encrypted data",
          "  metadata_hunter  - Find hidden metadata",
          "  steganography    - Hidden messages in images",
          "  reverse_engineer - Reverse engineering puzzle",
          "  assembly_code    - Assembly code analysis",
          "  forensics_analysis - Digital forensics"
        ];
      }
      
      const [challenge, ...solutionParts] = args;
      const solution = solutionParts.join(" ");
      
      return await solveChallengeAPI(challenge, solution);
    },
    decode: async ({ args }) => {
      if (args.length < 2) {
        return [
          "decode: Usage: decode <type> <data>",
          "",
          "Supported types:",
          "  base64   - Base64 decode",
          "  rot13    - ROT13 cipher", 
          "  hex      - Hex to ASCII",
          "  binary   - Binary to ASCII"
        ];
      }
      
      const [type, data] = args;
      
      try {
        let result;
        switch(type.toLowerCase()) {
          case "base64":
            result = atob(data);
            break;
          case "rot13":
            result = data.replace(/[A-Za-z]/g, char => 
              String.fromCharCode(char.charCodeAt(0) + (char.toLowerCase() < 'n' ? 13 : -13))
            );
            break;
          case "hex":
            result = data.replace(/([0-9A-F]{2})/gi, (match, hex) => 
              String.fromCharCode(parseInt(hex, 16))
            );
            break;
          case "binary":
            result = data.split(' ').map(bin => 
              String.fromCharCode(parseInt(bin, 2))
            ).join('');
            break;
          default:
            return [`decode: unsupported type '${type}'`];
        }
        return [`Decoded result: ${result}`];
      } catch (e) {
        return [`decode: error - ${e.message}`];
      }
    },
    find: async ({ args }) => {
      if (!args[0]) return ["find: missing search query"];
      
      try {
        setIsLoading(true);
        const params = buildQueryParams({ query: args[0] });
        
        const res = await fetch(`${BACKEND_URL}/search?${params}`);
        
        if (!res.ok) return [`Error: ${await res.text()}`];
        
        const data = await res.json();
        
        if (!data.results || data.results.length === 0) {
          return [`No files found containing: ${args[0]}`];
        }
        
        const output = [`Found ${data.results.length} results for '${args[0]}':`, ""];
        data.results.forEach(result => {
          output.push(`${result.path} (${result.type})`);
          if (result.content) {
            const snippet = result.content.substring(0, 100);
            output.push(`   ${snippet}${result.content.length > 100 ? '...' : ''}`);
          }
        });
        
        return output;
      } catch (e) {
        console.error("Network error in find:", e);
        return [`Network error: ${e.message}`];
      } finally {
        setIsLoading(false);
      }
    },
    su: async ({ args }) => {
      if (!args[0]) return ["su: missing username"];
      
      if (args[0] === "root") {
        // Simplified - just check if user has captured enough flags
        if (userProgress.flags_collected && userProgress.flags_collected.length >= 5) {
          setCurrentUser("root");
          return ["su: switched to root user"];
        } else {
          return [
            "su: root access requires sufficient privileges",
            "Hint: Complete more challenges to gain root access",
            `Current flags: ${userProgress.total_flags || 0}`
          ];
        }
      }
      
      return [`su: user '${args[0]}' not found`];
    },
    strings: async ({ cwd, args }) => {
      if (!args[0]) return ["strings: missing filename"];
      const path = resolvePath(cwd, args[0]).join("/");
      
      // This is a simplified version - in reality would extract strings from binary
      return [
        `Extracting strings from: ${path}`,
        "ASCII strings found:",
        "  'consciousness_check'",
        "  'digital_anomaly'", 
        "  'The Anomaly lives in binary'",
        "Use 'cat' for text files or 'run' for executables"
      ];
    },
    hexdump: async ({ cwd, args }) => {
      if (!args[0]) return ["hexdump: missing filename"];
      const path = resolvePath(cwd, args[0]).join("/");
      
      // Simplified hex dump simulation
      return [
        `Hex dump of: ${path}`,
        "00000000: 43544620 7b683378 5f64756d 705f6d34  CTF{h3x_dump_m4",  
        "00000010: 73743372 7d0a0000 00000000 00000000  st3r}...........",
        "00000020: 416e6f6d 616c7920 636f6e73 63696f75  Anomaly consciou",
        "00000030: 736e6573 73206461 74610000 00000000  sness data......",
        "",
        "Look for ASCII patterns and hidden flags in hex data"
      ];
    }
  };

  const onSubmit = async (value) => {
    const v = value.trim();
    if (!v) return;
    
    setHistory((h) => [...h, `${cwd.join("/")}> ${v}`]);
    setCommands((c) => [...c, v]);

    const [cmd, ...args] = v.split(/\s+/);
    
    const handler = commandsMap[cmd];
    if (handler) {
      const out = await handler({
        args,
        cwd,
        setCwd,
        clear: () => {
          setHistory([]);
          setCommands([]);
          setBuf("");
          setCursor(0);
          setCwd(["/"]);
        },
      });
      if (out && out.length) setHistory((h) => [...h, ...out]);
    } else {
      // Check for direct file execution
      if (cmd === "pleasedont.exe" || cmd === "./pleasedont.exe") {
        if (typeof onEvent === "function") {
          onEvent("aiConversation");
        }
        setHistory((h) => [...h, "Executing forbidden file...", "Establishing neural link with the Anomaly..."]);
      } else {
        setHistory((h) => [...h, `command not found: ${cmd}`, "Type 'help' for available commands"]);
      }
    }

    setBuf("");
  };

  // Enhanced input change handler with sound
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    
    // Initialize audio on first interaction if needed
    if (!audioEnabled && onAudioInit) {
      onAudioInit();
    }
    
    // Play typing sound for new characters only
    if (newValue.length > buf.length && playTypingSound) {
      playTypingSound(newValue.length - 1);
    }
    
    setBuf(newValue);
  };

  // --- Keyboard navigation ---
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onSubmit(buf);
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => {
        const next = Math.max(0, c - 1);
        setBuf(next < commands.length ? commands[next] : "");
        return next;
      });
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((c) => {
        const next = Math.min(commands.length, c + 1);
        setBuf(next === commands.length ? "" : commands[next]);
        return next;
      });
      return;
    }
  };

  return (
    <div className="w-full" onClick={() => inputRef.current?.focus()}>
      {/* Loading indicator */}
      {isLoading && (
        <div className="text-yellow-400 font-mono text-sm mb-2">
          Processing request...
        </div>
      )}

      {/* history */}
      <div className="space-y-0.5">
        {history.map((h, i) => (
          <div key={i} className="text-white/80 font-mono whitespace-pre-wrap">
            {h}
          </div>
        ))}
      </div>

      {/* prompt row */}
      <div className="flex items-center gap-2 pt-2 pb-2">
        <span className="text-amber-100/70 font-mono">
          {currentUser === "root" ? "[ROOT]" : "[USER]"} {currentUser}@unhackable:{cwd.join("/")}&gt;
        </span>
        <input
          ref={inputRef}
          value={buf}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="absolute opacity-0 pointer-events-none"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
          disabled={isLoading}
        />
        <TerminalInput value={buf} />
      </div>

      <div className="mt-1 text-white/50 font-mono text-sm">
        Flags: <span className="text-green-400">{userProgress.total_flags || 0}</span> | 
        User: <span className="text-blue-400">{currentUser}</span> |
        Session: <span className="text-purple-400">{userProgress.session_id?.substring(0, 8)}...</span>
      </div>
    </div>
  );
}

function TerminalInput({ value, isPassword }) {
  const [cursorOn, setCursorOn] = useState(true);
  useEffect(() => {
    const t = setInterval(() => setCursorOn((c) => !c), 550);
    return () => clearInterval(t);
  }, []);
  
  const displayValue = isPassword ? '*'.repeat(value.length) : value;
  
  return (
    <div 
      className="font-mono text-white/90 select-text cursor-text"
      style={{ userSelect: 'text', WebkitUserSelect: 'text' }}
    >
      <span className="select-text">{displayValue}</span>
      <span
        className={
          "ml-0.5 inline-block w-2 h-4 align-[-2px] select-none " +
          (cursorOn ? "bg-amber-100/80" : "bg-transparent border border-amber-100/30")
        }
      />
    </div>
  );
}