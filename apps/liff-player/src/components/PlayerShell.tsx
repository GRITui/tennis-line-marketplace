"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const navigation = [
  { href: "/", label: "Discover", icon: "⌕" },
  { href: "/sessions", label: "Sessions", icon: "◷" },
  { href: "/passport", label: "Passport", icon: "✦" },
];

export function PlayerShell({
  children,
  title = "Tennis Line",
}: {
  children: ReactNode;
  title?: string;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#f6f8f5] text-[#17211c]">
      <header className="sticky top-0 z-30 border-b border-[#dfe8df] bg-[#f6f8f5]/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/" className="flex items-center gap-3" aria-label="Tennis Line home">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#173d2c] text-sm font-bold text-[#d8f36a] shadow-sm">
              TL
            </span>
            <span>
              <span className="block text-sm font-semibold tracking-tight">Tennis Line</span>
              <span className="hidden text-xs text-[#6d7d73] sm:block">Train with intention</span>
            </span>
          </Link>
          <div className="flex items-center gap-2 text-xs font-medium text-[#6d7d73]">
            <span className="hidden rounded-full bg-white px-3 py-2 shadow-sm sm:inline-flex">
              Bangkok
            </span>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#d8f36a] font-bold text-[#173d2c]">
              P
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-5 pb-28 pt-7 sm:px-8 sm:pt-10">{children}</main>

      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-[#dfe8df] bg-white/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_30px_rgba(23,61,44,0.06)] backdrop-blur sm:bottom-5 sm:left-1/2 sm:right-auto sm:w-auto sm:-translate-x-1/2 sm:rounded-2xl sm:border sm:px-3 sm:pb-3"
      >
        <div className="mx-auto flex max-w-md items-center justify-around gap-1 sm:gap-2">
          {navigation.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex min-w-[88px] flex-col items-center gap-1 rounded-xl px-3 py-2 text-[11px] font-semibold transition ${
                  active
                    ? "bg-[#173d2c] text-white"
                    : "text-[#7b8b81] hover:bg-[#eef4ed] hover:text-[#173d2c]"
                }`}
              >
                <span className="text-base leading-none" aria-hidden="true">
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
