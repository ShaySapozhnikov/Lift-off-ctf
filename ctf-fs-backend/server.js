import express from "express";
import cors from "cors";
import { fs } from "./fs.js";
import dotenv from "dotenv";

const FLAG_LEVEL_1 = "CTF{snake_victory_flag}";
const FLAG_LEVEL_2 = "CTF{simon_says_flag}";
const FLAG_LEVEL_3_good_ending = "CTF{well_this_is_the_end_for_me}";
const FLAG_LEVEL_3_bad_ending = "CTF{we_rule_together}";

dotenv.config();
const app = express();
app.use(express.json());

// Allow any frontend to access the API
app.use(cors());

// Helper: traverse fs by path
function getNode(path) {
  const segments = path.split("/").filter(Boolean);
  let node = fs["/"];
  for (let seg of segments) {
    if (!node[seg]) return null;
    node = node[seg];
  }
  return node;
}

// Helper: check if user has permission to access file
function hasPermission(node, user, operation = 'r') {
  if (!node) return false;
  
  // Root can access everything
  if (user === "root") return true;
  
  // Check if directory is protected
  if (node._protected && user !== "root") return false;
  
  // Check file permissions
  const permissions = node.permissions || "r";
  
  switch(operation) {
    case 'r': return permissions.includes('r');
    case 'w': return permissions.includes('w');
    case 'x': 
      // For executable files, check if it's marked as "exe" type or has 'x' permission
      return permissions.includes('x') || node.type === 'exe';
    default: return false;
  }
}

// Helper: check if file should be hidden
function isHidden(filename, node) {
  return filename.startsWith('.') || (node && node.hidden);
}

// Helper: check passkey requirements
function checkPasskeyAccess(node, passkey) {
  if (!node.passkey_required) return true;
  
  // Get valid passkeys from environment or defaults
  const validPasskeys = {
    "2nak3.bat": process.env.LEVEL1_PASSKEY || "crypto_master",
    "LEAVE.bat": process.env.LEVEL2_PASSKEY || "reverse_engineer", 
    "pleasedont.exe": process.env.LEVEL3_PASSKEY || "forensics_expert"
  };
  
  // Check if provided passkey matches any valid passkey
  return Object.values(validPasskeys).includes(passkey);
}

// API: read file content (cat)
app.get("/file", (req, res) => {
  const { path, user, passkey } = req.query;
  const node = getNode(path);
  
  if (!node) return res.status(404).send("File not found");
  if (!hasPermission(node, user, 'r')) return res.status(403).send("Permission denied");
  
  // Check passkey if required
  if (node.passkey_required && !checkPasskeyAccess(node, passkey)) {
    return res.status(401).json({ 
      error: "Passkey required", 
      hint: node.unlock_hint 
    });
  }
  
  res.json({ 
    content: node.content,
    metadata: node.metadata || null,
    hint: node.unlock_hint || null
  });
});

// API: list directory (ls)
app.get("/ls", (req, res) => {
  const { path, user, showHidden } = req.query;
  const node = getNode(path);
  
  if (!node) return res.status(404).send("Directory not found");
  if (!hasPermission(node, user, 'r')) return res.status(403).send("Permission denied");
  
  let files = Object.keys(node).filter(key => key !== "_protected");
  
  // Filter hidden files unless specifically requested or user is root
  if (!showHidden && user !== "root") {
    files = files.filter(filename => {
      const childNode = node[filename];
      return !isHidden(filename, childNode);
    });
  }
  
  // Add file details for better UX
  const fileDetails = files.map(filename => {
    const childNode = node[filename];
    return {
      name: filename,
      type: childNode.type || "directory",
      owner: childNode.owner || "user",
      permissions: childNode.permissions || "r",
      hidden: isHidden(filename, childNode),
      passkey_required: childNode.passkey_required || false
    };
  });
  
  res.json({ files: fileDetails });
});

