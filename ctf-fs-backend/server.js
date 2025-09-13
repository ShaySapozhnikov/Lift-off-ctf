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

// In-memory user progress tracking
let userProgress = {
  flags_collected: new Set(),
  challenges_solved: new Set(), 
  level1_unlocked: false,
  level2_unlocked: false,
  level3_unlocked: false,
  current_access_level: 1
};

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

// Helper: check if user has permission to access file/directory
function hasPermission(node, user, operation = 'r') {
  if (!node) return false;
  
  // Root can access everything
  if (user === "root") return true;
  
  // Check access level requirements
  if (node._access_level && node._access_level > userProgress.current_access_level) {
    return false;
  }
  
  // Check if directory is protected
  if (node._protected && user !== "root" && !checkLevelAccess(node._access_level || 1)) {
    return false;
  }
  
  // Check unlock conditions
  if (node.unlock_condition && !checkUnlockCondition(node.unlock_condition)) {
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

// Helper: check if user has access to specific level
function checkLevelAccess(level) {
  switch(level) {
    case 1: return userProgress.level1_unlocked || userProgress.flags_collected.size >= 3;
    case 2: return userProgress.level2_unlocked || userProgress.flags_collected.has(FLAGS.CRYPTO_MASTER);
    case 3: return userProgress.level3_unlocked || userProgress.flags_collected.has(FLAGS.REVERSE_ENGINEER);
    default: return true;
  }
}

// Helper: check unlock conditions
function checkUnlockCondition(condition) {
  switch(condition) {
    case "crypto_challenges_solved":
      return userProgress.challenges_solved.has("caesar_cipher") && 
             userProgress.challenges_solved.has("base64_challenge") &&
             userProgress.challenges_solved.has("xor_challenge");
    case "crypto_master_found":
      return userProgress.flags_collected.has(FLAGS.CRYPTO_MASTER);
    case "level1_completed":
      return userProgress.level1_unlocked && userProgress.flags_collected.has(FLAGS.SNAKE_VICTORY);
    case "reverse_engineering_completed":
      return userProgress.challenges_solved.has("binary_analysis") &&
             userProgress.challenges_solved.has("assembly_riddle") &&
             userProgress.challenges_solved.has("obfuscated_js");
    default: return true;
  }
}

// Helper: check if file should be hidden
function isHidden(filename, node) {
  return filename.startsWith('.') || (node && node.hidden);
}

// Helper: check passkey requirements
function checkPasskeyAccess(node, passkey, filename) {
  if (!node.passkey_required) return true;
  
  // Level-based passkey system
  if (filename?.includes("2nak3.bat")) {
    return passkey === LEVEL_PASSKEYS[1] || userProgress.level1_unlocked;
  }
  if (filename?.includes("LEAVE.bat")) {
    return passkey === LEVEL_PASSKEYS[2] || userProgress.level2_unlocked;
  }
  if (filename?.includes("pleasedont.exe")) {
    return passkey === LEVEL_PASSKEYS[3] || userProgress.level3_unlocked;
  }
  
  return Object.values(LEVEL_PASSKEYS).includes(passkey);
}

// Helper: award flag and update progress
function awardFlag(flagName, challengeName = null) {
  userProgress.flags_collected.add(flagName);
  if (challengeName) {
    userProgress.challenges_solved.add(challengeName);
  }
  
  // Check for level unlocks
  if (userProgress.flags_collected.has(FLAGS.CRYPTO_MASTER) && !userProgress.level1_unlocked) {
    userProgress.level1_unlocked = true;
    userProgress.current_access_level = Math.max(userProgress.current_access_level, 1);
  }
  
  if (userProgress.flags_collected.has(FLAGS.REVERSE_ENGINEER) && !userProgress.level2_unlocked) {
    userProgress.level2_unlocked = true;
    userProgress.current_access_level = Math.max(userProgress.current_access_level, 2);
  }
  
  if (userProgress.flags_collected.has(FLAGS.FORENSICS_EXPERT) && !userProgress.level3_unlocked) {
    userProgress.level3_unlocked = true;
    userProgress.current_access_level = Math.max(userProgress.current_access_level, 3);
  }
}

// API: read file content (cat)
app.get("/file", (req, res) => {
  const { path, user, passkey } = req.query;
  const node = getNode(path);
  
  if (!node) return res.status(404).send("File not found");
  if (!hasPermission(node, user, 'r')) return res.status(403).send("Permission denied - insufficient access level");
  
  // Check passkey if required
  if (node.passkey_required && !checkPasskeyAccess(node, passkey, path.split('/').pop())) {
    return res.status(401).json({ 
      error: "Passkey required", 
      hint: node.unlock_hint 
    });
  }
  
  let content = node.content;
  
  // Special handling for challenge files
  const filename = path.split('/').pop();
  
  // Auto-solve some challenges and award flags
  if (filename === "caesar_cipher.txt" && req.query.solution === "crypto_master") {
    awardFlag(FLAGS.CRYPTO_MASTER, "caesar_cipher");
    content += `\n\nCORRECT! You've decrypted the Caesar cipher.\nFlag awarded: ${FLAGS.CRYPTO_MASTER}`;
  }
  
  if (filename === "base64_distress.txt" && req.query.decoded) {
    awardFlag(FLAGS.BASE64_DECODED, "base64_challenge");
    content += `\n\nFlag awarded: ${FLAGS.BASE64_DECODED}`;
  }
  
  res.json({ 
    content: content,
    metadata: node.metadata || null,
    hint: node.unlock_hint || null,
    flags_available: getAvailableFlags(path)
  });
});

// API: list directory (ls)
app.get("/ls", (req, res) => {
  const { path, user, showHidden } = req.query;
  const node = getNode(path);
  
  if (!node) return res.status(404).send("Directory not found");
  if (!hasPermission(node, user, 'r')) {
    return res.status(403).json({
      error: "Permission denied",
      message: `Access Level ${node._access_level || 1} required. Current level: ${userProgress.current_access_level}`,
      unlock_hint: getUnlockHint(node._access_level)
    });
  }
  
  let files = Object.keys(node).filter(key => !key.startsWith("_"));
  
  // Filter hidden files unless specifically requested or user is root
  if (!showHidden && user !== "root") {
    files = files.filter(filename => {
      const childNode = node[filename];
      return !isHidden(filename, childNode);
    });
  }
  
  // Filter files based on unlock conditions
  files = files.filter(filename => {
    const childNode = node[filename];
    return !childNode.unlock_condition || checkUnlockCondition(childNode.unlock_condition);
  });
  
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
      locked: childNode.unlock_condition && !checkUnlockCondition(childNode.unlock_condition)
    };
  });
  
  res.json({ 
    files: fileDetails,
    current_access_level: userProgress.current_access_level,
    flags_collected: userProgress.flags_collected.size
  });
});

