// server.js
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import { Sequelize, DataTypes } from "sequelize";
import nlp from "compromise";

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ---- MySQL connection via Sequelize ----
const DB_NAME = process.env.DB_NAME || "quizdb";
const DB_USER = process.env.DB_USER || "quizuser";
const DB_PASS = process.env.DB_PASS || "quizpass";
const DB_HOST = process.env.DB_HOST || "localhost";
const DB_PORT = process.env.DB_PORT || "3306";

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: "mysql",
  logging: false
});

// ---- Model ----
const Quiz = sequelize.define("Quiz", {
  question: { type: DataTypes.TEXT, allowNull: false },
  options: { type: DataTypes.TEXT, allowNull: false }, // comma-separated or JSON
  answer:  { type: DataTypes.STRING(255), allowNull: false }
});

// ---- Sync DB ----
async function init() {
  try {
    await sequelize.authenticate();
    await sequelize.sync(); // { alter: true } during development
    console.log("✅ MySQL connected & synced");
  } catch (err) {
    console.error("❌ DB connection failed:", err.message);
  }
}
init();

// ---- Routes ----
app.get("/", (req, res) => res.json({ status: "OK", message: "Quiz API running" }));

app.post("/generate-quiz", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ detail: "Text is required" });
    }

    const doc = nlp(text);
    // Try nouns first; fallback to a reasonably long word
    let nouns = doc.nouns().out("array");
    let entity = nouns.length ? nouns[0] : null;
    if (!entity) {
      const words = text.split(/\s+/).filter(w => w.replace(/[^a-zA-Z]/g, "").length > 4);
      entity = words[0] || "_____";
    }

    const question = text.replace(entity, "_____", 1);
    const distractors = ["Oxygen", "Glucose", "Hemoglobin", "Nitrogen", "Protein"];
    const options = [entity, ...distractors.filter(d => d.toLowerCase() !== entity.toLowerCase()).slice(0,3)];

    const quiz = await Quiz.create({
      question,
      options: JSON.stringify(options),
      answer: entity
    });

    res.json({ id: quiz.id, question, options, answer: entity });
  } catch (err) {
    console.error(err);
    res.status(500).json({ detail: "Server error" });
  }
});

app.get("/quizzes", async (req, res) => {
  try {
    const rows = await Quiz.findAll({ order: [["id", "DESC"]], limit: 50 });
    const out = rows.map(q => ({
      id: q.id,
      question: q.question,
      options: (() => { try { return JSON.parse(q.options); } catch { return []; } })(),
      answer: q.answer
    }));
    res.json(out);
  } catch (err) {
    console.error(err);
    res.status(500).json({ detail: "Server error" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
