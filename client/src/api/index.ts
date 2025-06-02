export interface CategoryMeta {
  apiId: number;
  name: string;
  available: Array<"easy" | "medium" | "hard">;
}

export interface Question {
  _id: string;
  questionText: string;
  choices: string[];
}

export interface ScoreResult {
  totalCorrect: number;
  results: { questionId: string; correct: boolean; correctAnswer: string }[];
}

export async function fetchMeta(): Promise<CategoryMeta[]> {
  const res = await fetch("/categories/meta");
  if (!res.ok) {
    throw new Error(`Could not load /categories/meta (status ${res.status})`);
  }
  return res.json();
}

export async function fetchQuiz(params: {
  categoryId: number;
  difficulty: "easy" | "medium" | "hard";
  amount: number;
}): Promise<Question[]> {
  const { categoryId, difficulty, amount } = params;
  const query = new URLSearchParams({
    category: String(categoryId),
    difficulty,
    amount: String(amount),
  });
  const res = await fetch(`/quiz?${query.toString()}`);
  if (!res.ok) {
    throw new Error(
      `Could not load /quiz?${query.toString()} (status ${res.status})`
    );
  }
  return res.json();
}

export async function submitAnswers(payload: {
  answers: { questionId: string; answer: string }[];
}): Promise<ScoreResult> {
  const res = await fetch("/quiz/score", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(`Could not post to /quiz/score (status ${res.status})`);
  }
  return res.json();
}
