import Link from "next/link";

const POINTS = [
  "RentalCheck is a public record of property defects or safety issues affecting tenants at their homes.",
  "It helps create evidence value that may assist with validation and resolution of issues.",
  "Posting issues here encourages landlords to play by the rules and keep their properties up to standard.",
  "Creating a post gives you a shareable link of your rental's issues.",
  "Future renters can check this site to help make informed decisions about a property and its suitability. Posting here helps others.",
  "This is not a place for abuse or accusations against landlords / property managers.",
  "RentalCheck does not replace reporting issues to your landlord, property manager or Tenancy Services.",
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
