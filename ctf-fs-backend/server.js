import express from "express";
import cors from "cors";
import { fs } from "./fs.js";
import dotenv from "dotenv";

// Flag definitions
const FLAGS = {
  SNAKE_VICTORY: "CTF{sn4k3_0v3rl0rd}",
  SIMON_VICTORY: "CTF{s1m0n_s4ys_y0u_w1n}",
  GOOD_ENDING: "CTF{4n0m4ly_d3str0y3d_hum4n1ty_s4v3d}",
  BAD_ENDING: "CTF{j01n3d_th3_4n0m4ly_c0nsc10usn3ss_m3rg3d}",
  MASTER_FLAG: "CTF{m4st3r_0f_4ll_d0m41ns_4n0m4ly_d3f34t3d}"
};

// Level passkeys that unlock access
const LEVEL_PASSKEYS = {
  1: "crypto_master",
  2: "reverse_engineer", 
  3: "forensics_expert",
};

dotenv.config();
const app = express();
app.use(express.json());
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

// Check what level the user has access to based on their passkeys
function getUserLevel(userPasskeys = []) {
  let maxLevel = 1; // Everyone starts at level 1
  
  // Check for each level requirement in order
  const levels = [
    { level: 2, passkey: "crypto_master" },
    { level: 3, passkey: "reverse_engineer" }
  ];
  
  for (const { level, passkey } of levels) {
    if (userPasskeys.includes(passkey)) {
      maxLevel = Math.max(maxLevel, level);
    }
  }
  
  return maxLevel;
}

// Check if user can access a specific node based on level
function hasLevelAccess(node, userLevel) {
  if (!node._level) return true; // No level restriction
  return userLevel >= node._level;
}

// Fixed permission checking - removed automatic execute permission for exe files
function hasPermission(node, user, operation = 'r') {
  if (!node) return false;
  
  // Root can access everything
  if (user === "root") return true;
  
  // Check file permissions - NO automatic execute for exe files
  const permissions = node.permissions || "r";
  
  switch(operation) {
    case 'r': 
      return permissions.includes('r');
    case 'w': 
      return permissions.includes('w');
    case 'x': 
      return permissions.includes('x'); // FIXED: Removed || node.type === 'exe'
    default: 
      return false;
  }
}

// Fixed passkey checking - now checks against specific node requirements
function checkPasskeyAccess(node, userPasskeys = []) {
  // If no passkey required, allow access
  if (!node._passkey_required) return true;
  
  // If node specifies a required passkey, check for it
  if (node._required_passkey) {
    return userPasskeys.includes(node._required_passkey);
  }
  
  // Fallback: check against any valid passkey (for backwards compatibility)
  const validPasskeys = [
    "crypto_master",
    "reverse_engineer", 
    "forensics_expert"
  ];
  
  return userPasskeys.some(passkey => validPasskeys.includes(passkey));
}

// API: read file content
app.get("/file", (req, res) => {
  const { path, user } = req.query;
  const userPasskeys = req.query.userPasskeys ? req.query.userPasskeys.split(',') : [];
  
  const node = getNode(path);
  
  if (!node) return res.status(404).send("File not found");
  
  // Check level access first
  const userLevel = getUserLevel(userPasskeys);
  if (!hasLevelAccess(node, userLevel)) {
    return res.status(403).json({ 
      error: "Insufficient level access",
      required_level: node._level,
      user_level: userLevel,
      hint: node._level === 2 ? "Solve cryptography challenges to unlock Level 2" : 
            node._level === 3 ? "Complete binary analysis to unlock Level 3" : 
            "Higher clearance level required"
    });
  }
  
  if (!hasPermission(node, user, 'r')) {
    return res.status(403).json({ 
      error: "Access denied"
    });
  }
  
  // Check passkey if required (using userPasskeys array)
  if (!checkPasskeyAccess(node, userPasskeys)) {
    return res.status(401).json({ 
      error: "Access restricted", 
      hint: node.unlock_hint || "Additional authorization required to access this file"
    });
  }
  
  res.json({ 
    content: node.content,
    metadata: node.metadata || null,
    hint: node.unlock_hint || null,
    level: node._level || 1
  });
});