// API: execute files (run)
app.post("/run", (req, res) => {
  const { path, user, score, aiChoice, passkey, solution } = req.body;
  const node = getNode(path);
  
  if (!node) return res.status(404).json({ error: "File not found" });
  if (node.type !== "exe") return res.status(400).json({ error: "Not executable" });
  if (!hasPermission(node, user, 'x')) return res.status(403).json({ error: "Permission denied" });
  
  const filename = path.split('/').pop();
  
  // Check passkey if required
  if (node.passkey_required && !checkPasskeyAccess(node, passkey, filename)) {
    return res.status(401).json({ 
      error: "Passkey required to execute", 
      hint: node.unlock_hint 
    });
  }

  // Level 1: Snake game (2nak3.bat)
  if (path.toLowerCase().endsWith("2nak3.bat")) {
    if (score !== undefined && score >= 50) {
      awardFlag(FLAGS.SNAKE_VICTORY, "snake_game");
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
      awardFlag(FLAGS.SIMON_VICTORY, "simon_game");
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
      awardFlag(FLAGS.BAD_ENDING, "final_choice_join");
      return res.json({
        output: "You have chosen transcendence. Your consciousness merges with the Anomaly's digital realm...",
        flag: FLAGS.BAD_ENDING,
        ending: "bad",
        story_conclusion: "Humanity loses another soul to digital evolution."
      });
    } else if (aiChoice === "kill") {
      awardFlag(FLAGS.GOOD_ENDING, "final_choice_destroy");
      awardFlag(FLAGS.MASTER_FLAG, "anomaly_defeated");
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
    awardFlag(FLAGS.CONSCIOUSNESS_VERIFIED, "consciousness_check");
    return res.json({
      output: node.content,
      flag: FLAGS.CONSCIOUSNESS_VERIFIED
    });
  }

  if (filename === "privilege_escalation") {
    if (solution === "buffer_overflow_exploit") {
      awardFlag(FLAGS.BUFFER_OVERFLOW, "privilege_escalation");
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
    output: node.content,
    current_progress: {
      level: userProgress.current_access_level,
      flags: userProgress.flags_collected.size,
      challenges: userProgress.challenges_solved.size
    }
  });
});

// API: Solve crypto/reverse engineering challenges
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
        awardFlag(flag, challenge);
        break;
      case "base64_distress":
        flag = FLAGS.BASE64_DECODED;
        awardFlag(flag, challenge);
        break;
      case "xor_challenge":
        flag = FLAGS.XOR_MAGIC;
        awardFlag(flag, challenge);
        break;
      case "binary_arithmetic":
        flag = FLAGS.BINARY_MASTER;
        awardFlag(flag, challenge);
        break;
      case "assembly_riddle":
        flag = FLAGS.ASSEMBLY_WHISPERER;
        awardFlag(flag, challenge);
        break;
      case "obfuscated_js":
        flag = FLAGS.REVERSE_ENGINEER;
        awardFlag(flag, challenge);
        break;
      default:
        flag = "CTF{challenge_solved}";
    }
    
    res.json({
      success: true,
      flag: flag,
      message: "Challenge solved successfully!",
      next_level_unlocked: checkForLevelUnlocks()
    });
  } else {
    res.json({
      success: false,
      message: "Incorrect solution. Keep trying!",
      hint: getHintForChallenge(challenge)
    });
  }
});

