"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/global/Navbar";
import AdminSidebar from "@/components/layout/AdminSidebar";

// Authed chrome (Rule Zero — mobile-correct from the start). Desktop (lg+):
// fixed sidebar column, identical to the prior shell. Below lg (tablet + phone):
// the column is hidden and a trigger opens a left slide-over holding the same
// AdminSidebar (nav items on /admin-portal, filter rail on /owedbook).
const AuthedShell = ({ children }: { children: ReactNode }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname() ?? "";
  // /owedbook's filter rail is wide (KPI row + wide table) → it stays
  // two-column only at xl+ and collapses to the drawer below xl. /admin-portal's
  // narrow nav rail collapses at lg. (Full literal classes so Tailwind keeps them.)
  const onOwedbook = pathname.startsWith("/owedbook");
  const triggerLabel = onOwedbook ? "Filters" : "Menu";
  const sidebarVisible = onOwedbook ? "hidden xl:block" : "hidden lg:block";
  const collapsedBelow = onOwedbook ? "xl:hidden" : "lg:hidden";

  // Close the drawer on any navigation. The sidebar's links (AdminSidebar)
  // don't know they're inside the drawer, so without this the route changes
  // behind an open drawer that never dismisses.
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  // Escape to close + lock body scroll while the drawer is open.
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
      <Navbar />

      {/* Mobile sidebar trigger (< lg) */}
      <div className={`${collapsedBelow} border-b border-border px-4 py-2`}>
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-label={`Open ${triggerLabel}`}
          aria-expanded={drawerOpen}
          className="inline-flex items-center gap-2 text-sm font-medium text-foreground"
        >
          <Menu className="h-5 w-5" />
          {triggerLabel}
        </button>
      </div>

      <section className="flex flex-1">
        {/* Desktop fixed sidebar (lg+) — same box as before */}
        <div
          data-testid="desktop-sidebar"
          className={`${sidebarVisible} h-auto flex-shrink-0 border-4 w-[25rem]`}
        >
          <AdminSidebar />
        </div>
        {/* min-w-0: let the main column shrink to the viewport so wide content
            (e.g. the tab strip) scrolls internally instead of overflowing the
            page horizontally (which made the navbar look "cut short"). */}
        <div className="flex-grow min-w-0">{children}</div>
      </section>

      {/* Mobile slide-over drawer (< lg) */}
      {drawerOpen && (
        <div className={`${collapsedBelow} fixed inset-0 z-50`} role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setDrawerOpen(false)}
            aria-hidden
          />
          {/* Drawer width: 75% of viewport on phone (< md), 50% on tablet (md–<lg). */}
          <div
            data-testid="sidebar-drawer"
            className="absolute inset-y-0 left-0 w-3/4 md:w-1/2 bg-secondary shadow-xl overflow-y-auto"
          >
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
            <AdminSidebar />
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthedShell;