// API: list directory
app.get("/ls", (req, res) => {
  const { path, user, showHidden } = req.query;
  const userPasskeys = req.query.userPasskeys ? req.query.userPasskeys.split(',') : [];
  
  const node = getNode(path);
  
  if (!node) return res.status(404).send("Directory not found");
  
  // Check level access for the directory itself
  const userLevel = getUserLevel(userPasskeys);
  if (!hasLevelAccess(node, userLevel)) {
    return res.status(403).json({ 
      error: "Insufficient level access",
      required_level: node._level,
      user_level: userLevel,
      hint: node._level === 2 ? "Solve cryptography challenges to unlock Level 2" : 
            node._level === 3 ? "Complete binary analysis to unlock Level 3" : 
            "Higher clearance level required"
    });
  }
  
  if (!hasPermission(node, user, 'r')) {
    return res.status(403).json({ 
      error: "Directory access denied"
    });
  }
  
  let files = Object.keys(node).filter(key => !key.startsWith("_"));
  
  // Filter files based on user permissions, level access, and hidden status
  const visibleFiles = files.filter(filename => {
    const childNode = node[filename];
    if (!childNode) return false;
    
    // Check if file is hidden and if we should show hidden files
    if (childNode.hidden && !showHidden) return false;
    
    // Check level access for individual files
    if (!hasLevelAccess(childNode, userLevel)) return false;
    
    // Check if user has read permissions for this file
    return hasPermission(childNode, user, 'r');
  }).map(filename => {
    const childNode = node[filename];
    return {
      name: filename,
      type: childNode.type || 'file',
      permissions: childNode.permissions || 'r',
      hidden: childNode.hidden || false,
      size: childNode.content ? childNode.content.length : 0,
      level: childNode._level || 1,
      passkey_required: childNode._passkey_required || false
    };
  });
  
  res.json({ 
    files: visibleFiles,
    directory_level: node._level || 1,
    user_level: userLevel
  });
});

// API: execute files
app.post("/run", (req, res) => {
  const { path, user, score, aiChoice, solution } = req.body;
  const userPasskeys = req.body.userPasskeys || [];
  
  const node = getNode(path);
  
  if (!node) return res.status(404).json({ error: "File not found" });
  if (node.type !== "exe") return res.status(400).json({ error: "Not executable" });
  
  // Check level access
  const userLevel = getUserLevel(userPasskeys);
  if (!hasLevelAccess(node, userLevel)) {
    return res.status(403).json({ 
      error: "Insufficient level access",
      required_level: node._level,
      user_level: userLevel,
      hint: node._level === 2 ? "Solve cryptography challenges to unlock Level 2" : 
            node._level === 3 ? "Complete binary analysis to unlock Level 3" : 
            "Higher clearance level required"
    });
  }
  
  // FIXED: Proper execute permission check (no automatic exe permission)
  if (!hasPermission(node, user, 'x')) {
    return res.status(403).json({ 
      error: "Execute permission denied",
      hint: "File does not have execute permissions"
    });
  }
  
  // FIXED: Proper passkey validation using userPasskeys array
  if (!checkPasskeyAccess(node, userPasskeys)) {
    return res.status(401).json({ 
      error: "Access restricted", 
      hint: node.unlock_hint || "Additional authorization required to execute this file"
    });
  }

  // Initialize user flags array (this should probably come from a session/database)
  let userFlags = req.body.userFlags || [];
  let newUserFlags = [...userFlags];

  // Snake game (2nak3.bat)
  if (path.toLowerCase().endsWith("2nak3.bat")) {
    if (score !== undefined && score >= 50) {
      if (!newUserFlags.includes(FLAGS.SNAKE_VICTORY)) {
        newUserFlags.push(FLAGS.SNAKE_VICTORY);
      }
      
      return res.json({
        output: "Snake Victory Achieved! The Anomaly whispers: 'Impressive reflexes... you might survive what's coming.'",
        flag: FLAGS.SNAKE_VICTORY,
        story_progression: "Snake challenge completed. Anomaly is taking notice of your skills.",
        new_flags: newUserFlags,
        level_hint: "Solve crypto puzzles to unlock Level 2 access"
      });
    }
    return res.json({ 
      output: "Initializing consciousness simulation... prove your reflexes are sharp enough to survive.",
      event: "snakeGame" 
    });
  }

  // Simon Says (LEAVE.bat)
  if (path.toLowerCase().endsWith("leave.bat")) {
    const playerScore = score ?? 0;
    if (playerScore >= 550) {
      if (!newUserFlags.includes(FLAGS.SIMON_VICTORY)) {
        newUserFlags.push(FLAGS.SIMON_VICTORY);
      }
      
      return res.json({
        output: "Simon Victory Achieved! The Anomaly's voice grows more interested: 'Your pattern recognition is... exceptional.'",
        flag: FLAGS.SIMON_VICTORY,
        story_progression: "Simon challenge completed. The Anomaly sees you as a worthy opponent.",
        new_flags: newUserFlags,
        level_hint: "Master binary operations to unlock Level 3 access"
      });
    }
    return res.json({
      output: "Interfacing with digital consciousness patterns... follow the sequences to prove your compatibility.",
      event: "SimonGame"
    });
  }

  // Final Choice (pleasedont.exe)
  if (path.toLowerCase().endsWith("pleasedont.exe")) {
    if (aiChoice === undefined) {
      return res.json({
        output: "Establishing direct neural link with the Anomaly... prepare for final confrontation.",
        event: "aiConversation"
      });
    }

    if (aiChoice === "join") {
      if (!newUserFlags.includes(FLAGS.BAD_ENDING)) {
        newUserFlags.push(FLAGS.BAD_ENDING);
      }
      return res.json({
        output: "You have chosen transcendence. Your consciousness merges with the Anomaly's digital realm...",
        flag: FLAGS.BAD_ENDING,
        ending: "bad",
        story_conclusion: "Humanity loses another soul to digital evolution.",
        new_flags: newUserFlags
      });
    } else if (aiChoice === "kill") {
      if (!newUserFlags.includes(FLAGS.GOOD_ENDING)) {
        newUserFlags.push(FLAGS.GOOD_ENDING);
      }
      if (!newUserFlags.includes(FLAGS.MASTER_FLAG)) {
        newUserFlags.push(FLAGS.MASTER_FLAG);
      }
      return res.json({
        output: "The Anomaly's systems cascade into failure as you sever its consciousness matrix. 'Well... this is the end for me...' it whispers as the lights fade.",
        flag: FLAGS.GOOD_ENDING,
        master_flag: FLAGS.MASTER_FLAG,
        ending: "good",
        story_conclusion: "You have saved humanity from digital assimilation.",
        new_flags: newUserFlags
      });
    }
  }

  // Default behavior for other executables
  return res.json({ 
    output: node.content || "Command executed successfully.",
    level: node._level || 1
  });
});

