"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ManagePost } from "@/components/ManagePost";
import { PhotoGrid } from "@/components/PhotoGrid";
import { getIssue } from "@/lib/store";
import { formatAddress, type Issue } from "@/lib/types";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function formatDate(iso: string) {
  const raw = iso.includes("T") ? iso : `${iso}T00:00:00`;
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return iso;
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

export default function IssuePage() {
  const params = useParams<{ id: string }>();
  const [issue, setIssue] = useState<Issue | null | undefined>(undefined);

  useEffect(() => {
    void getIssue(params.id).then((found) => setIssue(found ?? null));
  }, [params.id]);

  if (issue === undefined) {
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

  return (
    <article className="mx-auto max-w-2xl">
      <p className="text-sm text-stone-500">
        <Link href="/" className="hover:underline">
          ← Feed
        </Link>
      </p>
      <div className="mt-4 flex flex-wrap gap-2 text-sm text-stone-800">
        <span className="rounded-full bg-stone-200 px-2 py-0.5 font-medium text-stone-800">
          {issue.category}
        </span>
        {(issue.responses ?? []).map((r) => (
          <span
            key={r}
            className="rounded-full bg-amber-50 px-2 py-0.5 font-medium text-amber-900"
          >
            {r}
          </span>
        ))}
        {issue.status === "resolved" && (
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-medium text-emerald-800">
            Resolved
          </span>
        )}
        <span>{formatAddress(issue)}</span>
      </div>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-stone-900">
        {issue.title}
      </h2>
      {(issue.roomArea || issue.roomDetail) && (
        <p className="mt-2 text-sm text-stone-800">
          Where: {[issue.roomArea, issue.roomDetail].filter(Boolean).join(" · ")}
        </p>
      )}
      <p className="mt-2 text-sm text-stone-800">
        First reported to landlord {formatDate(issue.reportedToLandlordOn)} by{" "}
        {issue.handle || "Anonymous"}
      </p>
      {issue.status === "resolved" && (
        <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          This issue has been marked resolved
          {issue.resolvedAt ? ` on ${formatDate(issue.resolvedAt)}` : ""}.
          {issue.resolvedNote ? ` ${issue.resolvedNote}` : ""}
        </p>
      )}
      <div className="mt-6 whitespace-pre-wrap text-base leading-7 text-stone-800">
        {issue.description}
      </div>
      <PhotoGrid photos={issue.photoUrls ?? []} size="detail" />
      <ManagePost issueId={issue.id} />
    </article>
  );
}
