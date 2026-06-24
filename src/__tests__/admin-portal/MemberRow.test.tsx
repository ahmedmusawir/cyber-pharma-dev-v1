/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
(globalThis as unknown as { ResizeObserver: unknown }).ResizeObserver =
  ResizeObserverStub;

import MemberRow from "@/components/admin-portal/MemberRow";
import { useAdminDemoStore } from "@/store/useAdminDemoStore";
import type { StoreMember } from "@/types/adminDemo";

const activeMember: StoreMember = {
  memberId: "member-1",
  storeId: "store-1",
  name: "Tina Cho",
  email: "tina@hydeparkrx.com",
  initials: "TC",
  jobTitle: "Pharmacist",
  role: "member",
  accountStatus: "active",
};

const pendingMember: StoreMember = {
  memberId: "member-2",
  storeId: "store-1",
  name: "",
  email: "jane@hydeparkrx.com",
  initials: "J",
  jobTitle: "Technician",
  role: "member",
  accountStatus: "invite_pending",
  invitedAt: "2026-06-20T14:30:00.000Z",
};

// Intent (K9): row actions are derived from account status — an active member
// can be suspended (and that flips the real state through the service), a
// pending invite can only be resent. Wrong actions on a status = a broken roster.
describe("MemberRow actions by status", () => {
  beforeEach(() => useAdminDemoStore.getState().reset());

  it("active member shows Send recovery + Suspend, and Suspend flips status", async () => {
    const onChanged = jest.fn();
    render(<MemberRow member={activeMember} onChanged={onChanged} />);

    expect(
      screen.getByRole("button", { name: "Send recovery" })
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Suspend" }));

    await waitFor(() =>
      expect(
        useAdminDemoStore
          .getState()
          .members.find((m) => m.memberId === "member-1")!.accountStatus
      ).toBe("suspended")
    );
    expect(onChanged).toHaveBeenCalled();
  });

  it("invite_pending member shows Resend invite only (no Suspend) and renders the email", () => {
    render(<MemberRow member={pendingMember} onChanged={() => {}} />);

    expect(
      screen.getByRole("button", { name: "Resend invite" })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Suspend" })
    ).not.toBeInTheDocument();
    // name is empty → the row falls back to the email as the display name.
    expect(screen.getByText("jane@hydeparkrx.com")).toBeInTheDocument();
  });
});
