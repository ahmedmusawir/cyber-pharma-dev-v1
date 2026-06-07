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
import ThemeToggler from "./ThemeToggler";
import Logout from "../auth/Logout";
import { User as SupabaseUser } from "@supabase/auth-js";
import { createClient } from "@/utils/supabase/client";

const Navbar = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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
