import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import QuestionCard from "./QuestionCard";

describe("QuestionCard", () => {
  const sampleQuestion = {
    _id: "q1",
    questionText: "What is 2+2?",
    choices: ["1", "2", "4", "3"],
  };

  it("renders question text and all choices", () => {
    const onSelect = jest.fn();
    render(
      <QuestionCard
        question={sampleQuestion}
        selected={""}
        onSelect={onSelect}
      />
    );
    expect(screen.getByText(/What is 2\+2\?/i)).toBeInTheDocument();
    expect(screen.getByLabelText("1")).toBeInTheDocument();
    expect(screen.getByLabelText("2")).toBeInTheDocument();
    expect(screen.getByLabelText("4")).toBeInTheDocument();
    expect(screen.getByLabelText("3")).toBeInTheDocument();
  });

  it("calls onSelect with the chosen answer when a radio is clicked", () => {
    const onSelect = jest.fn();
    render(
      <QuestionCard
        question={sampleQuestion}
        selected={""}
        onSelect={onSelect}
      />
    );
    const choiceFour = screen.getByLabelText("4");
    fireEvent.click(choiceFour);
    expect(onSelect).toHaveBeenCalledWith("4");
  });

  it("marks the correct radio button as checked based on selected prop", () => {
    const onSelect = jest.fn();
    render(
      <QuestionCard
        question={sampleQuestion}
        selected="3"
        onSelect={onSelect}
      />
    );
    const choiceThree = screen.getByLabelText("3") as HTMLInputElement;
    expect(choiceThree.checked).toBe(true);
  });
});
