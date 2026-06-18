import { ReactNode } from "react";
import Navbar from "@/components/global/Navbar";
import AdminSidebar from "@/components/layout/AdminSidebar";
import { protectPage } from "@/utils/supabase/actions";
import { AppRole } from "@/utils/app-role";

interface LayoutProps {
  children: ReactNode;
}

// OwedBook surface (UI_SPEC v1.3 §A): post-login landing for ANY authenticated
// user (ADMIN + MEMBER). Same shell as the Admin surface — Navbar + the single
// surface-aware AdminSidebar (renders the Dashboard-only item-set on /owedbook*).
export default async function OwedBookLayout({ children }: LayoutProps) {
  await protectPage([AppRole.ADMIN, AppRole.MEMBER]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <section className="flex flex-1">
        <div className="hidden md:block h-auto flex-shrink-0 border-4 w-[25rem]">
          <AdminSidebar />
        </div>
        <div className="flex-grow">{children}</div>
      </section>
    </div>
  );
}
