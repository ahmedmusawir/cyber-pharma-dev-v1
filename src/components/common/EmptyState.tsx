"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

export interface EmptyStateProps {
  icon: ReactNode;
  headline: string;
  subcopy?: string;
  action?: { label: string; onClick: () => void };
}

const EmptyState = ({ icon, headline, subcopy, action }: EmptyStateProps) => {
  return (
    <div
      role="status"
      className="flex flex-col items-center justify-center text-center py-12 px-6 gap-3"
    >
      <div className="text-muted-foreground" aria-hidden="true">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-foreground">{headline}</h3>
      {subcopy && (
        <p className="text-sm text-muted-foreground max-w-md">{subcopy}</p>
      )}
      {action && (
        <Button onClick={action.onClick} className="mt-2">
          {action.label}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
