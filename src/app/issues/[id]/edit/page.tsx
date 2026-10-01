"use client";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { IssueForm } from "@/components/IssueForm";
import { codeLooksValid, getIssue } from "@/lib/store";
import type { Issue } from "@/lib/types";

function editCodeKey(id: string) {
  return `rentalcheck-edit-code-${id}`;
}

function EditInner() {
  const params = useParams<{ id: string }>();
  const search = useSearchParams();
  const router = useRouter();
  const [code, setCode] = useState("");
  const [codeReady, setCodeReady] = useState(false);
  const [issue, setIssue] = useState<Issue | null | undefined>(undefined);
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    if (!params.id) return;
    const fromUrl = search.get("code") || "";
    let stored = "";
    try {
      stored = sessionStorage.getItem(editCodeKey(params.id)) || "";
    } catch {
      stored = "";
    }
    const next = fromUrl || stored;
    if (fromUrl) {
      try {
        sessionStorage.setItem(editCodeKey(params.id), fromUrl);
      } catch {
        /* ignore */
      }
      router.replace(`/issues/${params.id}/edit`);
    }
    setCode(next);
    setCodeReady(true);
  }, [params.id, search, router]);

  useEffect(() => {
    if (!params.id || !codeReady) return;
    void (async () => {
      setAllowed(null);
      const found = (await getIssue(params.id)) ?? null;
      setIssue(found);
      setAllowed(Boolean(found && code && (await codeLooksValid(params.id, code))));
    })();
  }, [params.id, code, codeReady]);

  if (!codeReady || issue === undefined || allowed === null) {
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
        <Link href={`/issues/${issue.id}`} className="hover:underline hover:text-teal-800 active:text-teal-800">
          ← Issue
        </Link>
      </p>
      <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight text-stone-900">Edit issue</h2>
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
