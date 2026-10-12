import Link from "next/link";
import { ContactForm } from "@/components/ContactForm";

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-4 text-stone-700 leading-7">
      <p className="text-sm text-stone-500">
        <Link href="/" className="hover:underline hover:text-teal-800 active:text-teal-800">
          ← Feed
        </Link>
      </p>
      <h2 className="font-display text-2xl font-semibold tracking-tight text-stone-900">Contact</h2>
      <ContactForm />
    </div>
  );
}
