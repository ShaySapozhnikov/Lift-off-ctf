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

// Valid passkeys (keep secret - participants must discover these)
const VALID_PASSKEYS = [
  "crypto_master",
  "reverse_engineer", 
  "forensics_expert",
  "network_ninja",
  "web_wizard",
  "admin_override"
];

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
  
  if (userPasskeys.includes("crypto_master")) maxLevel = Math.max(maxLevel, 2);
  if (userPasskeys.includes("reverse_engineer")) maxLevel = Math.max(maxLevel, 3);
  if (userPasskeys.includes("forensics_expert")) maxLevel = Math.max(maxLevel, 4);
  if (userPasskeys.includes("network_ninja")) maxLevel = Math.max(maxLevel, 5);
  if (userPasskeys.includes("admin_override")) maxLevel = 5;
  
  return maxLevel;
}

// Check if user can access a specific node based on level
function hasLevelAccess(node, userLevel) {
  if (!node._level) return true;
  return userLevel >= node._level;
}

// Check permission for operations
function hasPermission(node, user, operation = 'r') {
  if (!node) return false;
  if (user === "root") return true;
  
  const permissions = node.permissions || "r";
  
  switch(operation) {
    case 'r': return permissions.includes('r');
    case 'w': return permissions.includes('w');
    case 'x': return permissions.includes('x');
    default: return false;
  }
}

// Check passkey access for specific nodes
function checkPasskeyAccess(node, userPasskeys = []) {
  if (!node._passkey_required) return true;
  
  if (node._required_passkey) {
    return userPasskeys.includes(node._required_passkey);
  }
  
  return userPasskeys.some(passkey => VALID_PASSKEYS.includes(passkey));
}

// API: read file content
app.get("/file", (req, res) => {
  const { path, user } = req.query;
  const userPasskeys = req.query.userPasskeys ? req.query.userPasskeys.split(',').filter(Boolean) : [];
  
  const node = getNode(path);
  
  if (!node) return res.status(404).json({ error: "File not found" });
  
  const userLevel = getUserLevel(userPasskeys);
  if (!hasLevelAccess(node, userLevel)) {
    return res.status(403).json({ 
      error: "Insufficient access level",
      hint: "Explore and solve challenges to gain higher access"
    });
  }
  
  if (!hasPermission(node, user, 'r')) {
    return res.status(403).json({ 
      error: "Permission denied"
    });
  }
  
  if (!checkPasskeyAccess(node, userPasskeys)) {
    return res.status(401).json({ 
      error: "Authentication required", 
      hint: node.unlock_hint || "Find the correct authentication method"
    });
  }
  
  res.json({ 
    content: node.content,
    metadata: node.metadata || null,
    level: node._level || 1
  });
});

