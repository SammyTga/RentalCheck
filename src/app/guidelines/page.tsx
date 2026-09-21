import Link from "next/link";

export default function GuidelinesPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-4 text-stone-700 leading-7">
      <p className="text-sm text-stone-500">
        <Link href="/" className="hover:underline">
          ← Feed
        </Link>
      </p>
      <h2 className="text-2xl font-semibold text-stone-900">Guidelines</h2>
      <p>
        RentalCheck is a public record of property defects or safety
        issues affecting tenants at a specific address that have already been
        reported to the owner or manager.
      </p>
      <ul className="list-disc space-y-2 pl-5">
        <li>
          Make sure to only log an issue on this site if it has first been
          reported and gone ignored, unresolved, disputed or you have been
          harassed and threatened with eviction unfairly.
        </li>
        <li>Use the exact rental address so others can look up that property.</li>
        <li>Say where in the home the issue is, if you can.</li>
        <li>Stick to facts: what is wrong, dates, what you asked for.</li>
        <li>
          Do not post occupant, landlord or property manager names or phone
          numbers, or other personal contact details.
        </li>
        <li>
          Response tags describe how the issue was handled, not a general
          rating of a person.
        </li>
        <li>
          You may add up to four photos of the issue. Do not post photos that
          show children, faces, ID documents, sensitive documents, or names and
          phone numbers.
        </li>
        <li>No positive reviews. This is an issues-only log.</li>
        <li>Save your secret code to edit a post, mark it as resolved, or delete it.</li>
      </ul>
      <p>
        Posts may be removed if they look like spam, harassment, or claims
        unrelated to a tenancy.
      </p>
    </div>
  );
}
