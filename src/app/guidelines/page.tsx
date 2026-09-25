import Link from "next/link";

export default function GuidelinesPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-4 text-stone-700 leading-7">
      <p className="text-sm text-stone-500">
        <Link href="/" className="hover:underline active:text-teal-800">
          ← Feed
        </Link>
      </p>
      <h2 className="text-2xl font-semibold text-stone-900">Guidelines</h2>
      <ul className="list-disc space-y-2 pl-5">
        <li>
          Only log an issue on this site if it has first been reported and gone
          unresolved.
        </li>
        <li>Use the exact rental address so others can look up that property.</li>
        <li>
          One issue per post. If the same address has two different issues,
          please post twice.
        </li>
        <li>Stick to facts: what is wrong and what you asked for.</li>
        <li>
          Do not post landlord or property manager names or contact details.
        </li>
        <li>
          Response tags describe how the issue was handled, not a general
          rating of a person.
        </li>
        <li>
          You may add up to four photos of the issue. Do not post photos that
          show children or personal documents.
        </li>
        <li>
          Save your secret code to edit a post, mark it as resolved, or delete
          it.
        </li>
      </ul>
    </div>
  );
}
