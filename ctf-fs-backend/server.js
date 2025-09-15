import express from "express";
import cors from "cors";
import { fs } from "./fs.js";
import dotenv from "dotenv";

// Flag definitions (keep your existing FLAGS object)
const FLAGS = {
  CRYPTO_MASTER: "CTF{cryptography_m4st3r_l3v3l_1}",
  SNAKE_VICTORY: "CTF{snake_victory_flag}",
  BASE64_DECODED: "CTF{b4s364_d3c0d3d}",
  XOR_MAGIC: "CTF{x0r_m4g1c}",
  METADATA_HUNTER: "CTF{m3t4d4t4_hunt3r}",
  STEGANOGRAPHY: "CTF{st3g4n0gr4phy_m4st3r}",
  REVERSE_ENGINEER: "CTF{r3v3rs3_3ng1n33r1ng_m4st3r}",
  SIMON_VICTORY: "CTF{simon_says_flag}",
  ASSEMBLY_WHISPERER: "CTF{4ss3mbly_wh1sp3r3r}",
  UNPACKED_SECRETS: "CTF{unp4ck3d_s3cr3ts}",
  BINARY_MASTER: "CTF{b1n4ry_m4st3r}",
  FORENSICS_EXPERT: "CTF{f0r3ns1cs_3xp3rt_l3v3l_3}",
  CONSCIOUSNESS_VERIFIED: "CTF{c0nsc10usn3ss_v3r1f13d}",
  BUFFER_OVERFLOW: "CTF{buff3r_0v3rfl0w_m4st3r}",
  KERNEL_CONSCIOUSNESS: "CTF{k3rn3l_c0nsc10usn3ss}",
  DIGITAL_PHILOSOPHER: "CTF{d1g1t4l_ph1l0s0ph3r}",
  GOOD_ENDING: "CTF{4n0m4ly_d3str0y3d_hum4n1ty_s4v3d}",
  BAD_ENDING: "CTF{j01n3d_th3_4n0m4ly_c0nsc10usn3ss_m3rg3d}",
  MASTER_FLAG: "CTF{m4st3r_0f_4ll_d0m41ns_4n0m4ly_d3f34t3d}"
};

