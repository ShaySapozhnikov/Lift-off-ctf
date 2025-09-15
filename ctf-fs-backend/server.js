import express from "express";
import cors from "cors";
import { fs } from "./fs.js";
import dotenv from "dotenv";

// Flag definitions
const FLAGS = {
  SNAKE_VICTORY: "CTF{snake_victory_flag}",
  SIMON_VICTORY: "CTF{simon_says_flag}",
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
    case 'r': 
      return permissions.includes('r');
    case 'w': 
      return permissions.includes('w');
    case 'x': 
      return permissions.includes('x') || node.type === 'exe';
    default: 
      return false;
  }
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

// API: read file content
app.get("/file", (req, res) => {
  const { path, user, passkey } = req.query;
  
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
  });
});

// API: list directory
app.get("/ls", (req, res) => {
  const { path, user, showHidden } = req.query;
  
  const node = getNode(path);
  
  if (!node) return res.status(404).send("Directory not found");
  
  if (!hasPermission(node, user, 'r')) {
    return res.status(403).json({ 
      error: "Directory access denied"
    });
  }
  
  let files = Object.keys(node).filter(key => !key.startsWith("_"));
  
  // Filter files based on user permissions and hidden status
  const visibleFiles = files.filter(filename => {
    const childNode = node[filename];
    if (!childNode) return false;
    
    // Check if file is hidden and if we should show hidden files
    if (childNode.hidden && !showHidden) return false;
    
    // Check if user has read permissions for this file
    return hasPermission(childNode, user, 'r');
  }).map(filename => {
    const childNode = node[filename];
    return {
      name: filename,
      type: childNode.type || 'file',
      permissions: childNode.permissions || 'r',
      hidden: childNode.hidden || false,
      size: childNode.content ? childNode.content.length : 0
    };
  });
  
  res.json({ files: visibleFiles });
});

// API: execute files
app.post("/run", (req, res) => {
  const { path, user, score, aiChoice, passkey, solution } = req.body;
  
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

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Simplified CTF Server running on port ${PORT}`));