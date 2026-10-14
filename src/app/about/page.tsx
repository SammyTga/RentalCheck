import Link from "next/link";

const POINTS = [
  "RentalCheck is a public record of unresolved property defects or safety issues affecting tenants at their homes.",
  "It helps create evidence value that may assist with validation and resolution of issues.",
  "Posting unresolved issues encourages landlords to keep their properties up to standard. A poor public maintenance history can affect a rental’s desirability.",
  "Posting gives you a shareable link of your rental's issues.",
  "Potential tenants can view RentalCheck to help make informed decisions about a property and its suitability. Posting helps others and pays it forward.",
  "Resolved issues stay on RentalCheck with a clear ‘Resolved’ label and note. This shows the property’s history.",
  "This is not a place for abuse or personal attacks against landlords / property managers.",
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-4 text-stone-700 leading-7">
      <p className="text-sm text-stone-500">
        <Link href="/" className="hover:underline hover:text-teal-800 active:text-teal-800">
          ← Feed
        </Link>
      </p>
      <h2 className="font-display text-2xl font-semibold tracking-tight text-stone-900">About</h2>
      <ul className="list-disc space-y-2 pl-5">
        {POINTS.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </div>
  );
}
