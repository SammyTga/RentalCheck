"use client";

import { FormEvent, useEffect, useState } from "react";
import type { Issue } from "@/lib/types";
import { formatAddress } from "@/lib/types";

type Message = {
  id: string;
  topic: string;
  message: string;
  email: string | null;
  created_at: string;
  read?: boolean;
};

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [error, setError] = useState("");
  const [issues, setIssues] = useState<Issue[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [pending, setPending] = useState<{
    id: string;
    type: "issue" | "message";
  } | null>(null);

  async function load() {
    const res = await fetch("/api/admin/issues");
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
      setError("Wrong password.");
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

  if (!authed) {
    return (
      <div className="mx-auto max-w-sm">
        <h2 className="text-2xl font-semibold">Admin</h2>
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
          <button className="rounded-full bg-teal-800 px-4 py-2 text-sm text-white hover:bg-teal-950 active:bg-teal-950">
            Sign in
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Admin</h2>
        <button
          className="text-sm underline active:text-teal-800"
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
        <div className="mt-3 space-y-3">
          {issues.map((issue) => (
            <div
              key={issue.id}
              className={`min-w-0 overflow-hidden rounded-xl border border-stone-200 p-4 text-base ${
                issue.hidden
                  ? "bg-stone-200 text-stone-600"
                  : "bg-white text-stone-900"
              }`}
            >
              <p className="break-long font-medium">{issue.title}</p>
              <p className="break-long">{formatAddress(issue)}</p>
              <p className="mt-1 text-sm">
                {issue.status}
                {issue.hidden ? " · hidden" : ""}
              </p>
              <div className="mt-2 flex gap-2">
                {issue.hidden ? (
                  <button className="underline active:text-teal-800" onClick={() => act(issue.id, "unhide")}>
                    Unhide
                  </button>
                ) : (
                  <button className="underline active:text-teal-800" onClick={() => act(issue.id, "hide")}>
                    Hide
                  </button>
                )}
                <button className="underline active:text-teal-800" onClick={() => setPending({ id: issue.id, type: "issue" })}>
                  Delete
                </button>
              </div>
            </div>
          ))}
          {issues.length === 0 && <p className="text-stone-500">No posts yet.</p>}
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
                  <button className="underline active:text-teal-800" onClick={() => act(msg.id, "unread", "message")}>
                    Mark unread
                  </button>
                ) : (
                  <button className="underline active:text-teal-800" onClick={() => act(msg.id, "read", "message")}>
                    Mark as read
                  </button>
                )}
                <button className="underline active:text-teal-800" onClick={() => setPending({ id: msg.id, type: "message" })}>
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
                className="rounded-full border border-stone-300 px-4 py-2 text-sm active:bg-stone-200"
                onClick={() => setPending(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-full bg-teal-800 px-4 py-2 text-sm text-white hover:bg-teal-950 active:bg-teal-950"
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
