import { ReactNode } from "react";
import { protectPage } from "@/utils/supabase/actions";
import { AppRole } from "@/utils/app-role";
import AuthedShell from "@/components/layout/AuthedShell";
import { OwedBookProvider } from "@/components/owedbook/OwedBookContext";

interface LayoutProps {
  children: ReactNode;
}

// OwedBook surface (UI_SPEC §A.1): post-login landing for ANY authenticated user
// (ADMIN + MEMBER). AuthedShell provides the shared chrome (navbar + sidebar /
// mobile slide-over); the AdminSidebar renders the FilterRail on this surface.
// OwedBookProvider wraps the shell so the rail (even inside the mobile drawer)
// shares filter state with the screen.
export default async function OwedBookLayout({ children }: LayoutProps) {
  const { user, role } = await protectPage([AppRole.ADMIN, AppRole.MEMBER]);

  return (
    <OwedBookProvider>
      <AuthedShell user={user} role={role}>
        {children}
      </AuthedShell>
    </OwedBookProvider>
  );
}
