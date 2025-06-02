import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import CategorySelect from "./CategorySelect";
import type { CategoryMeta } from "../api";

describe("CategorySelect", () => {
  const mockCategories: CategoryMeta[] = [
    { apiId: 1, name: "Alpha", available: ["easy"] },
    { apiId: 2, name: "Beta", available: ["medium"] },
  ];

  it("renders label and options when opened", () => {
    const onChange = jest.fn();
    render(
      <CategorySelect
        categories={mockCategories}
        value={""}
        onChange={onChange}
      />
    );
    expect(screen.getByLabelText(/Category/i)).toBeInTheDocument();
    fireEvent.mouseDown(screen.getByLabelText(/Category/i));
    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.getByText("Beta")).toBeInTheDocument();
  });

  it("calls onChange with numeric apiId when an option is selected", () => {
    const onChange = jest.fn();
    render(
      <CategorySelect
        categories={mockCategories}
        value={""}
        onChange={onChange}
      />
    );
    fireEvent.mouseDown(screen.getByLabelText(/Category/i));
    fireEvent.click(screen.getByText("Beta"));
    expect(onChange).toHaveBeenCalledWith(2);
  });
});
