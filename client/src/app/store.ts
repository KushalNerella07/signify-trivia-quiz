import { configureStore } from "@reduxjs/toolkit";
import categoryReducer from "../features/categories/categorySlice";
import quizReducer from "../features/quiz/quizSlice";

export const store = configureStore({
  reducer: {
    categories: categoryReducer,
    quiz: quizReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
