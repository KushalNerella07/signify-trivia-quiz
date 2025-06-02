import { Schema, model, Document } from "mongoose";

export interface QuestionDoc extends Document {
  categoryId: number;
  difficulty: "easy" | "medium" | "hard";
  questionText: string;
  choices: string[];
  hashedAnswer: string;
}

const questionSchema = new Schema<QuestionDoc>({
  categoryId: { type: Number, required: true },
  difficulty: {
    type: String,
    required: true,
    enum: ["easy", "medium", "hard"],
  },
  questionText: { type: String, required: true },
  choices: {
    type: [String],
    required: true,
    validate: [
      (arr: string[]) => arr.length === 4,
      "A question must have exactly 4 choices",
    ],
  },
  hashedAnswer: { type: String, required: true },
});

export const Question = model<QuestionDoc>("Question", questionSchema);
