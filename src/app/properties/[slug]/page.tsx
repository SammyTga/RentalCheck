"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { IssueCard } from "@/components/IssueCard";
import { getIssuesByPropertySlug } from "@/lib/store";
import { formatAddress, type Issue } from "@/lib/types";

export default function PropertyPage() {
  const params = useParams<{ slug: string }>();
  const [issues, setIssues] = useState<Issue[] | null>(null);

  useEffect(() => {
    void getIssuesByPropertySlug(params.slug).then(setIssues);
  }, [params.slug]);

  if (issues === null) {
    return <p className="text-sm text-stone-500">Loading…</p>;
  }

  if (issues.length === 0) {
    return (
      <div>
        <p>No issues are logged for this address yet.</p>
        <Link href="/" className="mt-4 inline-block text-sm underline">
          Back to feed
        </Link>
      </div>
    );
  }

  const sample = issues[0];

  return (
    <div className="mx-auto max-w-2xl">
      <p className="text-sm text-stone-500">
        <Link href="/" className="hover:underline active:text-teal-800">
          ← Feed
        </Link>
      </p>
      <p className="mt-4 text-xs font-medium uppercase tracking-widest text-stone-500">
        Property
      </p>
      <h2 className="mt-1 text-3xl font-semibold tracking-tight text-stone-900">
        {formatAddress(sample)}
      </h2>
      <p className="mt-2 text-stone-600">
        {issues.length} issue{issues.length === 1 ? "" : "s"} logged at this
        address.
      </p>
      <p className="mt-4">
        <Link
          href={`/new?${new URLSearchParams({
            unit: sample.unit || "",
            streetNumber: sample.streetNumber,
            streetName: sample.streetName,
            area: sample.area || "",
            city: sample.city,
            postcode: sample.postcode || "",
          }).toString()}`}
          className="inline-block rounded-full bg-teal-800 px-4 py-2 text-sm font-medium text-white hover:bg-teal-950 active:bg-teal-950"
        >
          Log another issue here
        </Link>
      </p>
      <div className="mt-8 space-y-4">
        {issues.map((issue) => (
          <IssueCard key={issue.id} issue={issue} />
        ))}
      </div>
    </div>
  );
}
