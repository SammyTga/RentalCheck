import { Suspense } from "react";
import { IssueForm } from "@/components/IssueForm";
import Link from "next/link";

export default function NewIssuePage() {
  return (
    <div className="mx-auto max-w-2xl">
      <p className="text-sm text-stone-500">
        <Link href="/" className="hover:underline">
          ← Feed
        </Link>
      </p>
      <h2 className="mt-3 text-2xl font-semibold text-stone-900">
        Log an issue
      </h2>
      <p className="mt-2 mb-6 text-stone-600">
        No account needed. Posts are public and can be anonymous. Make sure to
        read the guidelines before logging an issue. You will be given a secret
        code once done so you can edit your post, mark it as resolved, or
        delete it. Only log one issue per post. If the same address has two
        different issues, please post twice. Issues will be grouped by address.
      </p>
      <Suspense>
        <IssueForm />
      </Suspense>
    </div>
  );
}
