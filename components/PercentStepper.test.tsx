import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PercentStepper } from "./PercentStepper";

describe("PercentStepper", () => {
  it("steps up and down, firing both the live and the commit callbacks", () => {
    const onChange = vi.fn();
    const onCommit = vi.fn();
    render(
      <PercentStepper value={18} onChange={onChange} onCommit={onCommit} ariaLabel="test markup" />,
    );
    fireEvent.click(screen.getByLabelText("test markup increase"));
    expect(onChange).toHaveBeenLastCalledWith(19);
    expect(onCommit).toHaveBeenLastCalledWith(19);
    fireEvent.click(screen.getByLabelText("test markup decrease"));
    expect(onCommit).toHaveBeenLastCalledWith(17);
  });

  it("fires onChange live per keystroke but only commits on blur", () => {
    const onChange = vi.fn();
    const onCommit = vi.fn();
    render(
      <PercentStepper value={18} onChange={onChange} onCommit={onCommit} ariaLabel="test markup" />,
    );
    const input = screen.getByRole("textbox", { name: "test markup" });

    fireEvent.change(input, { target: { value: "25" } });
    expect(onChange).toHaveBeenLastCalledWith(25); // live recompute
    expect(onCommit).not.toHaveBeenCalled(); // not persisted yet

    fireEvent.blur(input);
    expect(onCommit).toHaveBeenLastCalledWith(25); // persisted on blur
  });
});
