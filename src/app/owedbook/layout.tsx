import { ReactNode } from "react";
import Navbar from "@/components/global/Navbar";
import AdminSidebar from "@/components/layout/AdminSidebar";
import { protectPage } from "@/utils/supabase/actions";
import { AppRole } from "@/utils/app-role";
import { OwedBookProvider } from "@/components/owedbook/OwedBookContext";

interface LayoutProps {
  children: ReactNode;
}

// OwedBook surface (UI_SPEC v1.4 §A.1): post-login landing for ANY authenticated
// user (ADMIN + MEMBER). SAME shell + SAME sidebar container as /admin-portal —
// the surface-aware AdminSidebar renders the FilterRail (instead of nav items)
// below the command input on this surface. The provider bridges the rail's
// filter state to the OwedBookScreen in the main pane.
export default async function OwedBookLayout({ children }: LayoutProps) {
  await protectPage([AppRole.ADMIN, AppRole.MEMBER]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <OwedBookProvider>
        <section className="flex flex-1">
          <div className="hidden md:block h-auto flex-shrink-0 border-4 w-[25rem]">
            <AdminSidebar />
          </div>
          <div className="flex-grow">{children}</div>
        </section>
      </OwedBookProvider>
    </div>
  );
}
