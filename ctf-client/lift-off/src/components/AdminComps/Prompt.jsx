import { useEffect, useRef, useState } from "react";

// Replace localhost with your Render-hosted backend
const BACKEND_URL = "https://lift-off-ctf.onrender.com";

export default function Prompt({ onEvent, playTypingSound, audioEnabled, onAudioInit }) {
  const [buf, setBuf] = useState("");
  const [history, setHistory] = useState([]);
  const [commands, setCommands] = useState([]);
  const [cursor, setCursor] = useState(0);
  const [cwd, setCwd] = useState(["/"]);
  const [currentUser, setCurrentUser] = useState("user");
  const [userProgress, setUserProgress] = useState({
    current_access_level: 1,
    flags_collected: [],
    challenges_solved: [],
    level1_unlocked: false,
    level2_unlocked: false,
    level3_unlocked: false
  });

  useEffect(() => inputRef.current?.focus(), []);
  useEffect(() => inputRef.current?.focus(), [history]);
  useEffect(() => setCursor(commands.length), [commands]);

  // Load user progress on startup
  useEffect(() => {
    loadUserProgress();
  }, []);

  const loadUserProgress = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/progress`);
      if (res.ok) {
        const progress = await res.json();
        setUserProgress(progress);
        
        // Show welcome message with progress
        const welcomeMessages = [
          "=== DEEP SPACE VESSEL UNHACKABLE - TERMINAL ACCESS ===",
          "",
          `Access Level: ${progress.current_access_level}/3`,
          `Flags Collected: ${progress.total_flags || 0}`,
          `Challenges Solved: ${progress.total_challenges || 0}`,
          "",
          "Type 'help' for available commands.",
          "Begin your investigation with 'cat mission_briefing.txt'",
          ""
        ];
        setHistory(welcomeMessages);
      }
    } catch (e) {
      console.error("Failed to load progress:", e);
    }
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

  // --- API Calls ---
  const lsDir = async (path, showHidden = false) => {
    try {
      const res = await fetch(
        `${BACKEND_URL}/ls?path=${encodeURIComponent(path)}&user=${currentUser}&showHidden=${showHidden}`
      );
      
      if (!res.ok) {
        const errorText = await res.text();
        return [`Error: ${errorText}`];
      }
      
      const data = await res.json();
      
      // Update progress if returned
      if (data.current_access_level) {
        setUserProgress(prev => ({
          ...prev,
          current_access_level: data.current_access_level,
          total_flags: data.flags_collected || prev.total_flags
        }));
      }
      
      if (Array.isArray(data.files) && data.files.length > 0) {
        const output = [];
        
        // Add access level info for directories with restrictions
        if (data.current_access_level) {
          output.push(`Access Level: ${data.current_access_level}/3`);
          output.push("");
        }
        
        data.files.forEach(file => {
          let indicator = "";
          if (file.type === "directory") indicator = "/";
          if (file.passkey_required) indicator += " [LOCKED]";
          if (file.locked) indicator += " [REQUIRES UNLOCK]";
          if (file.access_level > data.current_access_level) indicator += " [ACCESS DENIED]";
          
          output.push(`${file.name}${indicator}`);
        });
        
        return output.length ? output : ["Directory is empty"];
      } else {
        return ["Directory is empty"];
      }
    } catch (e) {
      return [`Network error: ${e.message}`];
    }
  };

  const catFile = async (path) => {
    try {
      const res = await fetch(
        `${BACKEND_URL}/file?path=${encodeURIComponent(path)}&user=${currentUser}`
      );
      
      if (!res.ok) {
        const errorText = await res.text();
        return [`Error: ${errorText}`];
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
        output.push("", `💡 Hint: ${data.hint}`);
      }
      
      // Show available flags
      if (data.flags_available && data.flags_available.length > 0) {
        output.push("", "🏁 Flags available in this file:");
        data.flags_available.forEach(flag => output.push(`   ${flag}`));
      }
      
      return output;
    } catch (e) {
      return [`Network error: ${e.message}`];
    }
  };

  const runFileAPI = async (path, score = undefined, passkey = undefined, aiChoice = undefined) => {
    try {
      const requestBody = { path, user: currentUser };
      
      if (score !== undefined) requestBody.score = score;
      if (passkey !== undefined) requestBody.passkey = passkey;
      if (aiChoice !== undefined) requestBody.aiChoice = aiChoice;

      const res = await fetch(`${BACKEND_URL}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        return [`Error: ${errorText}`];
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
      
      // Handle flags
      if (data.flag) {
        output.push(`🏁 FLAG CAPTURED: ${data.flag}`);
      }
      
      if (data.master_flag) {
        output.push(`👑 MASTER FLAG: ${data.master_flag}`);
      }
      
      // Handle story progression
      if (data.story_progression) {
        output.push("", `📖 Story: ${data.story_progression}`);
      }
      
      if (data.story_conclusion) {
        output.push("", `🎬 ${data.story_conclusion}`);
      }
      
      // Handle progress updates
      if (data.current_progress) {
        output.push("", `Progress: Level ${data.current_progress.level} | Flags: ${data.current_progress.flags} | Challenges: ${data.current_progress.challenges}`);
      }

      // Reload progress after successful execution
      await loadUserProgress();

      return output;
    } catch (e) {
      return [`Network error: ${e.message}`];
    }
  };

  const solveChallengeAPI = async (challenge, solution) => {
    try {
      const res = await fetch(`${BACKEND_URL}/solve-challenge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challenge, solution, user: currentUser }),
      });
      
      const data = await res.json();
      
      const output = [data.message];
      
      if (data.success && data.flag) {
        output.push(`🏁 FLAG CAPTURED: ${data.flag}`);
        
        if (data.next_level_unlocked && data.next_level_unlocked.length > 0) {
          output.push("", "🔓 NEW LEVEL UNLOCKED!");
          data.next_level_unlocked.forEach(level => {
            output.push(`   ${level} access granted!`);
          });
        }
        
        // Reload progress
        await loadUserProgress();
      }
      
      if (data.hint) {
        output.push("", `💡 Hint: ${data.hint}`);
      }
      
      return output;
    } catch (e) {
      return [`Network error: ${e.message}`];
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
      "",
      "CHALLENGE FILES:",
      "  2nak3.bat       - Level 1: Consciousness Simulation",
      "  LEAVE.bat       - Level 2: Digital Interface", 
      "  pleasedont.exe  - Level 3: Final Confrontation",
      "",
      "🎯 START HERE: cat mission_briefing.txt",
    ],
    clear: async ({ clear }) => {
      clear();
      return [];
    },
    pwd: async ({ cwd }) => [cwd.join("/")],
    whoami: async () => [`Current user: ${currentUser}`, `Access level: ${userProgress.current_access_level}/3`],
    progress: async () => {
      const output = [
        "=== MISSION PROGRESS ===",
        "",
        `Current User: ${currentUser}`,
        `Access Level: ${userProgress.current_access_level}/3`,
        `Flags Collected: ${userProgress.total_flags || 0}`,
        `Challenges Solved: ${userProgress.total_challenges || 0}`,
        "",
        "LEVEL STATUS:"
      ];
      
      output.push(`  Level 1 (Crypto): ${userProgress.level1_unlocked ? '✅ UNLOCKED' : '🔒 LOCKED'}`);
      output.push(`  Level 2 (Reverse): ${userProgress.level2_unlocked ? '✅ UNLOCKED' : '🔒 LOCKED'}`);
      output.push(`  Level 3 (Forensics): ${userProgress.level3_unlocked ? '✅ UNLOCKED' : '🔒 LOCKED'}`);
      
      if (userProgress.flags_collected && userProgress.flags_collected.length > 0) {
        output.push("", "FLAGS COLLECTED:");
        userProgress.flags_collected.forEach(flag => {
          output.push(`  🏁 ${flag}`);
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
      if (dirCheck[0]?.startsWith("Error")) {
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
      
      // Handle locked executables
      if (filename === "2nak3.bat" || filename === "LEAVE.bat" || filename === "pleasedont.exe") {
        const passkey = args[1];
        if (!passkey) {
          return [
            `⚠️  ${filename} requires a passkey to execute`,
            `Usage: run ${filename} <passkey>`,
            "",
            "Find passkeys by solving challenges in:",
            "  • /home/user/crypto/ - cryptography puzzles",
            "  • /home/classified/reversing/ - reverse engineering", 
            "  • /root/anomaly_core/ - forensics challenges",
            "",
            "💡 Hint: Passkeys are earned by mastering each skill domain"
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
          "  matrix_puzzle    - Number to letter conversion",
          "  binary_arithmetic - Binary operations",
          "  assembly_riddle  - Assembly code analysis",
          "  obfuscated_js    - JavaScript deobfuscation"
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
        const res = await fetch(
          `${BACKEND_URL}/search?query=${encodeURIComponent(args[0])}&user=${currentUser}`
        );
        
        if (!res.ok) return [`Error: ${await res.text()}`];
        
        const data = await res.json();
        
        if (!data.results || data.results.length === 0) {
          return [`No files found containing: ${args[0]}`];
        }
        
        const output = [`Found ${data.results.length} results for '${args[0]}':`, ""];
        data.results.forEach(result => {
          output.push(`📁 ${result.path} (${result.type})`);
          if (result.content) {
            const snippet = result.content.substring(0, 100);
            output.push(`   ${snippet}${result.content.length > 100 ? '...' : ''}`);
          }
        });
        
        return output;
      } catch (e) {
        return [`Network error: ${e.message}`];
      }
    },
    su: async ({ args }) => {
      if (!args[0]) return ["su: missing username"];
      
      if (args[0] === "root") {
        return [
          "su: root access requires privilege escalation",
          "💡 Hint: Look for SUID binaries or exploitable services",
          "Try: find / -perm -4000 2>/dev/null"
        ];
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
        "  'CTF{str1ngs_4n4lys1s}'",
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
        "💡 Look for ASCII patterns and hidden flags in hex data"
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
        setHistory((h) => [...h, "⚠️  Executing forbidden file...", "🤖 Establishing neural link with the Anomaly..."]);
      } else {
        setHistory((h) => [...h, `command not found: ${cmd}`, "💡 Type 'help' for available commands"]);
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
        />
        <TerminalInput value={buf} />
      </div>

      <div className="mt-1 text-white/50 font-mono text-sm">
        Access Level: <span className="text-amber-100">{userProgress.current_access_level}/3</span> | 
        Flags: <span className="text-green-400">{userProgress.total_flags || 0}</span> | 
        User: <span className="text-blue-400">{currentUser}</span>
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