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
  await protectPage([AppRole.ADMIN], { unauthorizedRedirect: "/owedbook" });

  return <AuthedShell>{children}</AuthedShell>;
}
