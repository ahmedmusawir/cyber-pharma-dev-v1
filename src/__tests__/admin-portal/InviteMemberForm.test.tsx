/**
 * @jest-environment jsdom
 */

import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

// Radix Select touches these in jsdom (no layout engine / ResizeObserver).
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
(globalThis as unknown as { ResizeObserver: unknown }).ResizeObserver =
  ResizeObserverStub;
Element.prototype.scrollIntoView = () => {};

import InviteMemberForm from "@/components/admin-portal/InviteMemberForm";

// Intent (THE ONE HARD RULE — K9): member creation is invite-based, NEVER
// password-based, and V1 exposes no permission/role control (one admin = owner;
// 2nd admins only via MissionControl). A password input or an access selector
// in this DOM is a security-gate breach — these assertions fail the build if one
// ever appears. This is the last line of defense in the UI.
describe("InviteMemberForm — the one hard rule", () => {
  const renderForm = () =>
    render(<InviteMemberForm storeId="store-1" onInvited={() => {}} />);

  it("renders NO password input anywhere", () => {
    const { container } = renderForm();
    expect(container.querySelectorAll('input[type="password"]')).toHaveLength(0);
    expect(screen.queryByLabelText(/password/i)).not.toBeInTheDocument();
  });

  it("offers Email + Job title only — no permission/role/access selector", () => {
    renderForm();
    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByText("Job title")).toBeInTheDocument();
    expect(screen.queryByText(/^role$/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/permission/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/access level/i)).not.toBeInTheDocument();
  });

  it("keeps the invite-only callout and Send invite action", () => {
    renderForm();
    expect(
      screen.getByText(/Invite-based — no password here\./i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Send invite" })
    ).toBeInTheDocument();
  });
});
