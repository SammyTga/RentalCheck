"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Header() {
  const pathname = usePathname();
  const onNew = pathname === "/new";

  return (
    <header className="border-b border-stone-300 bg-white">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:py-5">
        <Link href="/" className="logo-home group min-w-0">
          <img
            src="/rentalcheck-logo.png"
            alt="RentalCheck.co.nz"
            className="h-20 w-auto max-w-[min(100%,520px)] sm:h-28 sm:max-w-[min(70%,820px)]"
          />
        </Link>
        <nav className="flex w-full flex-wrap items-center justify-start gap-x-4 gap-y-2 text-sm sm:w-auto sm:gap-x-3">
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
