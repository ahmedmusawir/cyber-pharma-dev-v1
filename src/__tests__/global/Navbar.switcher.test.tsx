/**
 * @jest-environment jsdom
 */

import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

// Role drives switcher visibility (UI_SPEC §E). `mock`-prefixed so jest's
// hoisted factory may close over it.
let mockRole = "admin";

jest.mock("@/store/useAuthStore", () => ({
  useAuthStore: (selector: (s: { role: string }) => unknown) => selector({ role: mockRole }),
}));

// ThemeToggler pulls next-themes context we don't provide here — stub it.
jest.mock("@/components/global/ThemeToggler", () => ({
  __esModule: true,
  default: () => <div data-testid="theme-toggler" />,
}));

// Navbar resolves the user via the supabase client on mount.
jest.mock("@/utils/supabase/client", () => ({
  createClient: () => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: { email: "tony@stark.com" } } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
  }),
}));

import Navbar from "@/components/global/Navbar";

// Intent (§E/§F): role-aware top-level nav. Admin Portal is ADMIN-only (a hidden
// link is UX, the route guard is security). OwedBook + Profile are for everyone —
// a member must NOT get an empty navbar.
describe("Navbar role-aware links", () => {
  it("ADMIN sees OwedBook + Admin Portal + Profile", async () => {
    mockRole = "admin";
    render(<Navbar />);
    expect(await screen.findByRole("link", { name: "OwedBook" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Admin Portal" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Profile" })).toBeInTheDocument();
  });

  it("MEMBER sees OwedBook + Profile but NOT Admin Portal", async () => {
    mockRole = "member";
    render(<Navbar />);
    expect(await screen.findByRole("link", { name: "OwedBook" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Profile" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Admin Portal" })).not.toBeInTheDocument();
  });
});
