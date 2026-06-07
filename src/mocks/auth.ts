/**
 * DELETABLE. Mock AuthSnapshot fixtures for component tests that stub useAuthStore.
 *
 * Not mocking an auth service — Phase 1 consumes kit primitives directly per the
 * option-(b) ruling (2026-06-05). Tests destructure these AuthSnapshot fixtures
 * into the store's actual shape via useAuthStore.setState(...).
 *
 * When Phase 2 introduces Frank-domain mocks (businesses, user_data, etc.) they
 * live in this same directory under separate files and swap in/out independently.
 */

import { AppRole } from "@/utils/app-role";
import type { AuthSnapshot } from "@/types/AuthSnapshot";

export const mockAdminUser: AuthSnapshot = {
  user: {
    id: "00000000-0000-0000-0000-000000000001",
    email: "admin@cyberpharma.test",
    created_at: "2026-06-05T00:00:00.000Z",
    updated_at: "2026-06-05T00:00:00.000Z",
  },
  role: AppRole.ADMIN,
  is_super_admin: false,
};

export const mockMemberUser: AuthSnapshot = {
  user: {
    id: "00000000-0000-0000-0000-000000000002",
    email: "member@cyberpharma.test",
    created_at: "2026-06-05T00:00:00.000Z",
    updated_at: "2026-06-05T00:00:00.000Z",
  },
  role: AppRole.MEMBER,
  is_super_admin: false,
};

export const mockUnauthenticated: AuthSnapshot | null = null;
