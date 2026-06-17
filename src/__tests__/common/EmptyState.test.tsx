/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Inbox } from "lucide-react";
import EmptyState from "@/components/common/EmptyState";

describe("EmptyState", () => {
  it("renders headline + subcopy + action", () => {
    const onClick = jest.fn();
    render(
      <EmptyState
        icon={<Inbox data-testid="es-icon" />}
        headline="No matches"
        subcopy="Try widening your filters."
        action={{ label: "Reset filters", onClick }}
      />,
    );
    expect(screen.getByTestId("es-icon")).toBeInTheDocument();
    expect(screen.getByText("No matches")).toBeInTheDocument();
    expect(screen.getByText("Try widening your filters.")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Reset filters" }),
    ).toBeInTheDocument();
  });

  it("fires action.onClick when the action button is clicked", () => {
    const onClick = jest.fn();
    render(
      <EmptyState
        icon={<Inbox />}
        headline="No matches"
        action={{ label: "Reset filters", onClick }}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Reset filters" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not render subcopy or action when omitted", () => {
    render(<EmptyState icon={<Inbox />} headline="No matches" />);
    expect(screen.getByText("No matches")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    // Only one paragraph would exist if subcopy were present; absence verified by query
    expect(
      screen.queryByText(/Try widening/),
    ).not.toBeInTheDocument();
  });
});
