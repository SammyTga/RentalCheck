"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { codeLooksValid, manageIssue } from "@/lib/store";

export function ManagePost({
  issueId,
  resolved,
}: {
  issueId: string;
  resolved?: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState<"resolve" | "delete" | null>(null);
  const [code, setCode] = useState("");
  const [resolvedNote, setResolvedNote] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const action = submitter?.value || "resolve";

    if (action === "edit") {
      const ok = await codeLooksValid(issueId, code);
      if (!ok) {
        setMessage("That code does not match this post.");
        return;
      }
      router.push(`/issues/${issueId}/edit?code=${encodeURIComponent(code)}`);
      return;
    }

    setPending(action === "delete" ? "delete" : "resolve");
  }

  async function runPending() {
    if (!pending) return;
    const result = await manageIssue(issueId, code, pending, resolvedNote);
    setMessage(result.message);
    setPending(null);
    if (result.ok && pending === "delete") router.push("/");
    if (result.ok && pending === "resolve") window.location.reload();
  }

  if (resolved) return null;

  if (!open) {
    return (
      <p className="mt-10 text-sm text-stone-500">
        <button type="button" className="underline" onClick={() => setOpen(true)}>
          I posted this
        </button>
      </p>
    );
  }

  return (
    <div className="mt-10 rounded-xl border border-stone-200 bg-white p-4">
      <h3 className="font-medium text-stone-900">Manage this post</h3>
      <p className="mt-1 text-sm text-stone-600">
        Enter the private code shown when you published. You can use it to edit
        the post, mark it resolved, or delete it.
      </p>
      <form className="mt-4 space-y-3" onSubmit={onSubmit}>
        <input
          name="code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Your private code"
          className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
          required
        />
        <input
          name="resolvedNote"
          value={resolvedNote}
          onChange={(e) => setResolvedNote(e.target.value)}
          placeholder="Optional note if marking resolved"
          className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
        />
        {message && <p className="text-sm text-red-700">{message}</p>}
        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            name="action"
            value="edit"
            className="rounded-full bg-teal-800 px-4 py-2 text-sm text-white hover:bg-teal-950"
          >
            Edit post
          </button>
          <button
            type="submit"
            name="action"
            value="resolve"
            className="rounded-full bg-teal-800 px-4 py-2 text-sm text-white hover:bg-teal-950"
          >
            Mark resolved
          </button>
          <button
            type="submit"
            name="action"
            value="delete"
            className="rounded-full bg-teal-800 px-4 py-2 text-sm text-white hover:bg-teal-950"
          >
            Delete post
          </button>
        </div>
      </form>

      {pending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-lg">
            <p className="text-base font-medium text-stone-900">
              {pending === "delete"
                ? "Are you sure you want to delete this post?"
                : "Are you sure you want to mark this post as resolved?"}
            </p>
            <p className="mt-2 text-sm text-stone-600">
              {pending === "delete"
                ? "It will be removed from the public feed."
                : "The post stays public with a resolved label."}
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                className="rounded-full border border-stone-300 px-4 py-2 text-sm"
                onClick={() => setPending(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-full bg-teal-800 px-4 py-2 text-sm text-white hover:bg-teal-950"
                onClick={runPending}
              >
                {pending === "delete" ? "Delete post" : "Mark resolved"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
