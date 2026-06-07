import type { AppRole } from "@/utils/app-role";
import type { User } from "./User";

export interface AuthSnapshot {
  user: User;
  role: AppRole | null;
  is_super_admin: boolean;
}