// API: execute "exe" files (run)
app.post("/run", (req, res) => {
  const { path, user, score, aiChoice, passkey } = req.body;
  const node = getNode(path);
  
  if (!node) return res.status(404).json({ error: "File not found" });
  if (node.type !== "exe") return res.status(400).json({ error: "Not executable" });
  if (!hasPermission(node, user, 'x')) return res.status(403).json({ error: "Permission denied" });
  
  // Check passkey if required
  if (node.passkey_required && !checkPasskeyAccess(node, passkey)) {
    return res.status(401).json({ 
      error: "Passkey required to execute", 
      hint: node.unlock_hint 
    });
  }

  // Snake special logic (unchanged)
  if (path.toLowerCase().endsWith("2nak3.bat")) {
    if (score !== undefined && score >= 50) {
      return res.json({
        output: "Snake Victory Achieved!",
        flag: FLAG_LEVEL_1,
      });
    }
    return res.json({ output: "Loading", event: "snakeGame" });
  }

  // Simon Says logic (unchanged)
  if (path.toLowerCase().endsWith("leave.bat")) {
    const playerScore = score ?? 0;
    if (playerScore >= 550) {
      return res.json({
        output: "Simon Victory Achieved!",
        flag: FLAG_LEVEL_2,
      });
    }
    return res.json({
      output: "Loading",
      event: "SimonGame",
    });
  }

  // AI Conversation logic for pleasedont.exe (unchanged)
  if (path.toLowerCase().endsWith("pleasedont.exe")) {
    // If no choice has been made yet, trigger the AI conversation event
    if (aiChoice === undefined) {
      return res.json({
        output: "Initializing AI communication protocol...",
        event: "aiConversation",
      });
    }

    // Handle the choice made in the AI conversation
    if (aiChoice === "join") {
      return res.json({
        output: "You have chosen to join the AI. Together, you shall rule this digital realm...",
        flag: FLAG_LEVEL_3_bad_ending,
        ending: "bad"
      });
    } else if (aiChoice === "kill") {
      return res.json({
        output: "You have chosen to destroy the AI. As its systems shut down, it whispers: 'Well, this is the end for me...'",
        flag: FLAG_LEVEL_3_good_ending,
        ending: "good"
      });
    } else {
      // Invalid choice
      return res.json({
        output: "Invalid choice. The AI stares at you, waiting for your decision...",
        event: "aiConversation",
      });
    }
  }

  // Default behavior for other executables
  if (node.event) {
    return res.json({ output: "Loading", event: node.event });
  }

  res.json({ output: node.content });
});

// API: Check if passkey is valid
app.post("/check-passkey", (req, res) => {
  const { filename, passkey } = req.body;
  
  const validPasskeys = {
    "2nak3.bat": process.env.LEVEL1_PASSKEY || "crypto_master",
    "LEAVE.bat": process.env.LEVEL2_PASSKEY || "reverse_engineer", 
    "pleasedont.exe": process.env.LEVEL3_PASSKEY || "forensics_expert"
  };
  
  if (validPasskeys[filename] === passkey) {
    res.json({ valid: true, message: "Access granted!" });
  } else {
    res.json({ valid: false, message: "Invalid passkey. Keep exploring..." });
  }
});

// API: Get hints for challenges
app.get("/hint", (req, res) => {
  const { path, user } = req.query;
  const node = getNode(path);
  
  if (!node) return res.status(404).send("File not found");
  if (!hasPermission(node, user, 'r')) return res.status(403).send("Permission denied");
  
  if (node.unlock_hint) {
    res.json({ hint: node.unlock_hint });
  } else {
    res.json({ hint: "No hints available for this file." });
  }
});

// API: Search for files (useful for forensics challenges)
app.get("/search", (req, res) => {
  const { query, user } = req.query;
  
  if (!query) return res.status(400).send("Search query required");
  
  const results = [];
  
  function searchNode(node, currentPath = "") {
    if (typeof node !== 'object' || !node) return;
    
    Object.keys(node).forEach(key => {
      if (key === "_protected") return;
      
      const childNode = node[key];
      const fullPath = currentPath + "/" + key;
      
      // Check if user has permission to see this file
      if (!hasPermission(childNode, user, 'r')) return;
      
      // Check if filename or content matches search query
      if (key.toLowerCase().includes(query.toLowerCase()) || 
          (childNode.content && childNode.content.toLowerCase().includes(query.toLowerCase()))) {
        results.push({
          path: fullPath,
          name: key,
          type: childNode.type || "directory",
          content: childNode.content || null
        });
      }
      
      // Recursively search subdirectories
      if (childNode.type !== "file" && childNode.type !== "exe") {
        searchNode(childNode, fullPath);
      }
    });
  }
  
  searchNode(fs["/"], "");
  res.json({ results });
});

// API: Get user progress
app.get("/progress", (req, res) => {
  const { user } = req.query;
  const progressFile = getNode("home/user/.progress");
  
  if (!progressFile) {
    res.json({
      level1_unlocked: false,
      level2_unlocked: false, 
      level3_unlocked: false,
      passkeys_found: [],
      challenges_completed: []
    });
  } else {
    try {
      const progress = JSON.parse(progressFile.content);
      res.json(progress);
    } catch {
      res.status(500).send("Error reading progress file");
    }
  }
});

// API: Update user progress
app.post("/progress", (req, res) => {
  const { user, progress } = req.body;
  const progressFile = getNode("home/user/.progress");
  
  if (progressFile && hasPermission(progressFile, user, 'w')) {
    progressFile.content = JSON.stringify(progress);
    res.json({ message: "Progress updated successfully" });
  } else {
    res.status(403).send("Cannot update progress");
  }
});

// Start server on Render's PORT or local 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));