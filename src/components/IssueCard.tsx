import Link from "next/link";
import type { Issue } from "@/lib/types";
import { PhotoGrid } from "./PhotoGrid";

export function IssueCard({ issue }: { issue: Issue }) {
  const responseTag = (issue.responses ?? [])[0];

  return (
    <article className="min-w-0 overflow-hidden rounded-2xl border border-stone-400 bg-white p-5 transition hover:border-stone-600 hover:shadow-sm">
      <div className="flex flex-wrap items-center gap-2 text-sm text-stone-800">
        <span className="rounded-full bg-stone-100 px-2 py-0.5 font-medium text-stone-700">
          {issue.category}
        </span>
        {issue.status === "resolved" && (
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-medium text-emerald-800">
            Resolved
          </span>
        )}
        {responseTag && (
          <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-900">
            {responseTag}
          </span>
        )}
      </div>
      {(issue.roomArea || issue.roomDetail) && (
        <p className="mt-2 text-base font-medium text-stone-900">
          Where: {[issue.roomArea, issue.roomDetail].filter(Boolean).join(" · ")}
        </p>
      )}
      <h2 className="mt-3 break-long text-lg font-semibold text-stone-900">
        <Link
          href={`/issues/${issue.id}`}
          className="text-stone-900 underline decoration-stone-400 underline-offset-4 hover:decoration-teal-800 active:text-teal-800"
        >
          {issue.title}
        </Link>
      </h2>
      <p className="mt-2 max-w-[50%] line-clamp-1 break-long text-base leading-6 text-stone-800">
        {issue.description}
      </p>
      <PhotoGrid photos={issue.photoUrls ?? []} size="card" />
    </article>
  );
}
