"use client";

import * as React from "react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoonIcon, SunIcon } from "lucide-react";

// `onSelect` fires after a theme is picked — lets a host (e.g. the Navbar mobile
// menu) close itself once the choice is made. Optional; desktop usages omit it.
const ThemeToggler = ({ onSelect }: { onSelect?: () => void } = {}) => {
  const { setTheme } = useTheme();

  const pick = (theme: string) => {
    setTheme(theme);
    onSelect?.();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size={null}
          className="mr-5 p-2"
        >
          <SunIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <MoonIcon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => pick("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => pick("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => pick("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ThemeToggler;
