"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
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
import { useAuthStore } from "@/store/useAuthStore";
import { AppRole } from "@/utils/app-role";

const Navbar = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  // Role-aware top-level nav (UI_SPEC §E/§F): role server-sourced (never
  // user_metadata). ADMIN → OwedBook · Admin Portal · Profile. MEMBER →
  // OwedBook · Profile (no Admin Portal, never an empty navbar). Active is
  // route-derived via usePathname.
  const role = useAuthStore((s) => s.role);
  const pathname = usePathname() ?? "";
  const isAdmin = role === AppRole.ADMIN;

  const navLinks = user
    ? [
        { label: "OwedBook", href: "/owedbook" },
        ...(isAdmin ? [{ label: "Admin Portal", href: "/admin-portal" }] : []),
        { label: "Profile", href: "/profile" },
      ]
    : [];

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      setIsLoading(false);
    };
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => fetchUser());
    fetchUser();
    return () => subscription.unsubscribe();
  }, [supabase]);

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = async () => {
    closeMenu();
    try {
      await useAuthStore.getState().logout();
      router.refresh();
      router.push("/auth");
    } catch {
      console.error("Failed to log out");
    }
  };

  const navLinkClass = (href: string) => {
    const active = pathname.startsWith(href);
    return `px-3 py-1 text-sm font-medium transition-colors ${
      active
        ? "text-navbar-foreground border-b-2 border-navbar-foreground font-semibold"
        : "text-navbar-foreground/70 hover:text-navbar-foreground"
    }`;
  };

  return (
    <header className="bg-navbar text-navbar-foreground">
      <div className="py-2 px-4 sm:px-5 flex justify-between items-center gap-2">
        <Link href="/" aria-label="Cyber Pharma — Home" onClick={closeMenu} className="shrink-0">
          <Image src="/brand/logo-color.svg" alt="Cyber Pharma" width={36} height={36} />
        </Link>

        {/* Desktop nav (≥ lg, role-aware) */}
        {navLinks.length > 0 && (
          <nav aria-label="Primary" className="hidden lg:flex items-center gap-1">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                aria-current={pathname.startsWith(l.href) ? "page" : undefined}
                className={navLinkClass(l.href)}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        )}

        {/* Desktop right cluster (≥ lg) */}
        <div className="hidden lg:flex items-center">
          <ThemeToggler />
          {!isLoading && (
            <>
              {user && <span className="mx-3 text-navbar-foreground">{user.email}</span>}
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
                <Link href="/auth" className="ml-3 text-sm font-medium hover:opacity-80">
                  Login
                </Link>
              )}
            </>
          )}
        </div>

        {/* Mobile hamburger (< lg) */}
        <button
          type="button"
          onClick={() => setMenuOpen((s) => !s)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          className="lg:hidden shrink-0 p-2 text-navbar-foreground hover:opacity-80"
        >
          {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile panel (< lg) — same role-aware links + account actions */}
      {menuOpen && (
        <div
          className="lg:hidden border-t border-navbar-foreground/20"
          role="dialog"
          aria-label="Menu"
        >
          <nav className="flex flex-col">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={closeMenu}
                aria-current={pathname.startsWith(l.href) ? "page" : undefined}
                className={`px-5 py-3 text-sm font-medium border-b border-navbar-foreground/20 ${
                  pathname.startsWith(l.href) ? "font-semibold" : "text-navbar-foreground/80"
                }`}
              >
                {l.label}
              </Link>
            ))}

            <div className="flex items-center justify-between px-5 py-3 border-b border-navbar-foreground/20">
              <span className="text-sm">{user ? user.email : "Theme"}</span>
              <ThemeToggler />
            </div>

            {!isLoading && user && (
              <button
                type="button"
                onClick={handleLogout}
                className="px-5 py-3 text-sm text-left bg-secondary text-secondary-foreground"
              >
                Log out
              </button>
            )}

            {!isLoading && !user && (
              <Link href="/auth" onClick={closeMenu} className="px-5 py-3 text-sm">
                Login
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
