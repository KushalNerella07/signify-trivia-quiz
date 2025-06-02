import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import DifficultyTabs from "./DifficultyTabs";

describe("DifficultyTabs", () => {
  const available = ["easy", "medium", "hard"] as Array<
    "easy" | "medium" | "hard"
  >;

  it("renders all tabs and highlights the selected one", () => {
    const onChange = jest.fn();
    render(
      <DifficultyTabs
        available={available}
        value="medium"
        onChange={onChange}
      />
    );
    expect(screen.getByRole("tab", { name: /easy/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /medium/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /hard/i })).toBeInTheDocument();
    const mediumTab = screen.getByRole("tab", { name: /medium/i });
    expect(mediumTab).toHaveAttribute("aria-selected", "true");
  });

  it("calls onChange with the new difficulty when a tab is clicked", () => {
    const onChange = jest.fn();
    render(
      <DifficultyTabs available={available} value="easy" onChange={onChange} />
    );
    const hardTab = screen.getByRole("tab", { name: /hard/i });
    fireEvent.click(hardTab);
    expect(onChange).toHaveBeenCalledWith("hard");
  });
});
