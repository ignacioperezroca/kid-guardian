"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "./utils";

export function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={cn(
        "rounded-2xl px-4 py-2 text-sm font-medium transition",
        active
          ? "bg-[color:var(--color-primary)]/10 text-[color:var(--color-primary)]"
          : "text-[color:var(--color-muted-foreground)] hover:bg-[color:var(--color-secondary)]/35 hover:text-[color:var(--color-foreground)]"
      )}
      aria-current={active ? "page" : undefined}
    >
      {children}
    </Link>
  );
}

