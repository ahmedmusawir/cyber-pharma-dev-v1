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
import { User, Users, UserPlus } from "lucide-react";
import Link from "next/link";
import FilterRail from "@/components/owedbook/FilterRail";
import { useOwedBook } from "@/components/owedbook/OwedBookContext";

interface NavItem {
  icon: ReactNode;
  label: string;
  href: string;
}

// Surface-aware sidebar (UI_SPEC v1.4 §A.1/§C): ONE component, ONE container
// (same Command + command input). Only the CONTENT below the input differs —
// Admin Portal shows nav items; OwedBook shows the FilterRail.
const ADMIN_ITEMS: NavItem[] = [
  { icon: <Users className="mr-2 h-4 w-4" />, label: "Users", href: "/admin-portal/users" },
  { icon: <UserPlus className="mr-2 h-4 w-4" />, label: "Add Member", href: "/admin-portal/users/add-member" },
  { icon: <User className="mr-2 h-4 w-4" />, label: "Profile", href: "/profile" },
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
              const active = pathname === item.href;
              return (
                <CommandItem key={item.href} className={active ? "font-bold text-primary" : ""}>
                  {item.icon}
                  <Link href={item.href} aria-current={active ? "page" : undefined}>
                    {item.label}
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
