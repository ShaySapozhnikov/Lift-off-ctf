import { useEffect, useRef, useState } from "react";

// Replace localhost with your Render-hosted backend
const BACKEND_URL = "https://lift-off-ctf.onrender.com";

// Generate unique session ID for each user
const generateSessionId = () => {
  return 'user_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now().toString(36);
};

// Cookie helpers
const setCookie = (name, value, days = 30) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
};

const getCookie = (name) => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

export default function Prompt({ onEvent, playTypingSound, audioEnabled, onAudioInit }) {
  const [buf, setBuf] = useState("");
  const [history, setHistory] = useState([]);
  const [commands, setCommands] = useState([]);
  const [cursor, setCursor] = useState(0);
  const [cwd, setCwd] = useState(["/"]);
  const [currentUser, setCurrentUser] = useState("user");
  const [sessionId] = useState(generateSessionId());
  const [isLoading, setIsLoading] = useState(false);
  
  // Level system state
  const [userPasskeys, setUserPasskeys] = useState([]);
  const [userLevel, setUserLevel] = useState(1);
  const [userFlags, setUserFlags] = useState([]);
  
  const inputRef = useRef(null);

  useEffect(() => inputRef.current?.focus(), []);
  useEffect(() => inputRef.current?.focus(), [history]);
  useEffect(() => setCursor(commands.length), [commands]);

  // Load user progress from cookies on startup
  useEffect(() => {
    const savedPasskeys = getCookie('ctf_passkeys');
    const savedFlags = getCookie('ctf_flags');
    const savedUser = getCookie('ctf_user');
    
    if (savedPasskeys) {
      const passkeys = JSON.parse(savedPasskeys);
      setUserPasskeys(passkeys);
      updateUserLevel(passkeys);
    }
    
    if (savedFlags) {
      setUserFlags(JSON.parse(savedFlags));
    }
    
    if (savedUser) {
      setCurrentUser(savedUser);
    }

    const welcomeMessages = [
      "=== DEEP SPACE VESSEL UNHACKABLE - TERMINAL ACCESS ===",
      `Session ID: ${sessionId}`,
      "",
      "Type 'help' for available commands.",
      "Type 'level' to check your current access level.",
      "Begin your investigation with 'cat mission_briefing.txt'",
      ""
    ];
    setHistory(welcomeMessages);
  }, [sessionId]);

  // Save progress to cookies whenever it changes
  useEffect(() => {
    setCookie('ctf_passkeys', JSON.stringify(userPasskeys));
    setCookie('ctf_user', currentUser);
  }, [userPasskeys, currentUser]);

  useEffect(() => {
    setCookie('ctf_flags', JSON.stringify(userFlags));
  }, [userFlags]);

  // Update user level based on passkeys
  const updateUserLevel = (passkeys) => {
    let level = 1;
    if (passkeys.includes("crypto_master")) level = 2;
    if (passkeys.includes("reverse_engineer")) level = 3;
    setUserLevel(level);
  };

  // Add passkey when earned
  const addPasskey = (passkey) => {
    if (!userPasskeys.includes(passkey)) {
      const newPasskeys = [...userPasskeys, passkey];
      setUserPasskeys(newPasskeys);
      updateUserLevel(newPasskeys);
      return true;
    }
    return false;
  };

  // Add flag when earned
  const addFlag = (flag) => {
    if (!userFlags.includes(flag)) {
      setUserFlags(prev => [...prev, flag]);
      return true;
    }
    return false;
  };

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
      session_id: sessionId,
      userPasskeys: userPasskeys.join(','),
      ...additionalParams
    });
    return params;
  };

  // Build proper request body for POST requests
  const buildRequestBody = (additionalData = {}) => {
    return {
      user: currentUser,
      session_id: sessionId,
      userPasskeys,
      userFlags,
      ...additionalData
    };
  };

  // --- API Calls ---
  const lsDir = async (path) => {
    try {
      setIsLoading(true);
      const params = buildQueryParams({ path });

      const res = await fetch(`${BACKEND_URL}/ls?${params}`);
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: "Unknown error" }));
        return [`Error: ${errorData.error || "Access denied"}`, 
                ...(errorData.hint ? [`Hint: ${errorData.hint}`] : [])];
      }
      
      const data = await res.json();
      
      if (Array.isArray(data.files) && data.files.length > 0) {
        const output = [`Directory Level: ${data.directory_level} | Your Level: ${data.user_level}`, ""];
        
        data.files.forEach(file => {
          let indicator = "";
          if (file.type === "directory") indicator = "/";
          if (file.level > userLevel) indicator += " [LEVEL LOCKED]";
          
          output.push(`${file.name}${indicator}`);
        });
        
        return output.length > 2 ? output : ["Directory is empty"];
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
        return [`Error: ${errorData.error || "Access denied"}`,
                ...(errorData.hint ? [`Hint: ${errorData.hint}`] : [])];
      }
      
      const data = await res.json();
      
      const output = [data.content];
      
      // Show level info if available
      if (data.level) {
        output.push("", `File Level: ${data.level}`);
      }
      
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
      
      return output;
    } catch (e) {
      console.error("Network error in catFile:", e);
      return [`Network error: ${e.message}`];
    } finally {
      setIsLoading(false);
    }
  };

  const runFileAPI = async (path, passkey = undefined) => {
    try {
      setIsLoading(true);
      const requestBody = buildRequestBody({ path });
      
      if (passkey !== undefined) requestBody.passkey = passkey;

      const res = await fetch(`${BACKEND_URL}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: "Access denied" }));
        return [`Error: ${errorData.error || "Access denied"}`,
                ...(errorData.hint ? [`Hint: ${errorData.hint}`] : [])];
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

      // Handle new flags
      if (data.new_flags && Array.isArray(data.new_flags)) {
        data.new_flags.forEach(flag => {
          if (addFlag(flag)) {
            console.log("New flag earned:", flag);
          }
        });
      }

      // Handle individual flags
      if (data.flag && addFlag(data.flag)) {
        console.log("Flag earned:", data.flag);
      }
      if (data.master_flag && addFlag(data.master_flag)) {
        console.log("Master flag earned:", data.master_flag);
      }

      const output = [data.output];
      
      // Handle story progression
      if (data.story_progression) {
        output.push("", `Story: ${data.story_progression}`);
      }
      
      if (data.story_conclusion) {
        output.push("", `${data.story_conclusion}`);
      }

      // Handle level hints
      if (data.level_hint) {
        output.push("", `Level Progress: ${data.level_hint}`);
      }

      return output;
    } catch (e) {
      console.error("Network error in runFileAPI:", e);
      return [`Network error: ${e.message}`];
    } finally {
      setIsLoading(false);
    }
  };

  const checkLevel = async () => {
    try {
      const params = buildQueryParams();
      const res = await fetch(`${BACKEND_URL}/level?${params}`);
      const data = await res.json();
      return data;
    } catch (e) {
      return { error: e.message };
    }
  };

  // --- Commands ---
  const commandsMap = {
    help: async () => [
      "=== TERMINAL COMMANDS ===",
      "",
      "  help            - Show this help message",
      "  ls              - List directory contents", 
      "  cd <dir>        - Change directory",
      "  cat <file>      - Display file contents",
      "  run <file> [passkey] - Execute a file",
      "  level           - Check your current access level",
      "  passkey <key>   - Add a passkey to unlock new levels",
      "  clear           - Clear the terminal screen",
      "",
    ],
    ls: async ({ cwd }) => {
      const result = await lsDir(cwd.join("/"));
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
      const passkey = args[1]; // Optional passkey parameter
      
      return await runFileAPI(path, passkey);
    },
    level: async () => {
      const levelData = await checkLevel();
      if (levelData.error) {
        return [`Error checking level: ${levelData.error}`];
      }
      
      const output = [
        `Current Level: ${levelData.level}`,
        
      ];
      
      return output;
    },
    passkey: async ({ args }) => {
      if (!args[0]) return ["passkey: missing passkey argument", "Usage: passkey <key>"];
      
      const key = args[0];
      
      // Check if we already have this passkey
      if (userPasskeys.includes(key)) {
        return [`Passkey '${key}' already in your collection.`];
      }
      
      try {
        setIsLoading(true);
        
        // Validate passkey using the backend endpoint
        const params = new URLSearchParams({ passkey: key });
        const res = await fetch(`${BACKEND_URL}/validate-passkey?${params}`);
        
        if (!res.ok) {
          return [`Error validating passkey: ${res.status}`];
        }
        
        const data = await res.json();
        
        if (data.valid) {
          if (addPasskey(key)) {
            const newLevel = data.level_unlock || userLevel;
            return [
              `Passkey '${key}' validated and added!`,
              `New access level: ${newLevel}`,
              "Use 'level' command to see updated access permissions."
            ];
          }
        } else {
          return [
            `Invalid passkey: '${key}'`,
            "Hint: Look for clues in encrypted files, decoded messages, or system logs."
          ];
        }
      } catch (e) {
        console.error("Network error validating passkey:", e);
        return [`Network error validating passkey: ${e.message}`];
      } finally {
        setIsLoading(false);
      }
    },
       
    clear: async ({ setHistory }) => {
      setHistory([]);
      return [];
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
        setHistory, // Pass setHistory to commands that need it
      });
      if (out && out.length) setHistory((h) => [...h, ...out]);
    } else {
      setHistory((h) => [...h, `command not found: ${cmd}`, "Type 'help' for available commands"]);
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
          {currentUser}@unhackable:{cwd.join("/")}&gt;
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
        User: <span className="text-blue-400">{currentUser}</span> |
        Level: <span className="text-green-400">{userLevel}</span> |
        Session: <span className="text-gray-400">{sessionId.substring(0, 8)}...</span>
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