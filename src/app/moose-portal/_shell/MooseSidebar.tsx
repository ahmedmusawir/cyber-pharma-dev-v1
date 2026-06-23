// TODO: REMOVE — temporary operator tool sidebar (copy of AdminSidebar's nav
// branch, hard-coded to /moose-portal routes) so it survives the admin FFM.
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

interface NavItem {
  icon: ReactNode;
  label: string;
  href: string;
}

const MOOSE_ITEMS: NavItem[] = [
  { icon: <Users className="mr-2 h-4 w-4" />, label: "Users", href: "/moose-portal/users" },
  { icon: <UserPlus className="mr-2 h-4 w-4" />, label: "Add Member", href: "/moose-portal/users/add-member" },
  { icon: <User className="mr-2 h-4 w-4" />, label: "Profile", href: "/profile" },
];

const MooseSidebar = () => {
  const pathname = usePathname() ?? "";

  return (
    <Command className="bg-secondary">
      <CommandList className="px-8">
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Moose Portal">
          {MOOSE_ITEMS.map((item) => {
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
    </Command>
  );
};

export default MooseSidebar;
