import { ReactNode } from "react";
import { protectPage } from "@/utils/supabase/actions";
import { AppRole } from "@/utils/app-role";
import AuthedShell from "@/components/layout/AuthedShell";

interface LayoutProps {
  children: ReactNode;
}

export default async function AdminLayout({ children }: LayoutProps) {
  // Admin-only surface. A MEMBER who types the URL is bounced to /owedbook
  // (their landing), not the login page (UI_SPEC v1.3 §E).
  const { user, role } = await protectPage([AppRole.ADMIN], {
    unauthorizedRedirect: "/owedbook",
  });

  // Content-column gutter for every admin-portal screen — the designer's `.main`
  // padding (mockup: 26px 30px desktop, 18px 16px ≤900px ≈ below lg, where the
  // sidebar stops being fixed). Applied here (admin-portal-only group) rather than
  // in the shared AuthedShell so /owedbook + /moose-portal are physically out of
  // scope. One place → all six screens (+ loading/error/not-found) inherit it.
  return (
    <AuthedShell user={user} role={role}>
      <div className="px-4 py-[18px] lg:px-[30px] lg:py-[26px]">{children}</div>
    </AuthedShell>
  );
}
