import express, { Request, Response } from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import crypto from "crypto";
import cors from "cors"; // ← import cors

import { Category } from "./models/category";
import { Question } from "./models/question";

dotenv.config();
const app = express();

// ── MIDDLEWARE ───────────────────────────────────────────────────────────────

// Enable CORS on all routes
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// ── HELPERS ──────────────────────────────────────────────────────────────────

const hashAnswer = (s: string) =>
  crypto.createHash("sha256").update(s).digest("hex");

// ── ROUTES ───────────────────────────────────────────────────────────────────

/**
 * 1) Health check
 */
app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

/**
 * 2) GET /categories
 *    Only return categories that have ≥1 question in the database.
 */
app.get("/categories", async (_req: Request, res: Response) => {
  try {
    // find all distinct categoryId values present in Question collection
    const nonEmptyIds = await Question.distinct("categoryId"); // e.g. [9, 14, ...]

    // fetch only those Category docs whose apiId is in nonEmptyIds
    const cats = await Category.find({ apiId: { $in: nonEmptyIds } }).select(
      "apiId name -_id"
    );

    res.json(cats);
  } catch (err) {
    console.error("Error fetching /categories:", err);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

/**
 * 3) GET /categories/meta
 *    Return every category plus which difficulty‐levels have at least one question.
 */
app.get("/categories/meta", async (_req: Request, res: Response) => {
  try {
    // Step 1: Aggregate Question collection by categoryId & difficulty
    const diffAgg = await Question.aggregate([
      { $group: { _id: { cat: "$categoryId", diff: "$difficulty" } } },
      { $group: { _id: "$_id.cat", diffs: { $addToSet: "$_id.diff" } } },
    ]);
    // diffAgg example: [ { _id: 9, diffs: ["easy","hard"] }, { _id: 12, diffs: ["medium"] }, ... ]

    // Step 2: Fetch all categories from Category collection (lean() → plain objects)
    const cats = await Category.find().lean();

    // Step 3: Merge in the `available` difficulties from diffAgg
    const merged = cats.map((c) => {
      const hit = diffAgg.find((d) => d._id === c.apiId);
      return {
        apiId: c.apiId,
        name: c.name,
        available: hit?.diffs ?? [], // if no entry in diffAgg, `available` is empty
      };
    });

    res.json(merged);
  } catch (err) {
    console.error("Error building /categories/meta:", err);
    res.status(500).json({ error: "Failed to build meta" });
  }
});

/**
 * 4) GET /quiz?category=<number>&difficulty=<easy|medium|hard>&amount=<number>
 *
 *    Return up to `amount` questions matching the given categoryId & difficulty.
 */
app.get("/quiz", async (req: Request, res: Response) => {
  const category = Number(req.query.category);
  const difficulty = String(req.query.difficulty);
  const amount = Number(req.query.amount) || 5;

  if (!category || !["easy", "medium", "hard"].includes(difficulty)) {
    res.status(400).json({ error: "Invalid category or difficulty" });
    return;
  }

  try {
    // Instead of .find(...).limit(amount), use an aggregation with $match + $sample
    const pipeline = [
      { $match: { categoryId: category, difficulty: difficulty } },
      { $sample: { size: amount } },
      { $project: { _id: 1, questionText: 1, choices: 1 } },
    ];

    const qs = await Question.aggregate(pipeline).exec();

    if (!qs.length) {
      res.status(404).json({ error: "No questions found" });
      return;
    }

    res.json(qs);
  } catch (err) {
    console.error("Error fetching /quiz:", err);
    res.status(500).json({ error: "Failed to fetch quiz" });
  }
});

/**
 * 5) POST /quiz/score
 *    Accept an array of { questionId, answer } objects, grade them, and return total + per-question results.
 */
app.post("/quiz/score", async (req: Request, res: Response) => {
  type Submission = { questionId: string; answer: string };
  const subs: Submission[] = req.body.answers;

  if (!Array.isArray(subs)) {
    res.status(400).json({ error: "Body must have 'answers' array" });
    return;
  }

  try {
    // Convert each questionId string into a mongoose ObjectId
    const ids = subs.map((s) => new mongoose.Types.ObjectId(s.questionId));
    // Fetch question documents by those IDs
    const docs = await Question.find({ _id: { $in: ids } });

    // Build a lookup map: questionId string → Question document
    const map: Record<string, (typeof docs)[0]> = {};
    docs.forEach((d) => {
      map[String(d._id)] = d;
    });

    let totalCorrect = 0;
    // For each submitted answer, check correctness and record the correct answer text
    const results = subs.map(({ questionId, answer }) => {
      const q = map[questionId];
      if (!q) {
        return { questionId, correct: false, correctAnswer: "" };
      }

      const isCorrect = hashAnswer(answer) === q.hashedAnswer;
      if (isCorrect) totalCorrect++;

      // Find the text of the correct choice by comparing hashes
      const correctText =
        q.choices.find((c) => hashAnswer(c) === q.hashedAnswer) ?? "";

      return {
        questionId,
        correct: isCorrect,
        correctAnswer: correctText,
      };
    });

    res.json({ totalCorrect, results });
  } catch (err) {
    console.error("Error scoring /quiz/score:", err);
    res.status(500).json({ error: "Failed to score quiz" });
  }
});

// ── START SERVER ─────────────────────────────────────────────────────────────

// Coerce process.env.PORT to a number; default to 8080 if unset
const PORT = process.env.PORT ? Number(process.env.PORT) : 8080;

mongoose
  .connect(process.env.MONGO_URI || "")
  .then(() => {
    console.log("🗄️  Connected to MongoDB");

    // IMPORTANT: bind to 0.0.0.0 so Docker port-mapping works correctly
    app.listen(PORT, "0.0.0.0", () =>
      console.log(`🚀  API listening at http://localhost:${PORT}`)
    );
  })
  .catch((err) => {
    console.error("❌  Mongo connection error:", err);
    process.exit(1);
  });
