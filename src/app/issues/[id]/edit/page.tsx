"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { IssueForm } from "@/components/IssueForm";
import { codeLooksValid, getIssue } from "@/lib/store";
import type { Issue } from "@/lib/types";

function EditInner() {
  const params = useParams<{ id: string }>();
  const search = useSearchParams();
  const code = search.get("code") || "";
  const [issue, setIssue] = useState<Issue | null | undefined>(undefined);
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    void (async () => {
      setAllowed(null);
      const found = (await getIssue(params.id)) ?? null;
      setIssue(found);
      setAllowed(Boolean(found && code && (await codeLooksValid(params.id, code))));
    })();
  }, [params.id, code]);

  if (issue === undefined || allowed === null) {
    return <p className="text-sm text-stone-500">Loading…</p>;
  }

  if (!issue) {
    return (
      <div>
        <p>This issue could not be found.</p>
        <Link href="/" className="mt-4 inline-block text-sm underline">
          Back to feed
        </Link>
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="mx-auto max-w-xl">
        <p>That code does not match this post.</p>
        <Link href={`/issues/${issue.id}`} className="mt-4 inline-block text-sm underline">
          Back to issue
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <p className="text-sm text-stone-500">
        <Link href={`/issues/${issue.id}`} className="hover:underline">
          ← Issue
        </Link>
      </p>
      <h2 className="mt-3 text-2xl font-semibold text-stone-900">Edit issue</h2>
      <p className="mt-2 mb-6 text-stone-600">
        Change the details, then save. The original post date stays the same.
      </p>
      <IssueForm existing={issue} manageCode={code} />
    </div>
  );
}

export default function EditIssuePage() {
  return (
    <Suspense>
      <EditInner />
    </Suspense>
  );
}
