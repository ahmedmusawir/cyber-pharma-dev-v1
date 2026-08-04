/**
 * @jest-environment jsdom
 */

import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import type { User as SupabaseUser } from "@supabase/auth-js";

// ThemeToggler pulls next-themes context we don't provide here — stub it.
jest.mock("@/components/global/ThemeToggler", () => ({
  __esModule: true,
  default: () => <div data-testid="theme-toggler" />,
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

// Intent (§E/§F): role-aware top-level nav. Admin Portal is ADMIN-only (a hidden
// link is UX, the route guard is security). OwedBook + Profile are for everyone —
// a member must NOT get an empty navbar.
describe("Navbar role-aware links", () => {
  it("ADMIN sees OwedBook + Admin Portal + Profile", () => {
    render(<Navbar user={tony} role={AppRole.ADMIN} />);
    expect(screen.getByRole("link", { name: "OwedBook" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Admin Portal" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Profile" })).toBeInTheDocument();
  });

  it("MEMBER sees OwedBook + Profile but NOT Admin Portal", () => {
    render(<Navbar user={tony} role={AppRole.MEMBER} />);
    expect(screen.getByRole("link", { name: "OwedBook" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Profile" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Admin Portal" })).not.toBeInTheDocument();
  });
});
