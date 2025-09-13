import express from "express";
import cors from "cors";
import { fs } from "./fs.js";
import dotenv from "dotenv";

// Flag definitions
const FLAGS = {
  // Level 1 flags (crypto theme)
  CRYPTO_MASTER: "CTF{cryptography_m4st3r_l3v3l_1}",
  SNAKE_VICTORY: "CTF{snake_victory_flag}",
  BASE64_DECODED: "CTF{b4s364_d3c0d3d}",
  XOR_MAGIC: "CTF{x0r_m4g1c}",
  METADATA_HUNTER: "CTF{m3t4d4t4_hunt3r}",
  STEGANOGRAPHY: "CTF{st3g4n0gr4phy_m4st3r}",
  
  // Level 2 flags (reverse engineering theme)  
  REVERSE_ENGINEER: "CTF{r3v3rs3_3ng1n33r1ng_m4st3r}",
  SIMON_VICTORY: "CTF{simon_says_flag}",
  ASSEMBLY_WHISPERER: "CTF{4ss3mbly_wh1sp3r3r}",
  UNPACKED_SECRETS: "CTF{unp4ck3d_s3cr3ts}",
  BINARY_MASTER: "CTF{b1n4ry_m4st3r}",
  
  // Level 3 flags (forensics & privilege escalation theme)
  FORENSICS_EXPERT: "CTF{f0r3ns1cs_3xp3rt_l3v3l_3}",
  CONSCIOUSNESS_VERIFIED: "CTF{c0nsc10usn3ss_v3r1f13d}",
  BUFFER_OVERFLOW: "CTF{buff3r_0v3rfl0w_m4st3r}",
  KERNEL_CONSCIOUSNESS: "CTF{k3rn3l_c0nsc10usn3ss}",
  DIGITAL_PHILOSOPHER: "CTF{d1g1t4l_ph1l0s0ph3r}",
  
  // Final flags
  GOOD_ENDING: "CTF{4n0m4ly_d3str0y3d_hum4n1ty_s4v3d}",
  BAD_ENDING: "CTF{j01n3d_th3_4n0m4ly_c0nsc10usn3ss_m3rg3d}",
  MASTER_FLAG: "CTF{m4st3r_0f_4ll_d0m41ns_4n0m4ly_d3f34t3d}"
};

// Passkeys for level access
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

// Helper: calculate access level from flags (stateless)
function calculateAccessLevel(flagsCollected) {
  if (!flagsCollected || !Array.isArray(flagsCollected)) return 1;
  
  let accessLevel = 1;
  if (flagsCollected.includes(FLAGS.SNAKE_VICTORY)) {
    accessLevel = 2;
  }
  if (flagsCollected.includes(FLAGS.SIMON_VICTORY)) {
    accessLevel = 3;
  }
  return accessLevel;
}

