/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent, within } from "@testing-library/react";
import "@testing-library/jest-dom";

let mockRole = "admin";

jest.mock("@/store/useAuthStore", () => ({
  useAuthStore: Object.assign(
    (selector: (s: { role: string }) => unknown) => selector({ role: mockRole }),
    { getState: () => ({ logout: jest.fn().mockResolvedValue(undefined) }) }
  ),
}));

jest.mock("@/components/global/ThemeToggler", () => ({
  __esModule: true,
  default: () => <div data-testid="theme-toggler" />,
}));

jest.mock("@/utils/supabase/client", () => ({
  createClient: () => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: { email: "tony@stark.com" } } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
  }),
}));

import Navbar from "@/components/global/Navbar";

// Intent (Rule Zero): the authed navbar must collapse to a usable mobile menu —
// account actions can't be desktop-only. The hamburger opens a panel with the
// account controls (Profile / Log out), not just decoration.
describe("Navbar mobile menu", () => {
  it("hamburger toggles a panel exposing the account actions", async () => {
    mockRole = "admin";
    render(<Navbar />);
    await screen.findByText("tony@stark.com"); // user loaded

    // Closed by default — no logout control rendered.
    expect(screen.queryByRole("button", { name: "Log out" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));

    // Panel open — scope to it (links also exist in the desktop bar in jsdom).
    const panel = within(screen.getByRole("dialog"));
    expect(panel.getByRole("button", { name: "Log out" })).toBeInTheDocument();
    expect(panel.getByRole("link", { name: "Profile" })).toBeInTheDocument();
    expect(panel.getByRole("link", { name: "OwedBook" })).toBeInTheDocument();
  });

  // Intent: a mobile menu must dismiss on an outside tap — not trap the user until
  // they find the X. These guard the three close paths so none regress.
  describe("dismissal", () => {
    const open = async () => {
      mockRole = "admin";
      render(<Navbar />);
      await screen.findByText("tony@stark.com");
      fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    };

    it("closes on a pointerdown outside the navbar", async () => {
      await open();
      fireEvent.pointerDown(document.body);
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("closes on Escape", async () => {
      await open();
      fireEvent.keyDown(document, { key: "Escape" });
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("still closes via the X toggle", async () => {
      await open();
      fireEvent.click(screen.getByRole("button", { name: "Close menu" }));
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("still closes when a nav item is tapped", async () => {
      await open();
      const panel = within(screen.getByRole("dialog"));
      fireEvent.click(panel.getByRole("link", { name: "Profile" }));
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });
});