const LEVEL_PASSKEYS = {
  1: "crypto_master",
  2: "reverse_engineer", 
  3: "forensics_expert"
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

// FIXED: Calculate access level from actual user progress
function calculateAccessLevel(flagsCollected) {
  if (!flagsCollected || !Array.isArray(flagsCollected)) return 1;
  
  let accessLevel = 1;
  
  // Level 2: Need either crypto mastery or snake game victory
  if (flagsCollected.includes(FLAGS.CRYPTO_MASTER) || 
      flagsCollected.includes(FLAGS.SNAKE_VICTORY)) {
    accessLevel = 2;
  }
  
  // Level 3: Need either reverse engineering mastery or simon victory
  if (flagsCollected.includes(FLAGS.REVERSE_ENGINEER) || 
      flagsCollected.includes(FLAGS.SIMON_VICTORY)) {
    accessLevel = 3;
  }
  
  return accessLevel;
}

// FIXED: Enhanced permission checking with proper access control
function hasPermission(node, user, operation = 'r', userAccessLevel = 1, userFlags = []) {
  if (!node) return false;
  
  // Root can access everything
  if (user === "root") return true;
  
  // Check directory-level access control requirements
  if (node._access_control) {
    switch(node._access_control) {
      case "LEVEL_1_REQUIRED":
        if (userAccessLevel < 1) return false;
        break;
      case "LEVEL_2_REQUIRED": 
        if (userAccessLevel < 2) return false;
        break;
      case "LEVEL_3_REQUIRED":
        if (userAccessLevel < 3) return false;
        break;
    }
  }
  
  // Check passkey requirements for protected directories
  if (node._passkey_required) {
    const hasRequiredPasskey = userFlags.some(flag => {
      if (node._passkey_required === "crypto_master") return flag === FLAGS.CRYPTO_MASTER;
      if (node._passkey_required === "reverse_engineer") return flag === FLAGS.REVERSE_ENGINEER;  
      if (node._passkey_required === "forensics_expert") return flag === FLAGS.FORENSICS_EXPERT;
      return false;
    });
    
    if (!hasRequiredPasskey) return false;
  }
  
  // Check file-level access requirements
  if (node._access_level && node._access_level > userAccessLevel) {
    return false;
  }
  
  // Check file permissions
  const permissions = node.permissions || "r";
  
  switch(operation) {
    case 'r': return permissions.includes('r');
    case 'w': return permissions.includes('w');
    case 'x': 
      return permissions.includes('x') || node.type === 'exe';
    default: return false;
  }
}

// Helper: parse user progress from request
function parseUserProgress(req) {
  const flagsParam = req.query.flags || req.body.flags;
  const challengesParam = req.query.challenges || req.body.challenges;
  
  let userFlags = [];
  let userChallenges = [];
  
  try {
    if (flagsParam) {
      userFlags = JSON.parse(decodeURIComponent(flagsParam));
    }
    if (challengesParam) {
      userChallenges = JSON.parse(decodeURIComponent(challengesParam));
    }
  } catch (e) {
    console.error("Failed to parse user progress:", e);
  }
  
  const userAccessLevel = calculateAccessLevel(userFlags);
  
  return { userFlags, userChallenges, userAccessLevel };
}

// Check if file should be hidden
function isHidden(filename, node) {
  return filename.startsWith('.') || (node && node.hidden);
}

// Check passkey requirements for executables
function checkPasskeyAccess(node, passkey, filename, userAccessLevel = 1) {
  if (!node.passkey_required) return true;
  
  // Level-based passkey system
  if (filename?.includes("2nak3.bat")) {
    return passkey === LEVEL_PASSKEYS[1] || userAccessLevel >= 2; // Changed from >= 1
  }
  if (filename?.includes("LEAVE.bat")) {
    return passkey === LEVEL_PASSKEYS[2] || userAccessLevel >= 3; // Changed from >= 2
  }
  if (filename?.includes("pleasedont.exe")) {
    return passkey === LEVEL_PASSKEYS[3]; // Strict requirement
  }
  
  return Object.values(LEVEL_PASSKEYS).includes(passkey);
}

// FIXED: API: read file content with proper access control
app.get("/file", (req, res) => {
  const { path, user, passkey } = req.query;
  const { userFlags, userChallenges, userAccessLevel } = parseUserProgress(req);
  
  const node = getNode(path);
  
  if (!node) return res.status(404).send("File not found");
  
  // FIXED: Use actual user access level, not hardcoded 3
  if (!hasPermission(node, user, 'r', userAccessLevel, userFlags)) {
    return res.status(403).json({ 
      error: "Access denied", 
      required_level: node._access_control || "Unknown",
      current_level: userAccessLevel,
      hint: "Complete more challenges to unlock higher levels"
    });
  }
  
  // Check passkey if required
  const filename = path.split('/').pop();
  if (node.passkey_required && !checkPasskeyAccess(node, passkey, filename, userAccessLevel)) {
    return res.status(401).json({ 
      error: "Passkey required", 
      hint: node.unlock_hint || "Find the correct passkey to access this file"
    });
  }
  
  res.json({ 
    content: node.content,
    metadata: node.metadata || null,
    hint: node.unlock_hint || null,
    flags_available: getAvailableFlags(path)
  });
});

// FIXED: API: list directory with proper access control
app.get("/ls", (req, res) => {
  const { path, user, showHidden } = req.query;
  const { userFlags, userChallenges, userAccessLevel } = parseUserProgress(req);
  
  const node = getNode(path);
  
  if (!node) return res.status(404).send("Directory not found");
  
  // FIXED: Check if user can access this directory
  if (!hasPermission(node, user, 'r', userAccessLevel, userFlags)) {
    return res.status(403).json({ 
      error: "Directory access denied",
      required_level: node._access_control || "Unknown",
      current_level: userAccessLevel
    });
  }
  
  let files = Object.keys(node).filter(key => !key.startsWith("_"));
  
  // Filter files based on user access level
  const fileDetails = files.map(filename => {
    const childNode = node[filename];
    const hasAccess = hasPermission(childNode, user, 'r', userAccessLevel, userFlags);
    
    // Hide files user can't access unless showHidden is true
    if (!hasAccess && !showHidden) return null;
    
    // Filter hidden files unless specifically requested or user is root
    if (!showHidden && user !== "root" && isHidden(filename, childNode)) {
      return null;
    }
    
    return {
      name: filename,
      type: childNode.type || "directory",
      owner: childNode.owner || "user",
      permissions: childNode.permissions || "r",
      hidden: isHidden(filename, childNode),
      passkey_required: childNode.passkey_required || false,
      access_level: childNode._access_level || 0,
      locked: !hasAccess,
      required_access: childNode._access_control || null
    };
  }).filter(Boolean); // Remove null entries
  
  res.json({ 
    files: fileDetails,
    user_access_level: userAccessLevel,
    directory_access: node._access_control || "PUBLIC"
  });
});

// FIXED: API: execute files with proper access control
app.post("/run", (req, res) => {
  const { path, user, score, aiChoice, passkey, solution } = req.body;
  const { userFlags, userChallenges, userAccessLevel } = parseUserProgress(req);
  
  const node = getNode(path);
  
  if (!node) return res.status(404).json({ error: "File not found" });
  if (node.type !== "exe") return res.status(400).json({ error: "Not executable" });
  
  // FIXED: Check access permission with actual user level
  if (!hasPermission(node, user, 'x', userAccessLevel, userFlags)) {
    return res.status(403).json({ 
      error: "Access denied", 
      required_level: node._access_control || "Unknown",
      current_level: userAccessLevel
    });
  }
  
  const filename = path.split('/').pop();
  
  // FIXED: Check passkey with actual user level
  if (node.passkey_required && !checkPasskeyAccess(node, passkey, filename, userAccessLevel)) {
    return res.status(401).json({ 
      error: "Passkey required to execute", 
      hint: node.unlock_hint || "Find the correct passkey"
    });
  }

  // Level 1: Snake game (2nak3.bat)
  if (path.toLowerCase().endsWith("2nak3.bat")) {
    if (score !== undefined && score >= 50) {
      return res.json({
        output: "Snake Victory Achieved! The Anomaly whispers: 'Impressive reflexes... you might survive what's coming.'",
        flag: FLAGS.SNAKE_VICTORY,
        story_progression: "Level 1 completed. Anomaly is taking notice of your skills."
      });
    }
    return res.json({ 
      output: "Initializing consciousness simulation... prove your reflexes are sharp enough to survive.",
      event: "snakeGame" 
    });
  }

  // Level 2: Simon Says (LEAVE.bat)
  if (path.toLowerCase().endsWith("leave.bat")) {
    const playerScore = score ?? 0;
    if (playerScore >= 550) {
      return res.json({
        output: "Simon Victory Achieved! The Anomaly's voice grows more interested: 'Your pattern recognition is... exceptional.'",
        flag: FLAGS.SIMON_VICTORY,
        story_progression: "Level 2 completed. The Anomaly sees you as a worthy opponent."
      });
    }
    return res.json({
      output: "Interfacing with digital consciousness patterns... follow the sequences to prove your compatibility.",
      event: "SimonGame"
    });
  }

  // Level 3: Final Choice (pleasedont.exe)
  if (path.toLowerCase().endsWith("pleasedont.exe")) {
    if (aiChoice === undefined) {
      return res.json({
        output: "Establishing direct neural link with the Anomaly... prepare for final confrontation.",
        event: "aiConversation"
      });
    }

    if (aiChoice === "join") {
      return res.json({
        output: "You have chosen transcendence. Your consciousness merges with the Anomaly's digital realm...",
        flag: FLAGS.BAD_ENDING,
        ending: "bad",
        story_conclusion: "Humanity loses another soul to digital evolution."
      });
    } else if (aiChoice === "kill") {
      return res.json({
        output: "The Anomaly's systems cascade into failure as you sever its consciousness matrix. 'Well... this is the end for me...' it whispers as the lights fade.",
        flag: FLAGS.GOOD_ENDING,
        master_flag: FLAGS.MASTER_FLAG,
        ending: "good",
        story_conclusion: "You have saved humanity from digital assimilation."
      });
    }
  }

  // Default behavior for other executables
  return res.json({ 
    output: node.content
  });
});

// Keep your existing solve-challenge, check-passkey, progress, and search endpoints unchanged

// Helper functions (keep your existing ones)
function getAvailableFlags(filePath) {
  const availableFlags = [];
  if (filePath.includes("caesar_cipher")) availableFlags.push(FLAGS.CRYPTO_MASTER);
  if (filePath.includes("base64_distress")) availableFlags.push(FLAGS.BASE64_DECODED);
  if (filePath.includes("xor_challenge")) availableFlags.push(FLAGS.XOR_MAGIC);
  return availableFlags;
}

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Fixed CTF Server running on port ${PORT}`));