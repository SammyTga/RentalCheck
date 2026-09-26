"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { IssueCard } from "./IssueCard";
import { getIssues } from "@/lib/store";
import {
  addressSearchText,
  CATEGORIES,
  formatAddress,
  propertySlug,
  type Issue,
} from "@/lib/types";

export function Feed({ initialIssues }: { initialIssues?: Issue[] }) {
  const [issues, setIssues] = useState<Issue[] | null>(initialIssues ?? null);
  const [loadError, setLoadError] = useState("");
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("All");

  useEffect(() => {
    if (initialIssues) {
      setIssues(initialIssues);
      return;
    }
    void getIssues()
      .then((list) => {
        setIssues(list);
        setLoadError("");
      })
      .catch((err: unknown) => {
        setIssues([]);
        setLoadError(err instanceof Error ? err.message : "Could not load issues.");
      });
  }, [initialIssues]);

  const filtered = (issues ?? []).filter((issue) => {
    const hay = addressSearchText(issue);
    const words = q
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    const matchesQ = words.length === 0 || words.every((word) => hay.includes(word));
    const matchesCat = category === "All" || issue.category === category;
    return matchesQ && matchesCat;
  });

  const groups = new Map<string, Issue[]>();
  for (const issue of filtered) {
    const key = propertySlug(issue);
    const list = groups.get(key) ?? [];
    list.push(issue);
    groups.set(key, list);
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <input
          value={q}
          maxLength={120}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search street address or suburb"
          className="flex-1 rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-stone-500"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-stone-500"
        >
          <option>All</option>
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>

      {issues === null ? (
        <p className="text-sm text-stone-800">Loading issues…</p>
      ) : loadError ? (
        <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {loadError}
        </p>
      ) : filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed border-stone-300 p-8 text-center text-stone-500">
          No issues match that search yet.
        </p>
      ) : (
        <div className="space-y-6">
          {[...groups.entries()].map(([slug, group]) => (
            <section
              key={slug}
              className="rounded-2xl border border-stone-400 bg-stone-100/60 p-4"
            >
              <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                <Link
                  href={`/properties/${slug}`}
                  className="font-semibold text-stone-900 hover:underline active:text-teal-800"
                >
                  {formatAddress(group[0])}
                </Link>
                <span className="text-xs text-stone-500">
                  {group.length} issue{group.length === 1 ? "" : "s"}
                </span>
              </div>
              <div className="space-y-3">
                {group.map((issue) => (
                  <IssueCard key={issue.id} issue={issue} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
