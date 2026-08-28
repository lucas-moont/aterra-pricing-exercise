import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { Toast } from "./Toast";

describe("Toast", () => {
  it("shows the message and dismisses on click", () => {
    const onDismiss = vi.fn();
    render(<Toast message="Saved" onDismiss={onDismiss} />);
    expect(screen.getByText("Saved")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /dismiss/i }));
    expect(onDismiss).toHaveBeenCalled();
  });

  it("auto-dismisses an info toast after its timeout", () => {
    vi.useFakeTimers();
    const onDismiss = vi.fn();
    render(<Toast message="Reset" variant="info" autoDismissMs={2500} onDismiss={onDismiss} />);
    expect(onDismiss).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(2500));
    expect(onDismiss).toHaveBeenCalled();
    vi.useRealTimers();
  });
});
