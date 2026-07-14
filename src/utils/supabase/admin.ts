// src/utils/supabase/admin.ts
// BLESSED INFRA — kept unconsumed by ruling 2026-07-14; expected consumer: privileged server ops (Phase 3+). /moose-portal carries its own service-role client — reconcile the duplicates at Phase 3. See agent_docs/KEEP_MANIFEST.md.
// CRITICAL: This file uses the service_role key and MUST ONLY be imported in server-side code.
// NEVER import this in client components or expose the service_role key to the browser.

import { createClient } from '@supabase/supabase-js'

/**
 * Creates a Supabase admin client with service_role privileges.
 * This client bypasses Row Level Security (RLS) and should only be used
 * for privileged operations like creating admin users or updating roles.
 * 
 * @returns Supabase admin client
 */
export const createAdminClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SECRET_KEY!

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase admin credentials')
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}