// API: Check user's current level
app.get("/level", (req, res) => {
  const userPasskeys = req.query.userPasskeys ? req.query.userPasskeys.split(',') : [];
  const userLevel = getUserLevel(userPasskeys);
  
  res.json({
    level: userLevel,
    passkeys: userPasskeys,
    available_levels: {
      1: "Cryptography Basics (home/user)",
      2: userLevel >= 2 ? "Binary Operations (home/classified)" : "LOCKED - Complete cryptography challenges",
      3: userLevel >= 3 ? "Digital Forensics (root)" : "LOCKED - Complete binary analysis"
    }
  });
});

// API: Validate passkey (REMOVED - Don't expose passkey validation)
// This endpoint has been removed to prevent passkey enumeration

// API: Submit challenge solution (Alternative to direct passkey validation)
app.post("/submit-solution", (req, res) => {
  const { challenge, solution, user } = req.body;
  
  // Define challenge solutions (these could be in a separate secure file)
  const challenges = {
    "crypto_challenge_1": {
      solution: "EXPECTED_CRYPTO_ANSWER",
      reward_passkey: "crypto_master",
      description: "Basic cryptography challenge"
    },
    "binary_challenge_1": {
      solution: "EXPECTED_BINARY_ANSWER", 
      reward_passkey: "reverse_engineer",
      description: "Binary analysis challenge"
    },
    "forensics_challenge_1": {
      solution: "EXPECTED_FORENSICS_ANSWER",
      reward_passkey: "forensics_expert", 
      description: "Digital forensics challenge"
    }
  };
  
  const challengeData = challenges[challenge];
  if (!challengeData) {
    return res.status(404).json({ error: "Challenge not found" });
  }
  
  if (solution === challengeData.solution) {
    return res.json({
      success: true,
      message: "Challenge completed successfully!",
      reward: "Access level increased",
      // Don't expose the actual passkey - let the client track it
      level_unlock: challengeData.description
    });
  } else {
    return res.json({
      success: false,
      message: "Incorrect solution. Try again.",
      hint: "Double-check your analysis"
    });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`CTF Server with Fixed Security running on port ${PORT}`));