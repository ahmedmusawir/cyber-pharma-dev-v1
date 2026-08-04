// TODO: REMOVE — temporary operator tool (/moose-portal). Off-books, env-gated,
// throwaway. Exists only to manage real Supabase test users after the admin-portal
// FFM swaps /admin-portal to a state-only mock. Delete this whole folder
// (src/app/moose-portal/) + the navbar Moose link when no longer needed.
import { ReactNode } from "react";
import { notFound } from "next/navigation";
import { protectPage } from "@/utils/supabase/actions";
import { AppRole } from "@/utils/app-role";
import MooseShell from "./_shell/MooseShell";

export const dynamic = "force-dynamic";

export default async function MoosePortalLayout({ children }: { children: ReactNode }) {
  // Containment: absent/false → the entire route 404s (safe by default).
  if (process.env.NEXT_PUBLIC_ENABLE_MOOSE_PORTAL !== "true") notFound();

  const { user, role } = await protectPage([AppRole.ADMIN]);

  return (
    <MooseShell user={user} role={role}>
      {children}
    </MooseShell>
  );
}