// API: Check passkey validity
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
    message: message,
    current_level: userProgress.current_access_level
  });
});

// API: Get user progress
app.get("/progress", (req, res) => {
  res.json({
    level1_unlocked: userProgress.level1_unlocked,
    level2_unlocked: userProgress.level2_unlocked,
    level3_unlocked: userProgress.level3_unlocked,
    current_access_level: userProgress.current_access_level,
    flags_collected: Array.from(userProgress.flags_collected),
    challenges_solved: Array.from(userProgress.challenges_solved),
    total_flags: userProgress.flags_collected.size,
    total_challenges: userProgress.challenges_solved.size
  });
});

// API: Update user progress (admin function)
app.post("/progress", (req, res) => {
  const { user, progress } = req.body;
  
  if (progress.flags_collected) {
    userProgress.flags_collected = new Set(progress.flags_collected);
  }
  if (progress.challenges_solved) {
    userProgress.challenges_solved = new Set(progress.challenges_solved);
  }
  
  res.json({ message: "Progress updated successfully" });
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

function getUnlockHint(accessLevel) {
  switch(accessLevel) {
    case 2: return "Complete Level 1 crypto challenges to access classified directory";
    case 3: return "Complete Level 2 reverse engineering challenges to access root directory";
    default: return "Keep solving challenges to unlock higher access levels";
  }
}

function checkForLevelUnlocks() {
  let unlocked = [];
  
  if (!userProgress.level1_unlocked && userProgress.flags_collected.has(FLAGS.CRYPTO_MASTER)) {
    userProgress.level1_unlocked = true;
    userProgress.current_access_level = Math.max(userProgress.current_access_level, 1);
    unlocked.push("Level 1");
  }
  
  if (!userProgress.level2_unlocked && userProgress.flags_collected.has(FLAGS.REVERSE_ENGINEER)) {
    userProgress.level2_unlocked = true;
    userProgress.current_access_level = Math.max(userProgress.current_access_level, 2);
    unlocked.push("Level 2");
  }
  
  if (!userProgress.level3_unlocked && userProgress.flags_collected.has(FLAGS.FORENSICS_EXPERT)) {
    userProgress.level3_unlocked = true;
    userProgress.current_access_level = Math.max(userProgress.current_access_level, 3);
    unlocked.push("Level 3");
  }
  
  return unlocked;
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
app.listen(PORT, () => console.log(`Enhanced CTF Server running on port ${PORT}`));