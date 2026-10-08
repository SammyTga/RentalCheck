"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import type { Issue } from "@/lib/types";
import { formatAddress, propertySlug } from "@/lib/types";

type Message = {
  id: string;
  topic: string;
  message: string;
  email: string | null;
  created_at: string;
  read?: boolean;
};

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

function formatPosted(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return `${ordinal(date.getDate())} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

function groupIssues(issues: Issue[]) {
  const groups = new Map<string, Issue[]>();
  for (const issue of issues) {
    const key = propertySlug(issue);
    const list = groups.get(key) ?? [];
    list.push(issue);
    groups.set(key, list);
  }
  return [...groups.entries()]
    .map(([slug, list]) => {
      const sorted = [...list].sort(
        (a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime(),
      );
      return { slug, issues: sorted, address: formatAddress(sorted[0]) };
    })
    .sort(
      (a, b) =>
        new Date(b.issues[0].postedAt).getTime() - new Date(a.issues[0].postedAt).getTime(),
    );
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [error, setError] = useState("");
  const [issues, setIssues] = useState<Issue[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [pending, setPending] = useState<{
    id: string;
    type: "issue" | "message";
  } | null>(null);
  const [postQuery, setPostQuery] = useState("");

  async function load() {
    const res = await fetch("/api/admin/issues", { cache: "no-store" });
    if (res.status === 401) {
      setAuthed(false);
      return;
    }
    if (!res.ok) {
      setError("Could not load admin data. Is the database connected?");
      return;
    }
    const data = (await res.json()) as { issues: Issue[]; messages: Message[] };
    setIssues(data.issues || []);
    setMessages(data.messages || []);
    setAuthed(true);
  }

  useEffect(() => {
    void load();
    function refresh() {
      void load();
    }
    function onVisible() {
      if (document.visibilityState === "visible") refresh();
    }
    window.addEventListener("pageshow", refresh);
    window.addEventListener("popstate", refresh);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("pageshow", refresh);
      window.removeEventListener("popstate", refresh);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  async function onLogin(e: FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      setError(data?.error || "Wrong password.");
      return;
    }
    setPassword("");
    await load();
  }

  async function act(
    id: string,
    action: "hide" | "unhide" | "delete" | "read" | "unread",
    type: "issue" | "message" = "issue",
  ) {
    await fetch("/api/admin/issues", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action, type }),
    });
    await load();
  }

  if (authed === null) {
    return (
      <div className="mx-auto max-w-sm">
        <h2 className="font-display text-2xl font-semibold tracking-tight">Admin</h2>
        <p className="mt-2 text-sm text-stone-600">Checking sign-in…</p>
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="mx-auto max-w-sm">
        <h2 className="font-display text-2xl font-semibold tracking-tight">Admin</h2>
        <p className="mt-2 text-sm text-stone-600">
          This page is only for the site owner.
        </p>
        <form onSubmit={onLogin} className="mt-4 space-y-3">
          <input
            type="password"
            autoComplete="off"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Admin password"
            className="w-full rounded-lg border border-stone-300 px-3 py-2"
          />
          {error && <p className="text-sm text-red-700">{error}</p>}
          <button className="rounded-full bg-teal-800 px-3 py-1 font-sans text-sm text-white hover:bg-teal-950 active:bg-teal-950">
            Sign in
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-semibold tracking-tight">Admin</h2>
        <button
          className="cursor-pointer text-sm underline hover:text-teal-800 active:text-teal-800"
          onClick={async () => {
            await fetch("/api/admin/logout", { method: "POST" });
            setPassword("");
            setAuthed(false);
          }}
        >
          Sign out
        </button>
      </div>

      <section>
        <h3 className="font-medium">Posts</h3>
        <input
          value={postQuery}
          onChange={(e) => setPostQuery(e.target.value)}
          placeholder="Search address or title"
          className="mt-3 w-full rounded-lg border border-stone-300 px-3 py-2 text-base"
        />
        <div className="mt-3 space-y-4">
          {groupIssues(issues)
            .filter((group) => {
              const q = postQuery.trim().toLowerCase();
              if (!q) return true;
              const blob = [
                group.address,
                ...group.issues.flatMap((issue) => [
                  issue.title,
                  issue.streetName,
                  issue.streetNumber,
                  issue.city,
                  issue.area,
                  issue.unit,
                  issue.postcode,
                ]),
              ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();
              return blob.includes(q);
            })
            .map((group) => (
            <div key={group.slug} className="min-w-0 overflow-hidden rounded-2xl border border-stone-300 bg-stone-100/70 p-3">
              <div className="flex items-baseline justify-between gap-3 px-1">
                <p className="min-w-0 break-all font-medium text-stone-900">{group.address}</p>
                <p className="shrink-0 whitespace-nowrap text-sm text-stone-600">
                  {group.issues.length} post{group.issues.length === 1 ? "" : "s"}
                </p>
              </div>
              <div className="mt-2 space-y-2">
                {group.issues.map((issue) => (
                  <div
                    key={issue.id}
                    className={`min-w-0 overflow-hidden rounded-xl border border-stone-200 p-4 text-base ${
                      issue.hidden
                        ? "bg-stone-200 text-stone-600"
                        : "bg-white text-stone-900"
                    }`}
                  >
                    <p className="break-long font-medium">{issue.description}</p>
                    <p className="mt-1 text-sm">
                      Posted {formatPosted(issue.postedAt)} · {issue.status}
                      {issue.hidden ? " · hidden" : ""}
                      {" · "}
                      {issue.posterEmail || "No email"}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-3">
                      <Link
                        href={`/issues/${issue.id}`}
                        className="underline hover:text-teal-800 active:text-teal-800"
                      >
                        View post
                      </Link>
                      {issue.hidden ? (
                        <button className="cursor-pointer underline hover:text-teal-800 active:text-teal-800" onClick={() => act(issue.id, "unhide")}>
                          Unhide
                        </button>
                      ) : (
                        <button className="cursor-pointer underline hover:text-teal-800 active:text-teal-800" onClick={() => act(issue.id, "hide")}>
                          Hide
                        </button>
                      )}
                      <button className="cursor-pointer underline hover:text-teal-800 active:text-teal-800" onClick={() => setPending({ id: issue.id, type: "issue" })}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {issues.length === 0 && <p className="text-stone-500">No posts yet.</p>}
          {issues.length > 0 && postQuery.trim() && groupIssues(issues).filter((group) => {
            const q = postQuery.trim().toLowerCase();
            return [group.address, ...group.issues.flatMap((issue) => [issue.title, issue.streetName, issue.streetNumber, issue.city, issue.area, issue.unit, issue.postcode])].filter(Boolean).join(" ").toLowerCase().includes(q);
          }).length === 0 && <p className="text-stone-500">No matching posts.</p>}
        </div>
      </section>

      <section>
        <h3 className="font-medium">Contact messages</h3>
        <div className="mt-3 space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`min-w-0 overflow-hidden rounded-xl border border-stone-200 p-4 text-base ${
                msg.read ? "bg-stone-200 text-stone-600" : "bg-white text-stone-900"
              }`}
            >
              <p className="font-medium">{msg.topic}</p>
              <p className="mt-1 break-long whitespace-pre-wrap">{msg.message}</p>
              <p className="mt-2 text-sm text-stone-800">
                {msg.read ? "Read" : "Unread"} · {msg.email || "No email"} ·{" "}
                {new Date(msg.created_at).toLocaleString("en-NZ")}
              </p>
              <div className="mt-2 flex gap-2">
                {msg.read ? (
                  <button className="cursor-pointer underline hover:text-teal-800 active:text-teal-800" onClick={() => act(msg.id, "unread", "message")}>
                    Mark unread
                  </button>
                ) : (
                  <button className="cursor-pointer underline hover:text-teal-800 active:text-teal-800" onClick={() => act(msg.id, "read", "message")}>
                    Mark as read
                  </button>
                )}
                <button className="cursor-pointer underline hover:text-teal-800 active:text-teal-800" onClick={() => setPending({ id: msg.id, type: "message" })}>
                  Delete
                </button>
              </div>
            </div>
          ))}
          {messages.length === 0 && <p className="text-stone-500">No messages yet.</p>}
        </div>
      </section>

      {pending && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/40">
        <div className="flex min-h-[100dvh] items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-lg">
            <p className="text-base font-medium text-stone-900">
              {pending.type === "issue"
                ? "Are you sure you want to delete this post?"
                : "Are you sure you want to delete this message?"}
            </p>
            <p className="mt-2 text-sm text-stone-600">This cannot be undone.</p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                className="rounded-full border border-stone-300 px-3 py-1 text-sm active:bg-stone-200"
                onClick={() => setPending(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-full bg-teal-800 px-3 py-1 font-sans text-sm text-white hover:bg-teal-950 active:bg-teal-950"
                onClick={async () => {
                  await act(pending.id, "delete", pending.type);
                  setPending(null);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
        </div>
      )}
    </div>
  );
}
