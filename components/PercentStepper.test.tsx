import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PercentStepper } from "./PercentStepper";

describe("PercentStepper", () => {
  it("increments and decrements by one", () => {
    const onChange = vi.fn();
    render(<PercentStepper value={18} onChange={onChange} ariaLabel="test markup" />);
    fireEvent.click(screen.getByLabelText("test markup increase"));
    expect(onChange).toHaveBeenLastCalledWith(19);
    fireEvent.click(screen.getByLabelText("test markup decrease"));
    expect(onChange).toHaveBeenLastCalledWith(17);
  });

  it("commits a typed value on blur", () => {
    const onChange = vi.fn();
    render(<PercentStepper value={18} onChange={onChange} ariaLabel="test markup" />);
    const input = screen.getByRole("textbox", { name: "test markup" });
    fireEvent.change(input, { target: { value: "25" } });
    fireEvent.blur(input);
    expect(onChange).toHaveBeenLastCalledWith(25);
  });
});
