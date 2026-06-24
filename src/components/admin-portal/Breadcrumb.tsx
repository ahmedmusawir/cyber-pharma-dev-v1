import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface Crumb {
  label: string;
  href?: string;
}

// Trail like "My Stores › Hyde Park Pharmacy › Invite member". The last crumb
// is the current page (never a link). Earlier crumbs link if given an href.
const Breadcrumb = ({ items }: { items: Crumb[] }) => {
  return (
    <nav aria-label="Breadcrumb" className="mb-3">
      <ol className="flex flex-wrap items-center gap-1.5 text-[13px] text-muted-foreground">
        {items.map((c, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={i} className="flex items-center gap-1.5">
              {i > 0 && (
                <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              {c.href && !isLast ? (
                <Link href={c.href} className="hover:text-foreground">
                  {c.label}
                </Link>
              ) : (
                <span
                  className={isLast ? "font-medium text-foreground" : ""}
                  aria-current={isLast ? "page" : undefined}
                >
                  {c.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
