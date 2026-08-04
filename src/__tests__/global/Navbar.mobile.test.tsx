/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import type { User as SupabaseUser } from "@supabase/auth-js";

jest.mock("@/store/useAuthStore", () => ({
  useAuthStore: Object.assign(jest.fn(), {
    getState: () => ({ logout: jest.fn().mockResolvedValue(undefined) }),
  }),
}));

jest.mock("@/components/global/ThemeToggler", () => ({
  __esModule: true,
  default: ({ onSelect }: { onSelect?: () => void }) => (
    <button data-testid="theme-toggler" onClick={onSelect}>
      theme
    </button>
  ),
}));

// Identity is server-passed as props; the client only listens for sign-out.
jest.mock("@/utils/supabase/client", () => ({
  createClient: () => ({
    auth: {
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
  }),
}));

import Navbar from "@/components/global/Navbar";
import { AppRole } from "@/utils/app-role";

const tony = { email: "tony@stark.com" } as SupabaseUser;

// Intent (Rule Zero): the authed navbar must collapse to a usable mobile menu —
// account actions can't be desktop-only. The hamburger opens a panel with the
// account controls (Profile / Log out), not just decoration.
describe("Navbar mobile menu", () => {
  it("hamburger toggles a panel exposing the account actions", () => {
    render(<Navbar user={tony} role={AppRole.ADMIN} />);
    screen.getAllByText("tony@stark.com"); // identity renders synchronously from props

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
    const open = () => {
      render(<Navbar user={tony} role={AppRole.ADMIN} />);
      fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    };

    it("closes on a pointerdown outside the navbar", () => {
      open();
      fireEvent.pointerDown(document.body);
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("closes on Escape", () => {
      open();
      fireEvent.keyDown(document, { key: "Escape" });
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    // Regression: the theme dropdown (Radix) portals its items to document.body,
    // OUTSIDE the navbar. A tap on one of those items must NOT close the menu —
    // it's a control of the menu, not an outside tap. (Before the guard, picking
    // a theme collapsed the panel mid-tap and fell through to a page nav.)
    it("stays open when tapping inside a Radix popper (e.g. theme dropdown)", () => {
      open();
      const popper = document.createElement("div");
      popper.setAttribute("data-radix-popper-content-wrapper", "");
      const item = document.createElement("div");
      popper.appendChild(item);
      document.body.appendChild(popper);

      fireEvent.pointerDown(item);
      expect(screen.getByRole("dialog")).toBeInTheDocument();

      document.body.removeChild(popper);
    });

    // Picking a theme is a deliberate menu action → it should close the menu
    // (the guard above only prevents the ACCIDENTAL pointerdown close-through).
    it("closes when a theme is selected from the menu", () => {
      open();
      const panel = within(screen.getByRole("dialog"));
      fireEvent.click(panel.getByTestId("theme-toggler"));
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("still closes via the X toggle", () => {
      open();
      fireEvent.click(screen.getByRole("button", { name: "Close menu" }));
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("still closes when a nav item is tapped", () => {
      open();
      const panel = within(screen.getByRole("dialog"));
      fireEvent.click(panel.getByRole("link", { name: "Profile" }));
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });
});
