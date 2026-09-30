"use client";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { IssueForm } from "@/components/IssueForm";
import { codeLooksValid, getIssue } from "@/lib/store";
import type { Issue } from "@/lib/types";

function EditInner() {
  const params = useParams<{ id: string }>();
  const search = useSearchParams();
  const router = useRouter();
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
    router.replace("/");
    return <p className="text-sm text-stone-500">Loading…</p>;
  }

  if (!allowed) {
    router.replace(`/issues/${issue.id}`);
    return <p className="text-sm text-stone-500">Loading…</p>;
  }

  return (
    <div className="mx-auto max-w-2xl">
      <p className="text-sm text-stone-500">
        <Link href={`/issues/${issue.id}`} className="hover:underline active:text-teal-800">
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
