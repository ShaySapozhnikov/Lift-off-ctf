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

// API: read file content (cat)
app.get("/file", (req, res) => {
  const { path, user } = req.query;
  const node = getNode(path);
  if (!node) return res.status(404).send("File not found");
  if (node.owner === "root" && user !== "root") return res.status(403).send("Permission denied");
  res.json({ content: node.content });
});

// API: list directory (ls)
app.get("/ls", (req, res) => {
  const { path, user } = req.query;
  const node = getNode(path);
  if (!node) return res.status(404).send("Directory not found");
  if (node._protected && user !== "root") return res.status(403).send("Permission denied");
  const files = Object.keys(node).filter(key => key !== "_protected");
  res.json({ files });
});

// API: execute "exe" files (run)
app.post("/run", (req, res) => {
  const { path, user, score, aiChoice } = req.body; // 👈 score and aiChoice come from client
  const node = getNode(path);
  
  if (!node) return res.status(404).json({ error: "File not found" });
  if (node.type !== "exe") return res.status(400).json({ error: "Not executable" });
  if (node.owner === "root" && user !== "root") return res.status(403).json({ error: "Permission denied" });

  // Snake special logic
  if (path.toLowerCase().endsWith("2nak3.bat")) {
    if (score !== undefined && score >= 50) {
      return res.json({
        output: "Snake Victory Achieved!",
        flag: FLAG_LEVEL_1,
      });
    }
    return res.json({ output: "Loading", event: "snakeGame" });
  }

  // Simon Says logic
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

  // AI Conversation logic for pleasedont.exe
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

// Start server on Render's PORT or local 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));