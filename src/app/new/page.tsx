import { Suspense } from "react";
import { IssueForm } from "@/components/IssueForm";
import Link from "next/link";

export default function NewIssuePage() {
  return (
    <div className="mx-auto max-w-2xl">
      <p className="text-sm text-stone-500">
        <Link href="/" className="hover:underline hover:text-teal-800 active:text-teal-800">
          ← Feed
        </Link>
      </p>
      <h2 className="font-display mt-3 text-2xl font-semibold tracking-tight text-stone-900">
        Log an issue
      </h2>
      <p className="mt-2 mb-6 text-stone-600">
        No account needed. Posts are public and can be anonymous.
      </p>
      <Suspense>
        <IssueForm />
      </Suspense>
    </div>
  );
}
