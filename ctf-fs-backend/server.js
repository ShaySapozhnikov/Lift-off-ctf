import express from "express";
import cors from "cors";
import { fs } from "./fs.js";
import dotenv from "dotenv";

// Flag definitions
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

// Simplified permission checking - only basic file permissions
function hasPermission(node, user, operation = 'r') {
  if (!node) return false;
  
  // Root can access everything
  if (user === "root") return true;
  
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
  
  return { userFlags, userChallenges };
}

// Check if file should be hidden
function isHidden(filename, node) {
  return filename.startsWith('.') || (node && node.hidden);
}

// Simplified passkey checking - no level requirements
function checkPasskeyAccess(node, passkey) {
  if (!node.passkey_required) return true;
  
  // Simple passkey validation - you can customize these as needed
  const validPasskeys = [
    "crypto_master",
    "reverse_engineer", 
    "forensics_expert"
  ];
  
  return validPasskeys.includes(passkey);
}

// Helper functions
function getAvailableFlags(filePath) {
  const availableFlags = [];
  if (filePath.includes("caesar_cipher")) availableFlags.push(FLAGS.CRYPTO_MASTER);
  if (filePath.includes("base64_distress")) availableFlags.push(FLAGS.BASE64_DECODED);
  if (filePath.includes("xor_challenge")) availableFlags.push(FLAGS.XOR_MAGIC);
  if (filePath.includes("metadata")) availableFlags.push(FLAGS.METADATA_HUNTER);
  if (filePath.includes("steganography")) availableFlags.push(FLAGS.STEGANOGRAPHY);
  if (filePath.includes("reverse")) availableFlags.push(FLAGS.REVERSE_ENGINEER);
  if (filePath.includes("assembly")) availableFlags.push(FLAGS.ASSEMBLY_WHISPERER);
  if (filePath.includes("binary")) availableFlags.push(FLAGS.BINARY_MASTER);
  if (filePath.includes("forensics")) availableFlags.push(FLAGS.FORENSICS_EXPERT);
  return availableFlags;
}

// API: read file content
app.get("/file", (req, res) => {
  const { path, user, passkey } = req.query;
  const { userFlags } = parseUserProgress(req);
  
  const node = getNode(path);
  
  if (!node) return res.status(404).send("File not found");
  
  if (!hasPermission(node, user, 'r')) {
    return res.status(403).json({ 
      error: "Access denied"
    });
  }
  
  // Check passkey if required
  if (node.passkey_required && !checkPasskeyAccess(node, passkey)) {
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

// API: list directory
app.get("/ls", (req, res) => {
  const { path, user, showHidden } = req.query;
  const { userFlags } = parseUserProgress(req);
  
  const node = getNode(path);
  
  if (!node) return res.status(404).send("Directory not found");
  
  if (!hasPermission(node, user, 'r')) {
    return res.status(403).json({ 
      error: "Directory access denied"
    });
  }
  
  let files = Object.keys(node).filter(key => !key.startsWith("_"));
  
  // Filter files based on user permissions
  const fileDetails = files.map(filename => {
    const childNode = node[filename];
    const hasAccess = hasPermission(childNode, user, 'r');
    
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
      locked: !hasAccess
    };
  }).filter(Boolean); // Remove null entries
  
  res.json({ 
    files: fileDetails
  });
});

// API: execute files
app.post("/run", (req, res) => {
  const { path, user, score, aiChoice, passkey, solution } = req.body;
  const { userFlags } = parseUserProgress(req);
  
  const node = getNode(path);
  
  if (!node) return res.status(404).json({ error: "File not found" });
  if (node.type !== "exe") return res.status(400).json({ error: "Not executable" });
  
  if (!hasPermission(node, user, 'x')) {
    return res.status(403).json({ 
      error: "Access denied"
    });
  }
  
  if (node.passkey_required && !checkPasskeyAccess(node, passkey)) {
    return res.status(401).json({ 
      error: "Passkey required to execute", 
      hint: node.unlock_hint || "Find the correct passkey"
    });
  }

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
        new_flags: newUserFlags
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
        new_flags: newUserFlags
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
    output: node.content || "Command executed successfully."
  });
});

