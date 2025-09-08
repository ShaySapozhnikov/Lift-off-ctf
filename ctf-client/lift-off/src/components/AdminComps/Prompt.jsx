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
  const inputRef = useRef(null);

  useEffect(() => inputRef.current?.focus(), []);
  useEffect(() => inputRef.current?.focus(), [history]);
  useEffect(() => setCursor(commands.length), [commands]);

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
  const lsDir = async (path) => {
    try {
      const res = await fetch(
        `${BACKEND_URL}/ls?path=${encodeURIComponent(path)}&user=${currentUser}`
      );
      if (!res.ok) return [`Error: ${await res.text()}`];
      const data = await res.json();
      return data.files;
    } catch (e) {
      return [`Network error: ${e.message}`];
    }
  };

  const catFile = async (path) => {
    try {
      const res = await fetch(
        `${BACKEND_URL}/file?path=${encodeURIComponent(path)}&user=${currentUser}`
      );
      if (!res.ok) return [`Error: ${await res.text()}`];
      const data = await res.json();
      return [data.content];
    } catch (e) {
      return [`Network error: ${e.message}`];
    }
  };

  const runFileAPI = async (path, score = undefined) => {
    try {
      const requestBody = { path, user: currentUser };
      if (score !== undefined) {
        requestBody.score = score;
      }

      const res = await fetch(`${BACKEND_URL}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
      if (!res.ok) return [`Error: ${await res.text()}`];
      const data = await res.json();

      // ✅ Notify parent about any event (like "snakeGame", "SimonGame", or "anomalyEncounter")
      if (data.event && typeof onEvent === "function") {
        console.log("Backend returned event:", data.event);
        onEvent(data.event);
      }

      if (data.output === "exploit") setCurrentUser("root");

      // Handle flags from completed games
      if (data.flag) {
        return [data.output, `FLAG: ${data.flag}`];
      }

      return [data.output];
    } catch (e) {
      return [`Network error: ${e.message}`];
    }
  };

  // Expose function for games to submit scores
  window.submitGameScore = async (gamePath, score) => {
    const result = await runFileAPI(gamePath, score);
    if (result && result.length) {
      setHistory((h) => [...h, ...result]);
    }
  };

  // --- Commands ---
  const commandsMap = {
    help: async () => ["AVAILABLE> help, ls, cd, cat, clear, run, pleasedont.exe"],
    clear: async ({ clear }) => {
      clear();
      return [];
    },
    ls: async ({ cwd }) => await lsDir(cwd.join("/")),
    cd: async ({ cwd, args, setCwd }) => {
      if (!args[0]) return [];
      const newPath = resolvePath(cwd, args[0]);
      const dirCheck = await lsDir(newPath.join("/"));
      if (dirCheck[0]?.startsWith("Error"))
        return [`cd: permission denied: ${args[0]}`];
      setCwd(newPath);
      return [];
    },
    cat: async ({ cwd, args }) => {
      if (!args[0]) return ["cat: missing filename"];
      const path = resolvePath(cwd, args[0]).join("/");
      return await catFile(path);
    },
    run: async ({ cwd, args }) => {
      if (!args[0]) return ["run: missing filename"];
      const path = resolvePath(cwd, args[0]).join("/");
      return await runFileAPI(path);
    },
    // Multiple ways to trigger the anomaly encounter
    "pleasedont.exe": async () => {
      console.log("pleasedont.exe command triggered!");
      // Trigger the anomaly encounter directly
      if (typeof onEvent === "function") {
        console.log("Calling onEvent with anomalyEncounter");
        onEvent("anomalyEncounter");
      }
      return ["WARNING: Executing forbidden file...", "Initializing anomaly encounter..."];
    },
    pleasedont: async () => {
      // Alternative without .exe extension
      console.log("pleasedont command triggered!");
      if (typeof onEvent === "function") {
        console.log("Calling onEvent with anomalyEncounter");
        onEvent("anomalyEncounter");
      }
      return ["WARNING: Executing forbidden file...", "Initializing anomaly encounter..."];
    }
  };

  const onSubmit = async (value) => {
    const v = value.trim();
    if (!v) return;
    setHistory((h) => [...h, `> ${v}`]);
    setCommands((c) => [...c, v]);

    const [cmd, ...args] = v.split(/\s+/);
    
    console.log("Command entered:", cmd, "Args:", args);
    
    // Check for exact command match first
    const handler = commandsMap[cmd];
    if (handler) {
      console.log("Found handler for command:", cmd);
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
      // Check if it's a file execution attempt
      if (cmd === "pleasedont.exe" || cmd === "./pleasedont.exe") {
        console.log("Detected pleasedont.exe execution attempt");
        if (typeof onEvent === "function") {
          console.log("Calling onEvent with anomalyEncounter");
          onEvent("anomalyEncounter");
        }
        setHistory((h) => [...h, "WARNING: Executing forbidden file...", "Initializing anomaly encounter..."]);
      } else {
        setHistory((h) => [...h, `UNKNOWN> ${v}`]);
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
          <div key={i} className="text-white/80">
            {h}
          </div>
        ))}
      </div>

      {/* prompt row */}
      <div className="flex items-center gap-2 pt-2 pb-2">
        <span className="text-white/70">{cwd.join("/")}&gt;</span>
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

      <div className="mt-1 text-white/50">Current User: {currentUser}</div>
    </div>
  );
}

function TerminalInput({ value }) {
  const [cursorOn, setCursorOn] = useState(true);
  useEffect(() => {
    const t = setInterval(() => setCursorOn((c) => !c), 550);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="font-mono text-white/90">
      <span>{value}</span>
      <span
        className={
          "ml-0.5 inline-block w-2 h-4 align-[-2px] " +
          (cursorOn ? "bg-white/80" : "bg-transparent border border-white/30")
        }
      />
    </div>
  );
}