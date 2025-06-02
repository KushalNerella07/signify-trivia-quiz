import mongoose from "mongoose";
import dotenv from "dotenv";
import crypto from "crypto";
import fetch from "node-fetch";
import { Category } from "./models/category";
import { Question } from "./models/question";

dotenv.config();

/* ---------- helpers ---------- */
const hashAnswer = (a: string) =>
  crypto.createHash("sha256").update(a).digest("hex");

function shuffleArray<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

async function fetchWithFallback(
  apiId: number,
  difficulty: "easy" | "medium" | "hard",
  desired: number
) {
  let amount = desired;
  while (amount > 0) {
    const url = `https://opentdb.com/api.php?amount=${amount}&category=${apiId}&difficulty=${difficulty}&type=multiple`;
    const res = await fetch(url);
    const json = (await res.json()) as {
      response_code: number;
      results: any[];
    };
    if (json.response_code === 0 && json.results.length) return json.results;
    amount = Math.floor(amount / 2); // halve and retry
  }
  return [];
}
/* -------------------------------- */

/* ---------- manual fallback Qs for category 9 ---------- */
const mediumFallback = [
  {
    questionText: "In Morse code, which letter is represented by “–––”?",
    correct: "O",
    distractors: ["S", "T", "M"],
  },
  {
    questionText: "What is the SI unit of electrical resistance?",
    correct: "Ohm",
    distractors: ["Henry", "Tesla", "Siemens"],
  },
  {
    questionText:
      "Which planet in our solar system has the longest day (rotation period)?",
    correct: "Venus",
    distractors: ["Mercury", "Mars", "Neptune"],
  },
];

const hardFallback = [
  {
    questionText:
      "Who coined the term “computer bug” after finding a moth in a relay?",
    correct: "Grace Hopper",
    distractors: ["Alan Turing", "Charles Babbage", "John von Neumann"],
  },
  {
    questionText:
      "The chemical element with atomic number 74 is better known by what name?",
    correct: "Tungsten",
    distractors: ["Tellurium", "Rhenium", "Iridium"],
  },
  {
    questionText: "Which year did the first modern Olympic Games take place?",
    correct: "1896",
    distractors: ["1900", "1888", "1892"],
  },
];
/* ------------------------------------------------------- */

async function seed() {
  /* 1. connect */
  const mongoUri = process.env.MONGO_URI || "";
  if (!mongoUri) {
    console.error("❌  MONGO_URI missing in .env");
    process.exit(1);
  }
  await mongoose.connect(mongoUri);
  console.log("🗄️  Connected to MongoDB");

  /* 2. drop old unique index if it exists */
  try {
    await Question.collection.dropIndex("apiId_1");
  } catch (e: any) {
    if (e.codeName !== "IndexNotFound") console.warn("⚠️ ", e.message);
  }

  /* 3. clear existing data */
  await Category.deleteMany({});
  await Question.deleteMany({});

  /* 4. fetch categories list */
  const catJson = (await (
    await fetch("https://opentdb.com/api_category.php")
  ).json()) as {
    trivia_categories: { id: number; name: string }[];
  };
  const cats = catJson.trivia_categories;
  await Category.insertMany(cats.map((c) => ({ apiId: c.id, name: c.name })));
  console.log("✅  Categories inserted");

  /* 5. main loop */
  const DIFFS: ("easy" | "medium" | "hard")[] = ["easy", "medium", "hard"];
  const DESIRED = 10;

  for (const { id: apiId } of cats) {
    let total = 0;
    for (const diff of DIFFS) {
      const raw = await fetchWithFallback(apiId, diff, DESIRED);
      if (!raw.length) {
        console.log(`⚠️  Cat ${apiId} | ${diff}: none`);
        continue;
      }
      const docs = raw.map((r) => ({
        categoryId: apiId,
        difficulty: diff,
        questionText: r.question,
        choices: shuffleArray([r.correct_answer, ...r.incorrect_answers]),
        hashedAnswer: hashAnswer(r.correct_answer),
      }));
      await Question.insertMany(docs);
      total += docs.length;
      console.log(`✅  Cat ${apiId} | ${diff}: +${docs.length}`);
    }
    if (!total) {
      await Category.deleteOne({ apiId });
      console.log(`❌  Dropped empty category ${apiId}`);
    }
  }

  /* 6. ensure category 9 has ≥3 medium & ≥3 hard */
  const guaranteeMinThree = async (
    diff: "medium" | "hard",
    fallbackPack: typeof mediumFallback
  ) => {
    const have = await Question.countDocuments({
      categoryId: 9,
      difficulty: diff,
    });
    if (have >= 3) return; // already good

    // first try the API again (might return a few on a second pass)
    const need = 3 - have;
    const extraAPI = await fetchWithFallback(9, diff, need);
    const toInsert = extraAPI.length ? extraAPI : fallbackPack.slice(0, need);

    await Question.insertMany(
      toInsert.map((r) => ({
        categoryId: 9,
        difficulty: diff,
        questionText: r.questionText ?? r.question, // works for API or manual
        choices: shuffleArray(
          r.choices ?? [r.correct, ...(r.distractors ?? r.incorrect_answers)]
        ),
        hashedAnswer: hashAnswer(r.correct ?? r.correct_answer),
      }))
    );
    console.log(`➕  Category 9 now has at least 3 ${diff} questions`);
  };

  await guaranteeMinThree("medium", mediumFallback);
  await guaranteeMinThree("hard", hardFallback);

  console.log("🎉  Seeding complete");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌  Seeding error:", err);
  process.exit(1);
});
