import type { Metadata } from "next";
import { Header } from "@/components/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: "RentalCheck.co.nz",
  description:
    "Check a rental address for logged issues. Issues-only public record. rentalcheck.co.nz",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-dvh flex-col bg-stone-50 font-sans text-stone-900">
        <script
          dangerouslySetInnerHTML={{
            __html:
              "document.addEventListener('touchstart',function(){},{passive:true});",
          }}
        />
        <Header />
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>
        <footer className="mx-auto mt-auto w-full max-w-5xl px-4 py-8 text-xs font-medium text-stone-600">
          RentalCheck.co.nz is an issues-only public record. It is not legal
          advice and does not replace reporting issues to your landlord,
          property manager or Tenancy Services.{" "}
          <a
            href="/contact"
            className="font-medium text-teal-800 underline active:text-teal-950"
          >
            Contact
          </a>
        </footer>
      </body>
    </html>
  );
}
