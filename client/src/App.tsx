// client/src/App.tsx
import { useEffect, useState } from "react";
import {
  Container,
  Button,
  Typography,
  CircularProgress,
  Box,
} from "@mui/material";

import CategorySelect from "./components/CategorySelect";
import DifficultyTabs from "./components/DifficultyTabs";
import QuestionCard from "./components/QuestionCard";

import { loadCategories } from "./features/categories/categorySlice";
import { loadQuiz, clearQuiz } from "./features/quiz/quizSlice";
import { useAppDispatch, useAppSelector } from "./app/hooks";

import type { Question, ScoreResult } from "./api";
import { submitAnswers } from "./api";

export default function App() {
  const dispatch = useAppDispatch();
  const categoryState = useAppSelector((s) => s.categories);
  const quizState = useAppSelector((s) => s.quiz);

  const [catId, setCatId] = useState<number | "">("");
  const [difficulty, setDifficulty] = useState<"" | "easy" | "medium" | "hard">(
    ""
  );

  const [answers, setAnswers] = useState<Record<string, string>>({});

  const [currentIndex, setCurrentIndex] = useState(0);

  const REQUESTED_AMOUNT = 5;

  useEffect(() => {
    if (categoryState.status === "idle") {
      dispatch(loadCategories());
    }
  }, [dispatch, categoryState.status]);

  useEffect(() => {
    if (catId !== "") {
      dispatch(clearQuiz());
      setAnswers({});
      setCurrentIndex(0);

      const chosen = categoryState.list.find((c) => c.apiId === catId);
      const availableDiffs = chosen?.available ?? [];
      if (availableDiffs.length > 0) {
        setDifficulty(availableDiffs[0]);
      } else {
        setDifficulty("");
      }
    } else {
      dispatch(clearQuiz());
      setAnswers({});
      setCurrentIndex(0);
      setDifficulty("");
    }
  }, [catId, categoryState.list, dispatch]);

  useEffect(() => {
    if (difficulty !== "") {
      dispatch(clearQuiz());
      setAnswers({});
      setCurrentIndex(0);
    }
  }, [difficulty, dispatch]);

  useEffect(() => {
    if (
      typeof catId === "number" &&
      (difficulty === "easy" ||
        difficulty === "medium" ||
        difficulty === "hard")
    ) {
      dispatch(
        loadQuiz({
          categoryId: catId,
          difficulty,
          amount: REQUESTED_AMOUNT,
        })
      );
    }
  }, [catId, difficulty, dispatch]);

  const handleShuffle = () => {
    if (
      typeof catId === "number" &&
      (difficulty === "easy" ||
        difficulty === "medium" ||
        difficulty === "hard")
    ) {
      dispatch(clearQuiz());
      setAnswers({});
      setCurrentIndex(0);
      dispatch(
        loadQuiz({
          categoryId: catId,
          difficulty,
          amount: REQUESTED_AMOUNT,
        })
      );
    }
  };

  const handleSubmit = async () => {
    const payload = Object.entries(answers).map(([questionId, answer]) => ({
      questionId,
      answer,
    }));
    const result: ScoreResult = await submitAnswers({ answers: payload });
    alert(`You got ${result.totalCorrect} / ${quizState.questions.length}`);
  };

  const chosenCategory = categoryState.list.find((c) => c.apiId === catId);
  const availableDiffs: Array<"easy" | "medium" | "hard"> =
    chosenCategory?.available ?? [];

  const totalQuestions = quizState.questions.length;
  const currentQuestion: Question | null =
    totalQuestions > 0 && currentIndex < totalQuestions
      ? quizState.questions[currentIndex]
      : null;

  return (
    <Container maxWidth="sm" sx={{ mt: 6 }}>
      <Typography variant="h4" mb={2}>
        Trivia Quiz
      </Typography>

      {/* 1) Category dropdown */}
      <CategorySelect
        categories={categoryState.list}
        value={catId}
        onChange={(newId) => setCatId(newId)}
      />

      {/* 2) Difficulty tabs (only once a category is chosen) */}
      {catId !== "" && availableDiffs.length > 0 && (
        <DifficultyTabs
          available={availableDiffs}
          value={difficulty as "easy" | "medium" | "hard"}
          onChange={(newDiff) => setDifficulty(newDiff)}
        />
      )}

      {/* 3) Show spinner while quiz is loading */}
      {quizState.status === "loading" && catId !== "" ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
          <CircularProgress />
        </Box>
      ) : (
        /* 4) Once loaded, if we have ≥1 question, render exactly one QuestionCard */
        currentQuestion && (
          <>
            <QuestionCard
              key={currentQuestion._id}
              question={currentQuestion}
              selected={answers[currentQuestion._id]}
              onSelect={(ans) =>
                setAnswers((prev) => ({
                  ...prev,
                  [currentQuestion._id]: ans,
                }))
              }
            />

            {/* 5) Pagination controls: Back / Next / Submit */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mt: 2,
              }}
            >
              {/* “Back” is disabled on the first question */}
              <Button
                variant="outlined"
                onClick={() => setCurrentIndex((i) => Math.max(i - 1, 0))}
                disabled={currentIndex === 0}
              >
                Back
              </Button>

              {currentIndex < totalQuestions - 1 ? (
                /* “Next” button if not on final question */
                <Button
                  variant="contained"
                  onClick={() => setCurrentIndex((i) => i + 1)}
                  disabled={!answers[currentQuestion._id]} // disable until answered
                >
                  Next
                </Button>
              ) : (
                /* On final question → show “Submit” */
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={!answers[currentQuestion._id]}
                >
                  Submit
                </Button>
              )}
            </Box>

            {/* 6) “Question X of N” label */}
            <Typography variant="body2" align="center" sx={{ mt: 1 }}>
              Question {currentIndex + 1} of {totalQuestions}
            </Typography>

            {/* 7) “Shuffle” button (reshuffle questions) */}
            <Box sx={{ textAlign: "center", mt: 2 }}>
              <Button variant="text" onClick={handleShuffle}>
                Shuffle Questions
              </Button>
            </Box>

            {/* 8) If fewer than REQUESTED_AMOUNT were returned, show a note */}
            {totalQuestions > 0 && totalQuestions < REQUESTED_AMOUNT && (
              <Typography
                variant="body2"
                color="warning.main"
                align="center"
                sx={{ mt: 1 }}
              >
                Only {totalQuestions} question
                {totalQuestions > 1 ? "s" : ""} available in this
                category/difficulty.
              </Typography>
            )}
          </>
        )
      )}
    </Container>
  );
}
