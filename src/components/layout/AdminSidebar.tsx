"use client";

import { type ReactNode } from "react";
import { usePathname } from "next/navigation";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { LayoutDashboard, User, Users, UserPlus } from "lucide-react";
import Link from "next/link";

interface NavItem {
  icon: ReactNode;
  label: string;
  href: string;
}

// Surface-aware sidebar (UI_SPEC v1.3 §C): ONE component, route-driven config.
// OwedBook surface → only Dashboard. Admin Portal surface → Users / Add Member / Profile.
const OWEDBOOK_ITEMS: NavItem[] = [
  { icon: <LayoutDashboard className="mr-2 h-4 w-4" />, label: "Dashboard", href: "/owedbook" },
];

const ADMIN_ITEMS: NavItem[] = [
  { icon: <Users className="mr-2 h-4 w-4" />, label: "Users", href: "/admin-portal/users" },
  { icon: <UserPlus className="mr-2 h-4 w-4" />, label: "Add Member", href: "/admin-portal/users/add-member" },
  { icon: <User className="mr-2 h-4 w-4" />, label: "Profile", href: "/profile" },
];

const AdminSidebar = () => {
  const pathname = usePathname() ?? "";
  const onAdmin = pathname.startsWith("/admin-portal");
  const items = onAdmin ? ADMIN_ITEMS : OWEDBOOK_ITEMS;
  const heading = onAdmin ? "Admin Portal" : "OwedBook";

  return (
    <Command className="bg-secondary">
      <CommandInput placeholder="Type a command or search..." />
      <CommandList className="px-8">
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading={heading}>
          {items.map((item) => {
            const active =
              item.href === "/owedbook"
                ? pathname.startsWith("/owedbook")
                : pathname === item.href;
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
    </Command>
  );
};

export default AdminSidebar;
