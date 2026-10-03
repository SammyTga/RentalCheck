"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Header() {
  const pathname = usePathname();
  const onNew = pathname === "/new";

  return (
    <header className="border-b border-stone-300 bg-white">
      <div className="mx-auto flex min-h-[116px] max-w-5xl flex-col gap-3 px-4 py-4 sm:min-h-0 sm:flex-row sm:items-center sm:justify-between sm:py-5">
        <Link href="/" className="logo-home group min-w-0">
          <img
            src="/rentalcheck-logo.png"
            alt="RentalCheck.co.nz"
            className="h-10 w-auto max-w-[min(100%,270px)] sm:h-[60px] sm:max-w-[min(70%,430px)]"
          />
        </Link>
        <nav className="flex w-full flex-wrap items-center justify-start gap-x-4 gap-y-2 font-sans text-sm sm:w-auto sm:gap-x-3">
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
          {onNew ? (
            <span
              aria-hidden
              className="invisible rounded-full px-3 py-1 font-medium sm:hidden"
            >
              Log an issue
            </span>
          ) : (
            <Link
              href="/new"
              className="rounded-full bg-teal-800 px-3 py-1 font-medium text-white hover:bg-teal-950 active:bg-teal-950"
            >
              Log an issue
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
