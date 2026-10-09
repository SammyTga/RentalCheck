import Link from "next/link";
import { displayCategory, type Issue } from "@/lib/types";
import { PhotoGrid } from "./PhotoGrid";

export function IssueCard({ issue }: { issue: Issue }) {
  const responseTag = (issue.responses ?? [])[0];

  return (
    <article className="min-w-0 overflow-hidden rounded-2xl border border-stone-400 bg-white p-5 transition hover:border-stone-600 hover:shadow-sm">
      <div className="flex flex-wrap items-center gap-2 text-sm text-stone-800">
        <span className="rounded-full bg-[#ffb23a] px-2 py-0.5 font-medium text-stone-950">
          {displayCategory(issue.category)}
        </span>
        {issue.status === "resolved" && (
          <span className="rounded-full px-2 py-0.5 font-medium text-stone-950" style={{ backgroundColor: "#46e83a" }}>
            Resolved
          </span>
        )}
        {responseTag && (
          <span className="rounded-full bg-[#fff15a] px-2 py-0.5 font-medium text-stone-950">
            {responseTag}
          </span>
        )}
      </div>
      {(issue.roomArea || issue.roomDetail) && (
        <p className="mt-2 text-base font-medium text-stone-900">
          Where: {[issue.roomArea, issue.roomDetail].filter(Boolean).join(" · ")}
        </p>
      )}
      <h2 className="mt-3 max-w-full break-long text-lg font-semibold text-stone-900 sm:max-w-[50%]">
        <Link
          href={`/issues/${issue.id}`}
          className="line-clamp-1 text-stone-900 underline decoration-stone-400 underline-offset-4 hover:text-teal-800 hover:decoration-teal-800 active:text-teal-800 active:decoration-teal-800"
        >
          {issue.description}
        </Link>
      </h2>
      <PhotoGrid photos={issue.photoUrls ?? []} size="card" />
    </article>
  );
}
