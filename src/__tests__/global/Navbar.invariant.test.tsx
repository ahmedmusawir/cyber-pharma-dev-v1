/**
 * @jest-environment jsdom
 */

import { render, screen, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import type { User as SupabaseUser } from "@supabase/auth-js";

jest.mock("@/components/global/ThemeToggler", () => ({
  __esModule: true,
  default: () => <div data-testid="theme-toggler" />,
}));

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

// INVARIANT (staging nav bug, 2026-08-04): an authenticated Navbar is NEVER
// empty — identity is server-passed as props, so there is no client-fetch window
// in which the link list can collapse to []. The first synchronous render must
// already contain the full role-appropriate link set.
describe("Navbar never-empty invariant (authed)", () => {
  it("MEMBER first render contains at least [OwedBook, Profile]", () => {
    render(<Navbar user={tony} role={AppRole.MEMBER} />);
    const nav = within(screen.getByRole("navigation", { name: "Primary" }));
    expect(nav.getByRole("link", { name: "OwedBook" })).toBeInTheDocument();
    expect(nav.getByRole("link", { name: "Profile" })).toBeInTheDocument();
    expect(nav.getAllByRole("link").length).toBeGreaterThanOrEqual(2);
  });

  it("ADMIN first render contains at least [OwedBook, Admin Portal, Profile]", () => {
    render(<Navbar user={tony} role={AppRole.ADMIN} />);
    const nav = within(screen.getByRole("navigation", { name: "Primary" }));
    expect(nav.getByRole("link", { name: "OwedBook" })).toBeInTheDocument();
    expect(nav.getByRole("link", { name: "Admin Portal" })).toBeInTheDocument();
    expect(nav.getByRole("link", { name: "Profile" })).toBeInTheDocument();
    expect(nav.getAllByRole("link").length).toBeGreaterThanOrEqual(3);
  });
});
