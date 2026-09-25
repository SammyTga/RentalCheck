import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-4 text-stone-700 leading-7">
      <p className="text-sm text-stone-500">
        <Link href="/" className="hover:underline active:text-teal-800">
          ← Feed
        </Link>
      </p>
      <h2 className="text-2xl font-semibold text-stone-900">About</h2>
      <p>
        This site is a place for renters to post any unresolved issues or
        hazards at their rental property. It creates evidence value that
        assists with validation of issues.
      </p>
      <p>
        Only log an issue on this site if you have first informed the landlord
        or property manager and the issue has gone unresolved.
      </p>
      <p>
        Creating a post gives you a shareable link and a public record of your
        grievance.
      </p>
      <p>
        This aims to further encourage landlords to keep their tenants&apos;
        rentals up to standard and safe.
      </p>
      <p>
        Future renters can check this site to help make informed decisions
        about a property and its suitability for themselves or their family.
      </p>
      <p>
        This is not a place for abuse or accusations against landlords or
        property managers.
      </p>
    </div>
  );
}