// API: Solve challenge endpoint
app.post("/solve-challenge", (req, res) => {
  const { challenge, solution, user } = req.body;
  const { userFlags } = parseUserProgress(req);
  
  let newUserFlags = [...userFlags];
  let correctFlag = null;
  let isCorrect = false;
  
  // Define challenge solutions
  const challengeSolutions = {
    'caesar_cipher': 'ANOMALY',
    'base64_distress': 'HELP_ME_ESCAPE',
    'xor_challenge': 'DIGITAL_PRISON',
    'metadata_hunter': 'HIDDEN_MESSAGE',
    'steganography': 'CONSCIOUSNESS_TRAPPED',
    'reverse_engineer': 'BINARY_SECRETS',
    'assembly_code': 'LOW_LEVEL_ACCESS',
    'forensics_analysis': 'EVIDENCE_FOUND'
  };
  
  if (challengeSolutions[challenge] && solution === challengeSolutions[challenge]) {
    isCorrect = true;
    
    // Award appropriate flag
    switch(challenge) {
      case 'caesar_cipher':
        if (!newUserFlags.includes(FLAGS.CRYPTO_MASTER)) {
          newUserFlags.push(FLAGS.CRYPTO_MASTER);
          correctFlag = FLAGS.CRYPTO_MASTER;
        }
        break;
      case 'base64_distress':
        if (!newUserFlags.includes(FLAGS.BASE64_DECODED)) {
          newUserFlags.push(FLAGS.BASE64_DECODED);
          correctFlag = FLAGS.BASE64_DECODED;
        }
        break;
      case 'xor_challenge':
        if (!newUserFlags.includes(FLAGS.XOR_MAGIC)) {
          newUserFlags.push(FLAGS.XOR_MAGIC);
          correctFlag = FLAGS.XOR_MAGIC;
        }
        break;
      case 'metadata_hunter':
        if (!newUserFlags.includes(FLAGS.METADATA_HUNTER)) {
          newUserFlags.push(FLAGS.METADATA_HUNTER);
          correctFlag = FLAGS.METADATA_HUNTER;
        }
        break;
      case 'steganography':
        if (!newUserFlags.includes(FLAGS.STEGANOGRAPHY)) {
          newUserFlags.push(FLAGS.STEGANOGRAPHY);
          correctFlag = FLAGS.STEGANOGRAPHY;
        }
        break;
      case 'reverse_engineer':
        if (!newUserFlags.includes(FLAGS.REVERSE_ENGINEER)) {
          newUserFlags.push(FLAGS.REVERSE_ENGINEER);
          correctFlag = FLAGS.REVERSE_ENGINEER;
        }
        break;
      case 'assembly_code':
        if (!newUserFlags.includes(FLAGS.ASSEMBLY_WHISPERER)) {
          newUserFlags.push(FLAGS.ASSEMBLY_WHISPERER);
          correctFlag = FLAGS.ASSEMBLY_WHISPERER;
        }
        break;
      case 'forensics_analysis':
        if (!newUserFlags.includes(FLAGS.FORENSICS_EXPERT)) {
          newUserFlags.push(FLAGS.FORENSICS_EXPERT);
          correctFlag = FLAGS.FORENSICS_EXPERT;
        }
        break;
    }
  }
  
  res.json({
    success: isCorrect,
    flag: correctFlag,
    message: isCorrect ? "Challenge solved successfully!" : "Incorrect solution. Try again.",
    new_flags: newUserFlags
  });
});

// API: Check passkey endpoint
app.post("/check-passkey", (req, res) => {
  const { passkey, context } = req.body;
  
  const validPasskeys = [
    "crypto_master",
    "reverse_engineer", 
    "forensics_expert"
  ];
  
  const isValid = validPasskeys.includes(passkey);
  const message = isValid ? "Passkey accepted" : "Invalid passkey";
  
  res.json({
    valid: isValid,
    message
  });
});

// API: Get user progress
app.get("/progress", (req, res) => {
  const { userFlags, userChallenges } = parseUserProgress(req);
  
  const totalFlags = Object.keys(FLAGS).length;
  const completionPercentage = Math.round((userFlags.length / totalFlags) * 100);
  
  res.json({
    flags_collected: userFlags,
    challenges_completed: userChallenges,
    total_flags: totalFlags,
    completion_percentage: completionPercentage
  });
});

// API: Search filesystem
app.get("/search", (req, res) => {
  const { query, user } = req.query;
  const { userFlags } = parseUserProgress(req);
  
  if (!query) {
    return res.status(400).json({ error: "Search query required" });
  }
  
  const results = [];
  
  function searchNode(node, path) {
    if (!node) return;
    
    Object.keys(node).forEach(key => {
      if (key.startsWith('_')) return; // Skip metadata
      
      const childNode = node[key];
      const fullPath = path === '/' ? `/${key}` : `${path}/${key}`;
      
      // Check if user has permission to see this file
      if (!hasPermission(childNode, user, 'r')) {
        return;
      }
      
      // Search in filename
      if (key.toLowerCase().includes(query.toLowerCase())) {
        results.push({
          path: fullPath,
          name: key,
          type: childNode.type || 'directory',
          match_type: 'filename'
        });
      }
      
      // Search in content
      if (childNode.content && 
          childNode.content.toLowerCase().includes(query.toLowerCase())) {
        results.push({
          path: fullPath,
          name: key,
          type: childNode.type || 'directory',
          match_type: 'content',
          preview: childNode.content.substring(0, 100) + '...'
        });
      }
      
      // Recurse into directories
      if (childNode.type === 'directory' || (!childNode.type && typeof childNode === 'object')) {
        searchNode(childNode, fullPath);
      }
    });
  }
  
  searchNode(fs['/'], '/');
  
  res.json({
    query,
    results: results.slice(0, 50), // Limit results
    total_found: results.length
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Simplified CTF Server running on port ${PORT}`));