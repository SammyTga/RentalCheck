"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ManagePost } from "@/components/ManagePost";
import { PhotoGrid } from "@/components/PhotoGrid";
import { getIssue } from "@/lib/store";
import { displayCategory, formatAddress, type Issue } from "@/lib/types";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function ordinal(day: number) {
  const teen = day % 100;
  if (teen >= 11 && teen <= 13) return `${day}th`;
  switch (day % 10) {
    case 1:
      return `${day}st`;
    case 2:
      return `${day}nd`;
    case 3:
      return `${day}rd`;
    default:
      return `${day}th`;
  }
}

function formatDate(iso: string) {
  const raw = iso.includes("T") ? iso : `${iso}T00:00:00`;
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return iso;
  return `${ordinal(date.getDate())} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

export default function IssuePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [issue, setIssue] = useState<Issue | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const found = await getIssue(params.id);
      if (!cancelled) setIssue(found ?? null);
    }
    void load();
    window.addEventListener("pageshow", load);
    return () => {
      cancelled = true;
      window.removeEventListener("pageshow", load);
    };
  }, [params.id]);

  useEffect(() => {
    if (issue === null) router.replace("/");
  }, [issue, router]);

  if (!issue) {
    return <p className="text-sm text-stone-500">Loading…</p>;
  }

  return (
    <article className="mx-auto min-w-0 max-w-2xl">
      <p className="text-sm text-stone-500">
        <Link href="/" className="hover:underline hover:text-teal-800 active:text-teal-800">
          ← Feed
        </Link>
      </p>
      <div className="mt-4 min-w-0 overflow-hidden rounded-2xl border border-stone-400 bg-white p-4 sm:p-6">
      <p className="text-sm text-stone-800">
        Posted {formatDate(issue.postedAt)} by {issue.handle || "Anonymous"}
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-stone-300 px-2 py-0.5 text-sm font-medium text-stone-900">
          {displayCategory(issue.category)}
        </span>
        {issue.hidden && (
          <span className="rounded-full bg-violet-700 px-2 py-0.5 text-sm font-medium text-white">
            Hidden
          </span>
        )}
        {issue.status === "resolved" && (
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-sm font-medium text-emerald-800">
            Resolved
          </span>
        )}
        {(issue.responses ?? []).map((r) => (
          <span
            key={r}
            className="rounded-full bg-amber-200 px-2 py-px text-xs font-medium text-amber-950"
          >
            {r}
          </span>
        ))}
      </div>
      <p className="mt-2 text-sm font-medium text-stone-800">{formatAddress(issue)}</p>
      <h2 className="mt-3 break-long text-2xl font-semibold tracking-tight text-stone-900">
        {issue.title}
      </h2>
      {(issue.roomArea || issue.roomDetail) && (
        <p className="mt-2 text-sm text-stone-800">
          Where: {[issue.roomArea, issue.roomDetail].filter(Boolean).join(" · ")}
        </p>
      )}
      <p className="mt-2 text-sm text-stone-800">
        First reported to landlord/property manager {formatDate(issue.reportedToLandlordOn)}
      </p>
      {issue.status === "resolved" && (
        <div className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          <p>
            This issue has been marked as resolved
            {issue.resolvedAt ? ` on ${formatDate(issue.resolvedAt)}` : ""}.
          </p>
          {issue.resolvedNote ? (
            <p className="mt-1 break-long">{issue.resolvedNote}</p>
          ) : null}
        </div>
      )}
      <div className="mt-6 break-long whitespace-pre-wrap text-base leading-7 text-stone-800">
        {issue.description}
      </div>
      <PhotoGrid photos={issue.photoUrls ?? []} size="detail" />
      </div>
      <ManagePost issueId={issue.id} resolved={issue.status === "resolved"} />
    </article>
  );
}