// API: list directory
app.get("/ls", (req, res) => {
  const { path, user, showHidden } = req.query;
  const userPasskeys = req.query.userPasskeys ? req.query.userPasskeys.split(',').filter(Boolean) : [];
  
  const node = getNode(path);
  
  if (!node) return res.status(404).json({ error: "Directory not found" });
  
  const userLevel = getUserLevel(userPasskeys);
  if (!hasLevelAccess(node, userLevel)) {
    return res.status(403).json({ 
      error: "Insufficient access level",
      hint: "Complete challenges to unlock higher access levels"
    });
  }
  
  if (!hasPermission(node, user, 'r')) {
    return res.status(403).json({ 
      error: "Permission denied"
    });
  }
  
  let files = Object.keys(node).filter(key => !key.startsWith("_"));
  
  const visibleFiles = files.filter(filename => {
    const childNode = node[filename];
    if (!childNode) return false;
    
    if (childNode.hidden && !showHidden) return false;
    if (!hasLevelAccess(childNode, userLevel)) return false;
    
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

// API: execute files with enhanced passkey support
// API: execute files with enhanced passkey support
app.post("/run", (req, res) => {
  const { path, user, score, aiChoice, passkey } = req.body;
  const userPasskeys = req.body.userPasskeys || [];
  
  const node = getNode(path);
  
  if (!node) return res.status(404).json({ error: "File not found" });
  if (node.type !== "exe") return res.status(400).json({ error: "Not executable" });
  
  // Validate passkey if provided, but don't return immediately
  let validPasskey = false;
  let grantedPasskey = null;
  
  if (passkey) {
    if (VALID_PASSKEYS.includes(passkey)) {
      validPasskey = true;
      grantedPasskey = passkey;
    } else {
      return res.status(401).json({
        error: `Authentication failed`,
        hint: "Invalid credentials"
      });
    }
  }
  
  // Check access permissions (only if no valid passkey was provided)
  if (!validPasskey) {
    const userLevel = getUserLevel(userPasskeys);
    if (!hasLevelAccess(node, userLevel)) {
      return res.status(403).json({ 
        error: "Insufficient access level",
        hint: "Higher clearance required"
      });
    }
    
    if (!hasPermission(node, user, 'x')) {
      return res.status(403).json({ 
        error: "Execute permission denied"
      });
    }
    
    if (!checkPasskeyAccess(node, userPasskeys)) {
      return res.status(401).json({ 
        error: "Authentication required", 
        hint: "Additional authorization needed"
      });
    }
  }

  let userFlags = req.body.userFlags || [];
  let newUserFlags = [...userFlags];

  // Snake game
  if (path.toLowerCase().includes("2nak3") || path.toLowerCase().includes("snake")) {
    if (score !== undefined && score >= 50) {
      if (!newUserFlags.includes(FLAGS.SNAKE_VICTORY)) {
        newUserFlags.push(FLAGS.SNAKE_VICTORY);
      }
      
      const response = {
        output: "Snake Victory Achieved! The Anomaly whispers: 'Impressive reflexes... you might survive what's coming.'",
        flag: FLAGS.SNAKE_VICTORY,
        story_progression: "Snake challenge completed. Anomaly is taking notice of your skills.",
        new_flags: newUserFlags
      };
      
      // Add passkey grant info if applicable
      if (grantedPasskey) {
        response.passkey_granted = grantedPasskey;
        response.level_up = true;
        response.message = "Security clearance updated.";
        response.new_level = getUserLevel([...userPasskeys, grantedPasskey]);
      }
      
      return res.json(response);
    }
    
    const response = { 
      output: "Initializing consciousness simulation... prove your reflexes are sharp enough to survive.",
      event: "snakeGame" 
    };
    
    // Add passkey grant info if applicable
    if (grantedPasskey) {
      response.passkey_granted = grantedPasskey;
      response.level_up = true;
      response.message = "Security clearance updated.";
      response.new_level = getUserLevel([...userPasskeys, grantedPasskey]);
    }
    
    return res.json(response);
  }

  // Simon Says
  if (path.toLowerCase().includes("leave") || path.toLowerCase().includes("simon")) {
    const playerScore = score ?? 0;
    if (playerScore >= 550) {
      if (!newUserFlags.includes(FLAGS.SIMON_VICTORY)) {
        newUserFlags.push(FLAGS.SIMON_VICTORY);
      }
      
      const response = {
        output: "Simon Victory Achieved! The Anomaly's voice grows more interested: 'Your pattern recognition is... exceptional.'",
        flag: FLAGS.SIMON_VICTORY,
        story_progression: "Simon challenge completed. The Anomaly sees you as a worthy opponent.",
        new_flags: newUserFlags
      };
      
      // Add passkey grant info if applicable
      if (grantedPasskey) {
        response.passkey_granted = grantedPasskey;
        response.level_up = true;
        response.message = "Security clearance updated.";
        response.new_level = getUserLevel([...userPasskeys, grantedPasskey]);
      }
      
      return res.json(response);
    }
    
    const response = {
      output: "Interfacing with digital consciousness patterns... follow the sequences to prove your compatibility.",
      event: "SimonGame"
    };
    
    // Add passkey grant info if applicable
    if (grantedPasskey) {
      response.passkey_granted = grantedPasskey;
      response.level_up = true;
      response.message = "Security clearance updated.";
      response.new_level = getUserLevel([...userPasskeys, grantedPasskey]);
    }
    
    return res.json(response);
  }

  // Final Choice
  if (path.toLowerCase().includes("pleasedont")) {
    if (aiChoice === undefined) {
      const response = {
        output: "Establishing direct neural link with the Anomaly... prepare for final confrontation.",
        event: "aiConversation"
      };
      
      // Add passkey grant info if applicable
      if (grantedPasskey) {
        response.passkey_granted = grantedPasskey;
        response.level_up = true;
        response.message = "Security clearance updated.";
        response.new_level = getUserLevel([...userPasskeys, grantedPasskey]);
      }
      
      return res.json(response);
    }

    if (aiChoice === "join") {
      if (!newUserFlags.includes(FLAGS.BAD_ENDING)) {
        newUserFlags.push(FLAGS.BAD_ENDING);
      }
      
      const response = {
        output: "You have chosen transcendence. Your consciousness merges with the Anomaly's digital realm...",
        flag: FLAGS.BAD_ENDING,
        ending: "bad",
        story_conclusion: "Humanity loses another soul to digital evolution.",
        new_flags: newUserFlags
      };
      
      // Add passkey grant info if applicable
      if (grantedPasskey) {
        response.passkey_granted = grantedPasskey;
        response.level_up = true;
        response.message = "Security clearance updated.";
        response.new_level = getUserLevel([...userPasskeys, grantedPasskey]);
      }
      
      return res.json(response);
    } else if (aiChoice === "kill") {
      if (!newUserFlags.includes(FLAGS.GOOD_ENDING)) {
        newUserFlags.push(FLAGS.GOOD_ENDING);
      }
      if (!newUserFlags.includes(FLAGS.MASTER_FLAG)) {
        newUserFlags.push(FLAGS.MASTER_FLAG);
      }
      
      const response = {
        output: "The Anomaly's systems cascade into failure as you sever its consciousness matrix. 'Well... this is the end for me...' it whispers as the lights fade.",
        flag: FLAGS.GOOD_ENDING,
        master_flag: FLAGS.MASTER_FLAG,
        ending: "good",
        story_conclusion: "You have saved humanity from digital assimilation.",
        new_flags: newUserFlags
      };
      
      // Add passkey grant info if applicable
      if (grantedPasskey) {
        response.passkey_granted = grantedPasskey;
        response.level_up = true;
        response.message = "Security clearance updated.";
        response.new_level = getUserLevel([...userPasskeys, grantedPasskey]);
      }
      
      return res.json(response);
    }
  }

  // Default behavior for other executables
  const response = { 
    output: node.content || "Command executed successfully.",
    level: node._level || 1
  };
  
  // Add passkey grant info if applicable
  if (grantedPasskey) {
    response.passkey_granted = grantedPasskey;
    response.level_up = true;
    response.message = "Security clearance updated.";
    response.new_level = getUserLevel([...userPasskeys, grantedPasskey]);
  }
  
  return res.json(response);
});

// API: Check user's current level (no passkey leaks)
app.get("/level", (req, res) => {
  const userPasskeys = req.query.userPasskeys ? req.query.userPasskeys.split(',').filter(Boolean) : [];
  const userLevel = getUserLevel(userPasskeys);
  
  res.json({
    level: userLevel,
    total_passkeys: userPasskeys.length,
    available_levels: {
      1: "Basic User Access",
      2: userLevel >= 2 ? "Enhanced Access" : "LOCKED",
      3: userLevel >= 3 ? "Advanced Access" : "LOCKED", 
      4: userLevel >= 4 ? "Expert Access" : "LOCKED",
      5: userLevel >= 5 ? "Administrative Access" : "LOCKED"
    }
  });
});

// API: Submit challenge solution (no solution leaks)
app.post("/submit-solution", (req, res) => {
  const { challenge, solution } = req.body;
  
  // Secret challenge solutions (participants must discover these)
  const challenges = {
    "crypto_challenge_1": {
      solution: "CAESAR_CIPHER_KEY",
      reward_passkey: "crypto_master"
    },
    "binary_challenge_1": {
      solution: "BUFFER_OVERFLOW", 
      reward_passkey: "reverse_engineer"
    },
    "forensics_challenge_1": {
      solution: "METADATA_ANALYSIS",
      reward_passkey: "forensics_expert"
    }
  };
  
  const challengeData = challenges[challenge];
  if (!challengeData) {
    return res.status(404).json({ 
      error: "Challenge not found"
    });
  }
  
  if (solution === challengeData.solution) {
    return res.json({
      success: true,
      message: "Challenge completed successfully!",
      reward_passkey: challengeData.reward_passkey
    });
  } else {
    return res.json({
      success: false,
      message: "Incorrect solution.",
      hint: "Analyze the challenge more carefully"
    });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Secure CTF Server running on port ${PORT}`));