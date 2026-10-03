"use client";

import { FormEvent, useState } from "react";
import { validateContactMessage, validateEmail } from "@/lib/limits";

const TOPICS = [
  "Report a post",
  "Lost my code",
  "Something else",
] as const;

export function ContactForm() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [topic, setTopic] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") || "");
    const message = String(form.get("message") || "");
    const messageError = validateContactMessage(message);
    if (messageError) {
      setError(messageError);
      return;
    }
    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topic: String(form.get("topic") || ""),
        message,
        email,
      }),
    });
    if (!res.ok) {
      setError("Could not send. Try again.");
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <p className="rounded-xl border border-stone-200 bg-white p-4 text-stone-700">
        Thanks. Your message has been sent.
      </p>
    );
  }

  const field =
    "mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 outline-none focus:border-stone-500";

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && <p className="text-sm text-red-700">{error}</p>}
      <label className="block">
        <span className="text-sm font-medium text-stone-800">Topic</span>
        <select
          name="topic"
          required
          value={topic}
          className={field}
          onChange={(e) =>
            setTopic(e.target.value === "__clear" ? "" : e.target.value)
          }
        >
          <option value="" disabled hidden>
            Select
          </option>
          {topic ? <option value="__clear">Clear entry</option> : null}
          {TOPICS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="text-sm font-medium text-stone-800">Message *</span>
        <textarea
          name="message"
          required
          rows={6}
          maxLength={2000}
          placeholder="Include the property address or issue link, otherwise type away."
          className={`${field} max-h-48 resize-y overflow-y-auto`}
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-stone-800">
          Email (optional — so we can reply)
        </span>
        <input type="email" name="email" maxLength={120} className={field} />
      </label>
      <button
        type="submit"
        className="rounded-full bg-teal-800 px-3 py-1 font-sans text-sm font-medium text-white hover:bg-teal-950 active:bg-teal-950"
      >
        Send message
      </button>
    </form>
  );
}
