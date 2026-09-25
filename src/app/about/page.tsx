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
        RentalCheck is a public record of property defects or safety issues
        affecting tenants at their homes.
      </p>
      <p>
        It helps create evidence value that assists with validation and
        resolution of issues.
      </p>
      <p>
        Future renters can check this site to help make informed decisions
        about a property and its suitability for themselves or their family.
      </p>
      <p>
        Creating a post gives you a shareable link of your rental&apos;s issues.
      </p>
      <p>
        This site aims to further encourage landlords to keep their tenants&apos;
        rentals up to standard and safe.
      </p>
      <p>
        This is not a place for abuse or accusations against landlords or
        property managers.
      </p>
    </div>
  );
}
