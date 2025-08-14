// Secure privilege escalation CTF simulation with proper root folder protection
import { useEffect, useRef, useState } from "react";

export default function Prompt() {
  const [buf, setBuf] = useState("");
  const [history, setHistory] = useState([]);
  const [commands, setCommands] = useState([]);
  const [cursor, setCursor] = useState(0);
  const [cwd, setCwd] = useState(["/"]);
  const [currentUser, setCurrentUser] = useState("user");
  const inputRef = useRef(null);

  // Mini in-memory file system with root folders and executables
  const fs = {
    "/": {
      home: {
        user: {
          "readme.txt": { type: "file", content: "Welcome!", owner: "user", permissions: "r" },
          "exploit.bat": { type: "exe", content: "exploit", owner: "user", permissions: "rw" }
        }
      },
      root: {
        secrets: {
          "key.txt": { type: "file", content: "TOP_SECRET_KEY_123", owner: "root", permissions: "r" },
          "root_exploit.sh": { type: "exe", content: "echo Root command executed", owner: "root", permissions: "rx" }
        },
        bin: {
          "safe_exec": { type: "exe", content: "echo Safe binary", owner: "root", permissions: "rx" }
        },
        _protected: true // prevent non-root users from accessing
      },
      bin: {},
      etc: {},
    },
  };

  function getDir(fs, pathArray) {
    try {
      return pathArray.reduce((acc, key) => acc[key], fs);
    } catch {
      return null;
    }
  }

  function writeFile(pathArray, content, currentUser) {
    const file = getDir(fs, pathArray);
    if (!file) return "No such file";
    if (file.owner !== currentUser && file.permissions !== "rw") return "Permission denied";
    file.content = content;
    return "File written";
  }

  function runFile(pathArray, currentUser) {
    const file = getDir(fs, pathArray);
    if (!file) return ["No such file"];
    if (file.type !== "exe") return ["Not executable"];
    if (file.owner !== currentUser && !file.permissions.includes("x")) return ["Permission denied"];

    if (file.content === "exploit") {
      setCurrentUser("root");
      return ["SYSTEM> Root privileges granted!"];
    }

    return [file.content];
  }

  function isAccessible(pathArray) {
    const dir = getDir(fs, pathArray);
    if (!dir) return false;
    if (dir._protected && currentUser !== "root") return false;
    return true;
  }

  useEffect(() => inputRef.current?.focus(), []);
  useEffect(() => inputRef.current?.focus(), [history]);
  useEffect(() => setCursor(commands.length), [commands]);

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

  const commandsMap = {
    help: () => ["AVAILABLE> help, ls, cd, cat, clear, edit, run"],
    clear: ({ clear }) => { clear(); return []; },
    ls: ({ cwd }) => {
      const dir = getDir(fs, cwd);
      if (!dir) return ["No such directory"];
      if (dir._protected && currentUser !== "root") return ["Permission denied"];
      return Object.keys(dir).filter(k => k !== '_protected');
    },
    cd: ({ cwd, args, setCwd }) => {
      if (!args[0]) return [];
      const newPath = resolvePath(cwd, args[0]);
      const dir = getDir(fs, newPath);
      if (!dir || (dir._protected && currentUser !== "root")) return [`cd: permission denied: ${args[0]}`];
      setCwd(newPath);
      return [];
    },
    cat: ({ cwd, args }) => {
      if (!args[0]) return ["cat: missing filename"];
      const path = resolvePath(cwd, args[0]);
      const file = getDir(fs, path);
      if (!file) return [`cat: no such file: ${args[0]}`];
      if (file._protected && currentUser !== "root") return ["Permission denied"];
      if (file.type === "file" || file.type === "exe") return [file.content];
      return [`cat: ${args[0]} is a directory`];
    },
    edit: ({ cwd, args, buf }) => {
      if (!args[0]) return ["edit: missing filename"];
      const path = resolvePath(cwd, args[0]);
      if (!isAccessible(path)) return ["Permission denied"];
      return [writeFile(path, buf, currentUser)];
    },
    run: ({ cwd, args }) => {
      if (!args[0]) return ["run: missing filename"];
      const path = resolvePath(cwd, args[0]);
      if (!isAccessible(path)) return ["Permission denied"];
      return runFile(path, currentUser);
    }
  };

  const onSubmit = (value) => {
    const v = value.trim();
    if (!v) return;
    setHistory(h => [...h, `> ${v}`]);
    setCommands(c => [...c, v]);
    const [cmd, ...args] = v.split(/\s+/);
    const handler = commandsMap[cmd];
    if (handler) {
      const out = handler({ args, cwd, buf, setCwd, clear: () => { setHistory([]); setCommands([]); setBuf(""); setCursor(0); setCwd(["/"]); }});
      if (out && out.length) setHistory(h => [...h, ...out]);
    } else {
      setHistory(h => [...h, `UNKNOWN> ${v}`]);
    }
    setBuf("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") { e.preventDefault(); onSubmit(buf); return; }
    if (e.key === "ArrowUp") { e.preventDefault(); setCursor(c => { const next = Math.max(0, c - 1); setBuf(next < commands.length ? commands[next] : ""); return next; }); return; }
    if (e.key === "ArrowDown") { e.preventDefault(); setCursor(c => { const next = Math.min(commands.length, c + 1); setBuf(next === commands.length ? "" : commands[next]); return next; }); return; }
  };

  return (
    <div className="mt-4" onClick={() => inputRef.current?.focus()}>
      {history.map((h, i) => (<div key={i} className="text-white/80">{h}</div>))}
      <div className="flex items-center gap-2 mt-1">
        <span className="text-white/70">{cwd.join("/")}&gt;</span>
        <input
          ref={inputRef}
          value={buf}
          onChange={(e) => setBuf(e.target.value)}
          onKeyDown={handleKeyDown}
          className="absolute opacity-0 pointer-events-none"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
        />
        <TerminalInput value={buf} />
      </div>
      <div className="mt-2 text-white/50">Current User: {currentUser}</div>
    </div>
  );
}

function TerminalInput({ value }) {
  const [cursorOn, setCursorOn] = useState(true);
  useEffect(() => { const t = setInterval(() => setCursorOn(c => !c), 550); return () => clearInterval(t); }, []);
  return (
    <div className="font-mono text-white/90">
      <span>{value}</span>
      <span className={"ml-0.5 inline-block w-2 h-4 align-[-2px] " + (cursorOn ? "bg-white/80" : "bg-transparent border border-white/30")}/>
    </div>
  );
}
