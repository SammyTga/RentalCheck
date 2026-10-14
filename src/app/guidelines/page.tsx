import Link from "next/link";

export default function GuidelinesPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-4 text-stone-700 leading-7">
      <p className="text-sm text-stone-500">
        <Link href="/" className="hover:underline hover:text-teal-800 active:text-teal-800">
          ← Feed
        </Link>
      </p>
      <h2 className="font-display text-2xl font-semibold tracking-tight text-stone-900">Guidelines</h2>
      <ul className="list-disc space-y-2 pl-5">
        <li>
          Only log an issue on RentalCheck if it has already been reported and is still unresolved.
        </li>
        <li>Use the exact rental address so others can look up the property.</li>
        <li>
          One issue per post. If the same address has two different issues,
          please post twice.
        </li>
        <li>Stick to the facts: what is wrong and what happened next.</li>
        <li>Response tags describe how the landlord / property manager responded.</li>
        <li>
          You may add up to four photos of the issue. Do not upload photos that show children or personal documents.
        </li>
        <li>
          Save your secret code to edit a post, mark it as resolved, or delete
          it.
        </li>
        <li>
          Do not post the names or contact details of landlords / property managers. No abuse or personal attacks.
        </li>
      </ul>
    </div>
  );
}
