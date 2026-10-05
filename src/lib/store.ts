"use client";

import { newManageCode, propertySlug, type Issue } from "./types";

const KEY = "propertycheck-issues-v3";
let live: boolean | null = null;

function codesMatch(stored: string, given: string) {
  const a = stored.trim();
  const b = given.trim();
  if (a === b) return { ok: true as const };
  if (a.toUpperCase() === b.toUpperCase()) {
    return { ok: false as const, message: "The code is case sensitive." };
  }
  return { ok: false as const, message: "That code does not match this post." };
}

async function timedFetch(url: string) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 15000);
  try {
    return await fetch(url, { signal: ctrl.signal, cache: "no-store" });
  } finally {
    clearTimeout(timer);
  }
}

export async function isLive() {
  if (live !== null) return live;
  try {
    const res = await timedFetch("/api/status");
    const data = (await res.json()) as { database?: boolean };
    live = Boolean(data.database);
  } catch {
    live = false;
  }
  return live;
}

function read(): Issue[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Issue[];
    const byId = new Map<string, Issue>();
    for (const issue of parsed) byId.set(issue.id, issue);
    return [...byId.values()].sort(
      (a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime(),
    );
  } catch {
    return [];
  }
}

function write(issues: Issue[]) {
  localStorage.setItem(KEY, JSON.stringify(issues));
}

export async function getIssues(): Promise<Issue[]> {
  if (await isLive()) {
    const res = await timedFetch("/api/issues");
    const data = (await res.json()) as { issues?: Issue[]; error?: string };
    if (!res.ok) throw new Error(data.error || "Could not load issues.");
    return data.issues || [];
  }
  return read().filter((i) => !i.hidden);
}

export async function getIssue(id: string): Promise<Issue | undefined> {
  if (await isLive()) {
    const res = await fetch(`/api/issues/${id}`);
    if (!res.ok) return undefined;
    const data = (await res.json()) as { issue?: Issue };
    return data.issue;
  }
  return read().find((i) => i.id === id && !i.hidden);
}

export async function getIssuesByPropertySlug(slug: string): Promise<Issue[]> {
  return (await getIssues()).filter((issue) => propertySlug(issue) === slug);
}

export type EditableFields = Omit<
  Issue,
  "id" | "postedAt" | "hidden" | "manageCode" | "status" | "resolvedAt" | "resolvedNote"
>;

export async function addIssue(
  issue: Omit<Issue, "id" | "postedAt" | "hidden" | "manageCode" | "status">,
): Promise<Issue> {
  if (await isLive()) {
    const res = await fetch("/api/issues", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(issue),
    });
    const data = (await res.json()) as { issue?: Issue; error?: string };
    if (!res.ok || !data.issue) throw new Error(data.error || "Could not publish.");
    return data.issue;
  }
  const next: Issue = {
    ...issue,
    id: crypto.randomUUID(),
    postedAt: new Date().toISOString(),
    status: "open",
    manageCode: newManageCode(),
  };
  write([next, ...read()]);
  return next;
}

export async function updateIssue(
  id: string,
  code: string,
  fields: EditableFields,
): Promise<{ ok: boolean; message: string; issue?: Issue }> {
  if (await isLive()) {
    const res = await fetch(`/api/issues/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, action: "edit", fields }),
    });
    const data = (await res.json()) as { ok?: boolean; message?: string; error?: string; issue?: Issue };
    return {
      ok: res.ok,
      message: data.message || data.error || "Could not update.",
      issue: data.issue,
    };
  }
  const all = read();
  const index = all.findIndex((i) => i.id === id);
  if (index === -1) return { ok: false, message: "Post not found." };
  const current = all[index];
  const match = codesMatch(current.manageCode, code);
  if (!match.ok) {
    return { ok: false, message: match.message };
  }
  const next = { ...current, ...fields };
  all[index] = next;
  write(all);
  return { ok: true, message: "Post updated.", issue: next };
}

export async function manageIssue(
  id: string,
  code: string,
  action: "resolve" | "delete",
  resolvedNote?: string,
): Promise<{ ok: boolean; message: string }> {
  if (await isLive()) {
    const res = await fetch(`/api/issues/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, action, resolvedNote }),
    });
    const data = (await res.json()) as { message?: string; error?: string };
    return { ok: res.ok, message: data.message || data.error || "Could not update." };
  }
  const all = read();
  const index = all.findIndex((i) => i.id === id);
  if (index === -1) return { ok: false, message: "Post not found." };
  const issue = all[index];
  const match = codesMatch(issue.manageCode, code);
  if (!match.ok) {
    return { ok: false, message: match.message };
  }
  if (action === "delete") {
    all.splice(index, 1);
    write(all);
    return { ok: true, message: "Post deleted." };
  }
  all[index] = {
    ...issue,
    status: "resolved",
    resolvedAt: new Date().toISOString(),
    resolvedNote: resolvedNote?.trim() || undefined,
  };
  write(all);
  return { ok: true, message: "Marked as resolved." };
}

export async function codeLooksValid(id: string, code: string) {
  if (await isLive()) {
    const res = await fetch(`/api/issues/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, action: "check" }),
    });
    return res.ok;
  }
  const issue = read().find((i) => i.id === id);
  return !!issue && codesMatch(issue.manageCode, code).ok;
}
