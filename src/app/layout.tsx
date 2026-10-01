import type { Metadata } from "next";
import { Fraunces, Source_Sans_3 } from "next/font/google";
import { Header } from "@/components/Header";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
});

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-source",
});

export const metadata: Metadata = {
  title: "RentalCheck.co.nz",
  description:
    "Check a rental property in New Zealand. Search an address for issues tenants have logged.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${sourceSans.variable} h-full antialiased`}
    >
      <body className="flex min-h-dvh flex-col overflow-x-hidden bg-stone-50 font-sans text-stone-900">
        <script
          dangerouslySetInnerHTML={{
            __html:
              "document.addEventListener('touchstart',function(){},{passive:true});",
          }}
        />
        <Header />
        <main className="mx-auto w-full min-w-0 max-w-5xl flex-1 overflow-x-hidden px-4 py-8">{children}</main>
        <footer className="mx-auto mt-auto w-full max-w-5xl px-4 py-8 text-xs font-medium text-stone-600">
          RentalCheck.co.nz is an issues-only public record. It is not legal
          advice and does not replace reporting issues to your landlord,
          property manager or Tenancy Services.{" "}
          <a
            href="/contact"
            className="font-medium text-teal-800 underline hover:text-teal-950 active:text-teal-950"
          >
            Contact
          </a>
        </footer>
      </body>
    </html>
  );
}
