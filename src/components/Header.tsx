"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Header() {
  const pathname = usePathname();
  const onNew = pathname === "/new";

  return (
    <header className="border-b border-stone-300 bg-white">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:py-4">
        <Link href="/" className="logo-home group min-w-0">
          <img
            src="/rentalcheck-logo.png"
            alt="RentalCheck.co.nz"
            className="h-11 w-auto max-w-[min(100%,260px)] sm:h-12 sm:max-w-[340px]"
          />
        </Link>
        <nav className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
          {pathname !== "/about" && (
            <Link href="/about" className="font-medium text-teal-800 hover:text-teal-950 active:text-teal-950">
              About
            </Link>
          )}
          {pathname !== "/guidelines" && (
            <Link href="/guidelines" className="font-medium text-teal-800 hover:text-teal-950 active:text-teal-950">
              Guidelines
            </Link>
          )}
          {pathname !== "/contact" && (
            <Link href="/contact" className="font-medium text-teal-800 hover:text-teal-950 active:text-teal-950">
              Contact
            </Link>
          )}
          {!onNew && (
            <Link
              href="/new"
              className="rounded-full bg-teal-800 px-3 py-1.5 font-medium text-white hover:bg-teal-950 active:bg-teal-950 sm:px-4 sm:py-2"
            >
              Log an issue
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
