"use server";

import { redirect } from "next/navigation";
import { getUserRole } from "../get-user-role";
import type { AppRole } from "../app-role";
import { createClient } from "./server";

export async function protectPage(
  allowedRoles: AppRole[],
  opts?: { unauthorizedRedirect?: string }
) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  const user = data?.user ?? null;

  // Unauthenticated → always to login, regardless of opts.
  if (!user) {
    return redirect("/auth");
  }

  // Authenticated but wrong role → caller-chosen landing (default /auth).
  // e.g. the admin surface bounces a MEMBER to /owedbook, not the login page.
  const userRole = await getUserRole(user.id);
  if (!userRole || !allowedRoles.includes(userRole)) {
    return redirect(opts?.unauthorizedRedirect ?? "/auth");
  }

  return user;
}