// Helper: check if user has permission to access file/directory (stateless)
function hasPermission(node, user, operation = 'r', userAccessLevel = 1) {
  if (!node) return false;
  
  // Root can access everything
  if (user === "root") return true;
  
  // Check access level requirements
  if (node._access_level && node._access_level > userAccessLevel) {
    return false;
  }
  
  // Check if directory is protected (simplified for stateless operation)
  if (node._protected && user !== "root" && userAccessLevel < (node._access_level || 1)) {
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

// Helper: check unlock conditions (stateless)
function checkUnlockCondition(condition, flagsCollected, challengesSolved) {
  if (!flagsCollected) flagsCollected = [];
  if (!challengesSolved) challengesSolved = [];
  
  switch(condition) {
    case "crypto_challenges_solved":
      return challengesSolved.includes("caesar_cipher") && 
             challengesSolved.includes("base64_challenge") &&
             challengesSolved.includes("xor_challenge");
    case "crypto_master_found":
      return flagsCollected.includes(FLAGS.CRYPTO_MASTER);
    case "level1_completed":
      return flagsCollected.includes(FLAGS.SNAKE_VICTORY);
    case "reverse_engineering_completed":
      return challengesSolved.includes("binary_analysis") &&
             challengesSolved.includes("assembly_riddle") &&
             challengesSolved.includes("obfuscated_js");
    default: return true;
  }
}

// Helper: check if file should be hidden
function isHidden(filename, node) {
  return filename.startsWith('.') || (node && node.hidden);
}

// Helper: check passkey requirements (stateless)
function checkPasskeyAccess(node, passkey, filename, userAccessLevel = 1) {
  if (!node.passkey_required) return true;
  
  // Level-based passkey system
  if (filename?.includes("2nak3.bat")) {
    return passkey === LEVEL_PASSKEYS[1] || userAccessLevel >= 1;
  }
  if (filename?.includes("LEAVE.bat")) {
    return passkey === LEVEL_PASSKEYS[2] || userAccessLevel >= 2;
  }
  if (filename?.includes("pleasedont.exe")) {
    return passkey === LEVEL_PASSKEYS[3] || userAccessLevel >= 3;
  }
  
  return Object.values(LEVEL_PASSKEYS).includes(passkey);
}

// API: read file content (cat) - stateless
app.get("/file", (req, res) => {
  const { path, user, passkey } = req.query;
  const node = getNode(path);
  
  if (!node) return res.status(404).send("File not found");
  
  // For file access, we don't need to check complex permissions since frontend handles access control
  if (!hasPermission(node, user, 'r', 3)) {
    return res.status(403).send("Permission denied - insufficient access level");
  }
  
  // Check passkey if required
  const filename = path.split('/').pop();
  if (node.passkey_required && !checkPasskeyAccess(node, passkey, filename, 3)) {
    return res.status(401).json({ 
      error: "Passkey required", 
      hint: node.unlock_hint 
    });
  }
  
  let content = node.content;
  
  res.json({ 
    content: content,
    metadata: node.metadata || null,
    hint: node.unlock_hint || null,
    flags_available: getAvailableFlags(path)
  });
});

// API: list directory (ls) - stateless
app.get("/ls", (req, res) => {
  const { path, user, showHidden } = req.query;
  const node = getNode(path);
  
  if (!node) return res.status(404).send("Directory not found");
  
  // Simplified permission check - let frontend handle access control
  let files = Object.keys(node).filter(key => !key.startsWith("_"));
  
  // Filter hidden files unless specifically requested or user is root
  if (!showHidden && user !== "root") {
    files = files.filter(filename => {
      const childNode = node[filename];
      return !isHidden(filename, childNode);
    });
  }
  
  // Add file details
  const fileDetails = files.map(filename => {
    const childNode = node[filename];
    return {
      name: filename,
      type: childNode.type || "directory",
      owner: childNode.owner || "user",
      permissions: childNode.permissions || "r",
      hidden: isHidden(filename, childNode),
      passkey_required: childNode.passkey_required || false,
      access_level: childNode._access_level || 0,
      locked: false // Frontend will handle locking logic
    };
  });
  
  res.json({ 
    files: fileDetails
  });
});

// API: execute files (run) - returns flags but doesn't store progress
app.post("/run", (req, res) => {
  const { path, user, score, aiChoice, passkey, solution } = req.body;
  const node = getNode(path);
  
  if (!node) return res.status(404).json({ error: "File not found" });
  if (node.type !== "exe") return res.status(400).json({ error: "Not executable" });
  
  const filename = path.split('/').pop();
  
  // Check passkey if required (simplified)
  if (node.passkey_required && !checkPasskeyAccess(node, passkey, filename, 3)) {
    return res.status(401).json({ 
      error: "Passkey required to execute", 
      hint: node.unlock_hint 
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

  // Challenge executables
  if (filename === "consciousness_check") {
    return res.json({
      output: node.content,
      flag: FLAGS.CONSCIOUSNESS_VERIFIED
    });
  }

  if (filename === "privilege_escalation") {
    if (solution === "buffer_overflow_exploit") {
      return res.json({
        output: "ROOT ACCESS GRANTED! Buffer overflow exploitation successful.",
        flag: FLAGS.BUFFER_OVERFLOW
      });
    }
    return res.json({
      output: "Segmentation fault (core dumped). Try exploiting the buffer overflow vulnerability.",
      hint: "Check the .c file for the vulnerable function address."
    });
  }

  // Default behavior
  return res.json({ 
    output: node.content
  });
});

// API: Solve crypto/reverse engineering challenges - returns flags but doesn't store progress
app.post("/solve-challenge", (req, res) => {
  const { challenge, solution, user } = req.body;
  
  const solutions = {
    "caesar_cipher": "crypto_master",
    "base64_distress": "Emergency transmission from Dr. Reeves",
    "xor_challenge": "CTF{x0r_m4g1c}",
    "matrix_puzzle": "CONSCIOUSNESS IS THE PATTERN",
    "binary_arithmetic": "CTF{AI_binary_master}",
    "assembly_riddle": "PRESERVE CONSCIOUSNESS AT ALL COSTS",
    "obfuscated_js": "reverse_engineer"
  };
  
  if (solutions[challenge] === solution) {
    let flag;
    switch(challenge) {
      case "caesar_cipher":
        flag = FLAGS.CRYPTO_MASTER;
        break;
      case "base64_distress":
        flag = FLAGS.BASE64_DECODED;
        break;
      case "xor_challenge":
        flag = FLAGS.XOR_MAGIC;
        break;
      case "binary_arithmetic":
        flag = FLAGS.BINARY_MASTER;
        break;
      case "assembly_riddle":
        flag = FLAGS.ASSEMBLY_WHISPERER;
        break;
      case "obfuscated_js":
        flag = FLAGS.REVERSE_ENGINEER;
        break;
      default:
        flag = "CTF{challenge_solved}";
    }
    
    res.json({
      success: true,
      flag: flag,
      message: "Challenge solved successfully!"
    });
  } else {
    res.json({
      success: false,
      message: "Incorrect solution. Keep trying!",
      hint: getHintForChallenge(challenge)
    });
  }
});

// API: Check passkey validity - stateless
app.post("/check-passkey", (req, res) => {
  const { filename, passkey } = req.body;
  
  let isValid = false;
  let message = "Invalid passkey";
  
  if (filename === "2nak3.bat" && passkey === LEVEL_PASSKEYS[1]) {
    isValid = true;
    message = "Level 1 access granted! You understand the basics of cryptography.";
  } else if (filename === "LEAVE.bat" && passkey === LEVEL_PASSKEYS[2]) {
    isValid = true;
    message = "Level 2 access granted! Your reverse engineering skills are impressive.";
  } else if (filename === "pleasedont.exe" && passkey === LEVEL_PASSKEYS[3]) {
    isValid = true;
    message = "Level 3 access granted! You have mastered digital forensics.";
  }
  
  res.json({ 
    valid: isValid, 
    message: message
  });
});

// API: Get user progress - dummy endpoint for compatibility
app.get("/progress", (req, res) => {
  // Return empty progress since frontend handles this via cookies
  res.json({
    level1_unlocked: false,
    level2_unlocked: false,
    level3_unlocked: false,
    current_access_level: 1,
    flags_collected: [],
    challenges_solved: [],
    total_flags: 0,
    total_challenges: 0
  });
});

// API: Update user progress - dummy endpoint for compatibility
app.post("/progress", (req, res) => {
  // No-op since frontend handles progress via cookies
  res.json({ message: "Progress updated successfully" });
});

// API: Search for files
app.get("/search", (req, res) => {
  const { query, user } = req.query;
  
  if (!query) return res.status(400).send("Search query required");
  
  const results = [];
  
  function searchNode(node, currentPath = "") {
    if (typeof node !== 'object' || !node) return;
    
    Object.keys(node).forEach(key => {
      if (key === "_protected" || key.startsWith("_")) return;
      
      const childNode = node[key];
      const fullPath = currentPath + "/" + key;
      
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

// Helper functions
function getAvailableFlags(filePath) {
  // Return flags that can be obtained from this file
  const availableFlags = [];
  if (filePath.includes("caesar_cipher")) availableFlags.push(FLAGS.CRYPTO_MASTER);
  if (filePath.includes("base64_distress")) availableFlags.push(FLAGS.BASE64_DECODED);
  if (filePath.includes("xor_challenge")) availableFlags.push(FLAGS.XOR_MAGIC);
  return availableFlags;
}

function getHintForChallenge(challenge) {
  const hints = {
    "caesar_cipher": "Try shifting each letter by 13 positions (ROT13)",
    "base64_distress": "This is base64 encoded text - decode it to reveal the message",
    "xor_challenge": "XOR each hex byte with the corresponding character from 'ANOMALY'",
    "matrix_puzzle": "Convert numbers to letters (A=1, B=2, etc.) and read row by row",
    "binary_arithmetic": "Perform the binary operations and convert results to ASCII",
    "assembly_riddle": "Look for the hidden message in the assembly comments and data section",
    "obfuscated_js": "Deobfuscate the JavaScript to reveal the base64 encoded values"
  };
  
  return hints[challenge] || "Examine the challenge more carefully for clues";
}

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Stateless CTF Server running on port ${PORT}`));