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

function Timeline({ issue }: { issue: Issue }) {
  const resolved = issue.status === "resolved";
  const steps = [
    { label: "Reported", date: formatDate(issue.reportedToLandlordOn), tone: "done" as const },
    { label: "Posted", date: formatDate(issue.postedAt), tone: "done" as const },
    {
      label: resolved ? "Resolved" : "Unresolved",
      date: resolved && issue.resolvedAt ? formatDate(issue.resolvedAt) : "",
      tone: resolved ? "resolved" as const : "open" as const,
    },
  ];

  return (
    <ol className="relative mx-auto mt-5 grid w-full grid-cols-3 gap-2">
      <span className="absolute left-0 right-0 top-[6px] h-0.5 bg-stone-300" />
      {steps.map((step) => (
        <li key={step.label} className="relative flex min-w-0 flex-col items-center text-center">
          <span
            className={`z-10 h-3.5 w-3.5 shrink-0 rounded-full ${
              step.tone === "resolved"
                ? "bg-green-500"
                : step.tone === "open"
                  ? "bg-red-500"
                  : "bg-violet-700"
            }`}
          />
          <div className="mt-2 w-full rounded-lg border border-stone-300 bg-white px-1.5 py-1.5">
            <p className="text-xs font-semibold text-stone-900">{step.label}</p>
            {step.date ? (
              <p className="mt-0.5 text-xs leading-4 text-stone-700">{step.date}</p>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
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
      <div className="flex flex-wrap items-center gap-2">
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
      <p className="mt-2 text-base font-medium text-stone-800">{formatAddress(issue)}</p>
      {(issue.roomArea || issue.roomDetail) && (
        <p className="mt-2 text-base text-stone-800">
          Where: {[issue.roomArea, issue.roomDetail].filter(Boolean).join(" · ")}
        </p>
      )}
      <Timeline issue={issue} />
      {issue.status === "resolved" && issue.resolvedNote ? (
        <div className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          <p>This issue has been marked as resolved.</p>
          <p className="mt-1 break-long">{issue.resolvedNote}</p>
        </div>
      ) : null}
      <div className="mt-6 break-long whitespace-pre-wrap text-base leading-7 text-stone-800">
        {issue.description}
      </div>
      <PhotoGrid photos={issue.photoUrls ?? []} size="detail" />
      </div>
      <ManagePost issueId={issue.id} resolved={issue.status === "resolved"} />
    </article>
  );
}
