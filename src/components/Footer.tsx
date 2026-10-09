"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Footer() {
  const path = usePathname();
  const onContact = path === "/contact";

  return (
    <footer className="mx-auto mt-auto w-full max-w-5xl px-4 py-8 text-center text-xs font-medium text-stone-600">
      RentalCheck.co.nz{" "}
      <Link
        href={onContact ? "/" : "/contact"}
        className="font-medium text-teal-800 underline hover:text-teal-950 active:text-teal-950"
      >
        {onContact ? "Home" : "Contact"}
      </Link>
    </footer>
  );
}
