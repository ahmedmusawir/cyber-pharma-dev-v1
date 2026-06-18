import { ReactNode } from "react";
import Navbar from "@/components/global/Navbar";
import { protectPage } from "@/utils/supabase/actions";
import { AppRole } from "@/utils/app-role";

interface LayoutProps {
  children: ReactNode;
}

// Universal Profile access (UI_SPEC v1.3 §F): /profile is reachable by ADMIN
// AND MEMBER so every account can view its info and change its password.
// Navbar-only shell (no surface sidebar — Profile belongs to neither surface);
// the Navbar avatar dropdown is the universal access point.
export default async function ProfileLayout({ children }: LayoutProps) {
  await protectPage([AppRole.ADMIN, AppRole.MEMBER]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">{children}</main>
    </div>
  );
}
