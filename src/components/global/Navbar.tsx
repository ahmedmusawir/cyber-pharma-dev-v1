"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
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
import { usePathname } from "next/navigation";
import ThemeToggler from "./ThemeToggler";
import Logout from "../auth/Logout";
import { User as SupabaseUser } from "@supabase/auth-js";
import { createClient } from "@/utils/supabase/client";
import { useAuthStore } from "@/store/useAuthStore";
import { AppRole } from "@/utils/app-role";

const SURFACES = [
  { label: "OwedBook", href: "/owedbook" },
  { label: "Admin Portal", href: "/admin-portal" },
];

const Navbar = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  // Two-surface switcher (UI_SPEC v1.3 §B/§E). Role is server-sourced via
  // user_roles (never user_metadata); ADMIN sees both links, MEMBER sees none.
  // Active surface is route-derived — no new global state.
  const role = useAuthStore((s) => s.role);
  const pathname = usePathname() ?? "";

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

  return (
    <div className="bg-secondary py-2 px-5 flex justify-between items-center">
      <Link href="/" aria-label="Cyber Pharma — Home">
        <Image
          src="/brand/logo-color.svg"
          alt="Cyber Pharma"
          width={36}
          height={36}
        />
      </Link>

      {user && role === AppRole.ADMIN && (
        <nav aria-label="Surface switcher" className="flex items-center gap-1">
          {SURFACES.map((s) => {
            const active = pathname.startsWith(s.href);
            return (
              <Link
                key={s.href}
                href={s.href}
                aria-current={active ? "page" : undefined}
                className={`px-3 py-1 text-sm font-medium transition-colors ${
                  active
                    ? "text-foreground border-b-2 border-primary"
                    : "text-secondary-foreground hover:text-foreground"
                }`}
              >
                {s.label}
              </Link>
            );
          })}
        </nav>
      )}

      <div className="flex items-center">
        <ThemeToggler />

        {!isLoading && (
          <>
            {user && <span className="mr-3 text-secondary-foreground">{user.email}</span>}

            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger className="cursor-pointer">
                  <Avatar>
                    <AvatarFallback>{user.email?.[0]?.toUpperCase() ?? "U"}</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-popover">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <Logout />
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {!user && (
              <Link
                href="/auth"
                className="ml-3 text-sm font-medium text-secondary-foreground hover:text-muted-foreground"
              >
                Login
              </Link>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Navbar;
