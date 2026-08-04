// TODO: REMOVE — temporary operator tool shell (copy of AuthedShell, admin
// treatment) so /moose-portal survives the admin-portal FFM untouched.
"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import type { User as SupabaseUser } from "@supabase/auth-js";
import Navbar from "@/components/global/Navbar";
import MooseSidebar from "./MooseSidebar";
import type { AppRole } from "@/utils/app-role";

// Mirrors /admin-portal's AuthedShell treatment exactly: navbar + fixed sidebar
// at lg+, hamburger + left slide-over below lg, close-on-navigation. No OwedBook
// filter coupling (no filters here).
// user/role from the layout's protectPage — forwarded to the Navbar (server-truth
// nav identity, mirrors AuthedShell).
interface MooseShellProps {
  user: SupabaseUser;
  role: AppRole;
  children: ReactNode;
}

const MooseShell = ({ user, role, children }: MooseShellProps) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname() ?? "";

  // Close the drawer on navigation (sidebar links don't know they're in it).
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  // Escape to close + lock body scroll while open.
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar user={user} role={role} />

      {/* Mobile sidebar trigger (< lg) */}
      <div className="lg:hidden border-b border-border px-4 py-2">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-label="Open Menu"
          aria-expanded={drawerOpen}
          className="inline-flex items-center gap-2 text-sm font-medium text-foreground"
        >
          <Menu className="h-5 w-5" />
          Menu
        </button>
      </div>

      <section className="flex flex-1">
        {/* Desktop fixed sidebar (lg+) */}
        <div className="hidden lg:block h-auto flex-shrink-0 border-4 w-[25rem]">
          <MooseSidebar />
        </div>
        <div className="flex-grow min-w-0">{children}</div>
      </section>

      {/* Mobile slide-over drawer (< lg) */}
      {drawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setDrawerOpen(false)}
            aria-hidden
          />
          <div className="absolute inset-y-0 left-0 w-3/4 md:w-1/2 bg-secondary shadow-xl overflow-y-auto">
            <div className="flex justify-end p-2">
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close"
                className="p-2 text-foreground hover:opacity-80"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <MooseSidebar />
          </div>
        </div>
      )}
    </div>
  );
};

export default MooseShell;
