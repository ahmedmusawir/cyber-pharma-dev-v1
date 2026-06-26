"use client";

import { type ReactNode } from "react";
import { usePathname } from "next/navigation";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Store, CreditCard, Settings, ScrollText } from "lucide-react";
import Link from "next/link";
import LinkPendingProbe from "@/components/layout/LinkPendingProbe";
import FilterRail from "@/components/owedbook/FilterRail";
import { useOwedBook } from "@/components/owedbook/OwedBookContext";

interface NavItem {
  icon: ReactNode;
  label: string;
  href: string;
  // Active-state predicate — a section can own more than its own href (My
  // Stores owns the store drill-down at /admin-portal/stores/*).
  isActive: (pathname: string) => boolean;
}

// Surface-aware sidebar (UI_SPEC v1.4 §A.1/§C): ONE component, ONE container
// (same Command + command input). Only the CONTENT below the input differs —
// Admin Portal shows nav items; OwedBook shows the FilterRail.
// Owner-scoped nav (Phase 2.2 route takeover): My Stores · Billing · Settings ·
// Audit. The old user-CRUD at /admin-portal/users/* is removed.
const ADMIN_ITEMS: NavItem[] = [
  {
    icon: <Store className="mr-2 h-4 w-4" />,
    label: "My Stores",
    href: "/admin-portal",
    isActive: (p) => p === "/admin-portal" || p.startsWith("/admin-portal/stores"),
  },
  {
    icon: <CreditCard className="mr-2 h-4 w-4" />,
    label: "Billing",
    href: "/admin-portal/billing",
    isActive: (p) => p.startsWith("/admin-portal/billing"),
  },
  {
    icon: <Settings className="mr-2 h-4 w-4" />,
    label: "Settings",
    href: "/admin-portal/settings",
    isActive: (p) => p.startsWith("/admin-portal/settings"),
  },
  {
    icon: <ScrollText className="mr-2 h-4 w-4" />,
    label: "Audit log",
    href: "/admin-portal/audit",
    isActive: (p) => p.startsWith("/admin-portal/audit"),
  },
];

const AdminSidebar = () => {
  const pathname = usePathname() ?? "";
  const onAdmin = pathname.startsWith("/admin-portal");
  const { filters, pbmOptions, applyFilters, clearFilters } = useOwedBook();

  return (
    <Command className="bg-secondary">
      {onAdmin ? (
        <CommandList className="px-8">
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Admin Portal">
            {ADMIN_ITEMS.map((item) => {
              const active = item.isActive(pathname);
              return (
                <CommandItem key={item.href} className={active ? "font-bold text-primary" : ""}>
                  {item.icon}
                  <Link href={item.href} aria-current={active ? "page" : undefined}>
                    {item.label}
                    <LinkPendingProbe />
                  </Link>
                </CommandItem>
              );
            })}
          </CommandGroup>
        </CommandList>
      ) : (
        <div className="px-4 py-3">
          <FilterRail
            filters={filters}
            pbmOptions={pbmOptions}
            onApply={applyFilters}
            onClear={clearFilters}
          />
        </div>
      )}
    </Command>
  );
};

export default AdminSidebar;
