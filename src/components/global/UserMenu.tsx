"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Logout from "../auth/Logout";
import { User as SupabaseUser } from "@supabase/auth-js";
import { createClient } from "@/utils/supabase/client";
import { useAuthStore } from "@/store/useAuthStore";
import { AppRole } from "@/utils/app-role";

const UserMenu = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const role = useAuthStore((s) => s.role);
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      setIsLoading(false);
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      fetchUser();
    });

    fetchUser();

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  if (isLoading) return null;

  if (user) {
    const portalHref = role === AppRole.ADMIN ? "/admin-portal" : "/owedbook";
    const portalLabel = role === AppRole.ADMIN ? "Admin portal" : "OwedBook";

    return (
      <div className="flex items-center px-3">
        <DropdownMenu>
          <DropdownMenuTrigger className="cursor-pointer">
            <Avatar>
              <AvatarFallback>{user.email?.[0]?.toUpperCase() ?? "U"}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-popover" align="end">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-semibold truncate">{user.email}</span>
                {role && (
                  <span className="text-xs text-muted-foreground capitalize">{role}</span>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={portalHref}>{portalLabel}</Link>
            </DropdownMenuItem>
            <Logout />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  return (
    <>
      <Link
        href="/auth"
        className="uppercase px-5 h-full flex items-center text-foreground hover:bg-accent/10 transition-colors"
      >
        Log in
      </Link>
      <Link
        href="/register"
        className="uppercase px-7 h-full flex items-center bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors"
      >
        Start free trial
      </Link>
    </>
  );
};

export default UserMenu;
