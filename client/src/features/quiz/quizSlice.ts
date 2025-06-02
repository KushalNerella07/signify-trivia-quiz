import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { Question } from "../../api";
import { fetchQuiz } from "../../api";

interface QuizState {
  questions: Question[];
  status: "idle" | "loading" | "failed";
}

const initialState: QuizState = {
  questions: [],
  status: "idle",
};

export const loadQuiz = createAsyncThunk(
  "quiz/load",
  async (args: {
    categoryId: number;
    difficulty: "easy" | "medium" | "hard";
    amount: number;
  }) => {
    const data = await fetchQuiz({
      categoryId: args.categoryId,
      difficulty: args.difficulty,
      amount: args.amount,
    });
    return data;
  }
);

const quizSlice = createSlice({
  name: "quiz",
  initialState,
  reducers: {
    clearQuiz(state) {
      state.questions = [];
      state.status = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadQuiz.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        loadQuiz.fulfilled,
        (state, action: PayloadAction<Question[]>) => {
          state.status = "idle";
          state.questions = action.payload;
        }
      )
      .addCase(loadQuiz.rejected, (state) => {
        state.status = "failed";
      });
  },
});

export const { clearQuiz } = quizSlice.actions;
export default quizSlice.reducer;
