import express from "express";
import cors from "cors";
import { fs } from "./fs.js";
import dotenv from "dotenv";


const FLAG_LEVEL_1 = "CTF{snake_victory_flag}";



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
  const { path, user, score } = req.body; // 👈 score comes from client
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
  // Simon game special logic (add this after the Snake game logic)
  if (path.toLowerCase().endsWith("leave.bat")) {
    if (score !== undefined && score >= 300) {
      return res.json({
        output: "Simon Victory Achieved!",
        flag: "CTF{simon_says_flag}", // Replace with your actual flag
    });
  }
  return res.json({ output: "Loading", event: "SimonGame" }); 
  } 




  

  if (node.event) {
    return res.json({ output: "Loading", event: node.event });
  }

  res.json({ output: node.content });
});



// Start server on Render's PORT or local 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));