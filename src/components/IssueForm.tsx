"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import { validateIssueFields } from "@/lib/limits";
import { addIssue, updateIssue } from "@/lib/store";
import {
  CATEGORIES,
  RESPONSES,
  ROOM_AREAS,
  type Issue,
} from "@/lib/types";

export function IssueForm({
  existing,
  manageCode,
}: {
  existing?: Issue;
  manageCode?: string;
}) {
  const router = useRouter();
  const prefill = useSearchParams();
  const [error, setError] = useState("");
  const [dateError, setDateError] = useState("");
  const [errorTick, setErrorTick] = useState(0);
  const [confirmed, setConfirmed] = useState(false);
  const errorRef = useRef<HTMLParagraphElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [category, setCategory] = useState(existing?.category ?? "");
  const [roomArea, setRoomArea] = useState(existing?.roomArea ?? "");
  const [photos, setPhotos] = useState<string[]>(existing?.photoUrls ?? []);
  const todayNz = new Date().toLocaleDateString("en-CA", {
    timeZone: "Pacific/Auckland",
  });
  const [reportedDate, setReportedDate] = useState(
    existing?.reportedToLandlordOn ?? "",
  );
  const editing = Boolean(existing);
  const DRAFT_KEY = existing
    ? `rentalcheck-edit-issue-draft-${existing.id}`
    : "rentalcheck-new-issue-draft";
  const [draftReady, setDraftReady] = useState(false);
  const [draft, setDraft] = useState<Record<string, string> | null>(null);

  useEffect(() => {
    if (!error || !errorTick) return;
    requestAnimationFrame(() => {
      errorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }, [error, errorTick]);

  useEffect(() => {
    function clearConfirm() {
      setConfirmed(false);
    }
    window.addEventListener("pageshow", clearConfirm);
    window.addEventListener("popstate", clearConfirm);
    return () => {
      window.removeEventListener("pageshow", clearConfirm);
      window.removeEventListener("popstate", clearConfirm);
    };
  }, []);


  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(DRAFT_KEY);
      setDraft(raw ? (JSON.parse(raw) as Record<string, string>) : null);
    } catch {
      setDraft(null);
    }
    setDraftReady(true);
  }, [DRAFT_KEY]);

  useEffect(() => {
    if (!draftReady || !draft) return;
    if (draft.photos) {
      try {
        const parsed = JSON.parse(draft.photos) as string[];
        if (Array.isArray(parsed)) setPhotos(parsed);
      } catch {
        /* ignore */
      }
    }
    if (draft.category) setCategory(draft.category);
    if (draft.roomArea) setRoomArea(draft.roomArea);
    if (draft.reportedToLandlordOn && draft.reportedToLandlordOn <= todayNz) {
      setReportedDate(draft.reportedToLandlordOn);
    }
  }, [draftReady, draft, todayNz]);

  useEffect(() => {
    if (!draftReady) return;
    try {
      const raw = sessionStorage.getItem(DRAFT_KEY);
      const data = raw ? (JSON.parse(raw) as Record<string, string>) : {};
      data.photos = JSON.stringify(photos);
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(data));
    } catch {
      /* quota */
    }
  }, [photos, draftReady, DRAFT_KEY]);

  function persistDraft(form: HTMLFormElement) {
    const fd = new FormData(form);
    const data: Record<string, string> = {};
    for (const [key, value] of fd.entries()) {
      if (key === "confirmed" || key === "manageCode") continue;
      if (key === "reportedToLandlordOn" && String(value) > todayNz) continue;
      if (key === "reportedToLandlordOn" && String(value) > todayNz) continue;
      if (key === "responses") {
        data.responses = JSON.stringify(fd.getAll("responses").map(String));
        continue;
      }
      data[key] = String(value);
    }
    try {
      data.photos = JSON.stringify(photos);
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(data));
    } catch {
      /* quota */
    }
  }

  function shrinkPhoto(file: File) {
    return new Promise<string>((resolve, reject) => {
      const raw = new Image();
      const reader = new FileReader();
      reader.onload = () => {
        raw.onload = () => {
          const max = 1600;
          const scale = Math.min(1, max / Math.max(raw.width, raw.height));
          const canvas = document.createElement("canvas");
          canvas.width = Math.max(1, Math.round(raw.width * scale));
          canvas.height = Math.max(1, Math.round(raw.height * scale));
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("Could not process photo"));
            return;
          }
          ctx.drawImage(raw, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL("image/jpeg", 0.72));
        };
        raw.onerror = () => reject(new Error("Could not read photo"));
        raw.src = String(reader.result || "");
      };
      reader.onerror = () => reject(new Error("Could not read photo"));
      reader.readAsDataURL(file);
    });
  }

  function showError(message: string) {
    setConfirmed(false);
    setError(message);
    setErrorTick((n) => n + 1);
  }

  async function onPhotos(files: FileList | null) {
    if (!files) return;
    setError("");
    setConfirmed(false);
    const next = [...photos];
    for (const file of Array.from(files)) {
      if (next.length >= 4) break;
      if (!file.type.startsWith("image/")) {
        showError("Please choose image files only.");
        continue;
      }
      try {
        next.push(await shrinkPhoto(file));
      } catch {
        showError("Could not read one of the photos. Try another file.");
      }
    }
    setPhotos(next.slice(0, 4));
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError("");
    const form = new FormData(e.currentTarget);

    const title = String(form.get("title") || "").trim();
    const description = String(form.get("description") || "").trim();
    const category = String(form.get("category") || "") as (typeof CATEGORIES)[number];
    const roomAreaRaw = String(form.get("roomArea") || "");
    const roomDetail = String(form.get("roomDetail") || "").trim();
    const unit = String(form.get("unit") || "").trim();
    const streetNumber = String(form.get("streetNumber") || "").trim();
    const streetName = String(form.get("streetName") || "").trim();
    const city = String(form.get("city") || "").trim();
    const area = String(form.get("area") || "").trim();
    const postcode = String(form.get("postcode") || "").trim();
    const reportedToLandlordOn = String(form.get("reportedToLandlordOn") || "");
    const handle = String(form.get("handle") || "").trim();
    const code = String(form.get("manageCode") || manageCode || "");
    const responses = form
      .getAll("responses")
      .map(String)
      .filter((r): r is (typeof RESPONSES)[number] =>
        (RESPONSES as readonly string[]).includes(r),
      );
    const isConfirmed = confirmed;

    if (
      !title ||
      !description ||
      !category ||
      !roomAreaRaw ||
      roomAreaRaw === "__clear" ||
      !streetNumber ||
      !streetName ||
      !city ||
      !reportedToLandlordOn
    ) {
      showError("Please fill in all required fields.");
      setSubmitting(false);
      return;
    }
    if (!CATEGORIES.includes(category)) {
      showError("Choose a valid category.");
      setSubmitting(false);
      return;
    }
    if (!isConfirmed) {
      showError("Please confirm this is a tenancy issue you reported.");
      setSubmitting(false);
      return;
    }
    if (reportedToLandlordOn > todayNz) {
      setDateError("The reported date cannot be in the future.");
      setSubmitting(false);
      return;
    }
    const fieldError = validateIssueFields({
      title,
      description,
      roomDetail,
      unit,
      streetNumber,
      streetName,
      area,
      city,
      postcode,
      handle,
    });
    if (fieldError) {
      showError(fieldError);
      setSubmitting(false);
      return;
    }

    const fields = {
      title,
      description,
      category,
      roomArea: ROOM_AREAS.includes(roomAreaRaw as (typeof ROOM_AREAS)[number])
        ? (roomAreaRaw as (typeof ROOM_AREAS)[number])
        : undefined,
      roomDetail: roomDetail || undefined,
      unit: unit || undefined,
      streetNumber,
      streetName,
      city,
      area: area || undefined,
      postcode: postcode || undefined,
      reportedToLandlordOn,
      handle: handle || "Anonymous",
      responses,
      photoUrls: photos,
    };

    if (editing && existing) {
      const result = await updateIssue(existing.id, code, fields);
      if (!result.ok) {
        showError(result.message);
        setSubmitting(false);
        return;
      }
      try {
        sessionStorage.removeItem(DRAFT_KEY);
      } catch {
        /* ignore */
      }
      if (typeof window !== "undefined") {
        window.history.replaceState(null, "", "/");
      }
      router.push(`/issues/${existing.id}`);
      return;
    }

    try {
      const issue = await addIssue(fields);
      try {
        sessionStorage.removeItem(DRAFT_KEY);
      } catch {
        /* ignore */
      }
      router.push(`/posted/${issue.id}?code=${encodeURIComponent(issue.manageCode)}`);
    } catch (err) {
      showError(err instanceof Error ? err.message : "Could not publish.");
      setSubmitting(false);
    }
  }

  if (!draftReady) {
    return <p className="text-sm text-stone-500">Loading…</p>;
  }

  const field =
    "mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 outline-none focus:border-stone-500";

  return (
    <form
        onSubmit={onSubmit}
        onInput={(e) => {
          persistDraft(e.currentTarget);
          const t = e.target as HTMLElement | null;
          const name = t?.getAttribute("name");
          if (name !== "reportedToLandlordOn") {
            setDateError("");
          }
          if (name && name !== "confirmed") {
            setConfirmed(false);
          }
        }}
        className="space-y-5"
      >
      {error && (
        <p
          ref={errorRef}
          tabIndex={-1}
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
        >
          {error}
        </p>
      )}

      {editing && (
        <input type="hidden" name="manageCode" defaultValue={manageCode} />
      )}

      <label className="block">
        <span className="text-sm font-medium text-stone-800">Title *</span>
        <input
          name="title"
          required
          maxLength={100}
          className={field}
          defaultValue={draft?.title ?? existing?.title ?? ""}
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-stone-800">Category *</span>
          <select
            name="category"
            required
            value={category}
            className={field}
            onChange={(e) =>
              setCategory(e.target.value === "__clear" ? "" : e.target.value)
            }
          >
            <option value="" disabled hidden>
              Select
            </option>
            {category ? <option value="__clear">Clear entry</option> : null}
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-medium text-stone-800">
            Date first reported to landlord *
          </span>
          <input
            type="date"
            name="reportedToLandlordOn"
            required
            max={todayNz}
            value={reportedDate}
            className={field}
            onChange={(e) => {
              const next = e.target.value;
              if (next && next > todayNz) {
                setReportedDate("");
                setDateError("The reported date cannot be in the future.");
                return;
              }
              setReportedDate(next);
              setDateError("");
            }}
          />
          {dateError ? (
            <p className="mt-1 text-sm text-red-700">{dateError}</p>
          ) : null}
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-stone-800">Where in the home *</span>
          <select
            name="roomArea"
            required
            value={roomArea}
            className={field}
            onChange={(e) =>
              setRoomArea(e.target.value === "__clear" ? "" : e.target.value)
            }
          >
            <option value="" disabled hidden>
              Select
            </option>
            {roomArea ? <option value="__clear">Clear entry</option> : null}
            {ROOM_AREAS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-medium text-stone-800">More detail (optional)</span>
          <input
            name="roomDetail"
            maxLength={80}
            placeholder="e.g. downstairs shower, bedroom 2"
            className={field}
            defaultValue={draft?.roomDetail ?? existing?.roomDetail ?? ""}
          />
        </label>
      </div>

      <label className="block">
        <span className="text-sm font-medium text-stone-800">What is the problem *</span>
        <textarea
          name="description"
          required
          rows={7}
          maxLength={2000}
          placeholder="Facts only: what is wrong and what happened next."
          className={field}
          defaultValue={draft?.description ?? existing?.description ?? ""}
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block">
          <span className="text-sm font-medium text-stone-800">Unit / flat</span>
          <input
            name="unit"
            maxLength={20}
            placeholder="e.g. 2"
            className={field}
            defaultValue={draft?.unit ?? existing?.unit ?? prefill.get("unit") ?? ""}
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-stone-800">Street number *</span>
          <input
            name="streetNumber"
            required
            maxLength={20}
            placeholder="e.g. 44"
            className={field}
            defaultValue={draft?.streetNumber ?? existing?.streetNumber ?? prefill.get("streetNumber") ?? ""}
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-stone-800">Street name *</span>
          <input
            name="streetName"
            required
            maxLength={80}
            placeholder="e.g. Chadwick Road"
            className={field}
            defaultValue={draft?.streetName ?? existing?.streetName ?? prefill.get("streetName") ?? ""}
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block">
          <span className="text-sm font-medium text-stone-800">Suburb</span>
          <input
            name="area"
            maxLength={60}
            placeholder="e.g. Greerton"
            className={field}
            defaultValue={draft?.area ?? existing?.area ?? prefill.get("area") ?? ""}
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-stone-800">City *</span>
          <input
            name="city"
            required
            maxLength={60}
            placeholder="e.g. Tauranga"
            className={field}
            defaultValue={draft?.city ?? existing?.city ?? prefill.get("city") ?? ""}
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-stone-800">Postcode</span>
          <input
            name="postcode"
            maxLength={4}
            inputMode="numeric"
            placeholder="e.g. 3112"
            className={field}
            defaultValue={draft?.postcode ?? existing?.postcode ?? prefill.get("postcode") ?? ""}
          />
        </label>
      </div>

      <fieldset>
        <legend className="text-sm font-medium text-stone-800">
          How did the landlord or property manager respond? (optional — pick any
          that apply)
        </legend>
        <div className="mt-2 space-y-2">
          {RESPONSES.map((r) => (
            <label key={r} className="flex items-start gap-2 text-sm text-stone-700">
              <input
                type="checkbox"
                name="responses"
                value={r}
                className="mt-1"
                defaultChecked={
                  draft?.responses
                    ? (JSON.parse(draft.responses) as string[]).includes(r)
                    : Boolean(existing?.responses?.includes(r))
                }
              />
              <span>{r}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="block">
        <span className="text-sm font-medium text-stone-800">
          Display name (optional — leave blank for Anonymous)
        </span>
        <input
          name="handle"
          maxLength={40}
          placeholder="Anonymous"
          className={field}
          defaultValue={draft?.handle ?? (existing?.handle === "Anonymous" ? "" : existing?.handle ?? "")}
        />
      </label>

      <div>
        <p className="text-sm font-medium text-stone-800">
          Photos (optional, up to 4)
        </p>
        <p className="mt-1 text-xs text-stone-500">
          Pictures of the issue only. No children or personal documents. Photos
          are stored securely.
        </p>
        {photos.length < 4 && (
          <input
            type="file"
            accept="image/*"
            multiple
            className={`${field} file:mr-3 file:rounded-full file:border-0 file:bg-teal-800 file:px-3 file:py-1 file:text-xs file:text-white file:hover:bg-teal-950 file:active:bg-teal-950`}
            onChange={(e) => {
              void onPhotos(e.target.files);
              e.target.value = "";
            }}
          />
        )}
        {photos.length > 0 && (
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {photos.map((src, index) => (
              <div key={`${src.slice(0, 24)}-${index}`} className="relative">
                <img
                  src={src}
                  alt={`Issue photo ${index + 1}`}
                  className="h-24 w-full rounded-lg object-cover"
                />
                <button
                  type="button"
                  className="absolute right-1 top-1 rounded-full bg-white/90 px-2 text-xs"
                  onClick={() => { setConfirmed(false); setPhotos(photos.filter((_, i) => i !== index)); }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <label className="flex items-start gap-2 text-sm text-stone-700">
        <input
          type="checkbox"
          name="confirmed"
          className="mt-1"
          required
          checked={confirmed}
          onChange={(e) => setConfirmed(e.target.checked)}
        />
        <span>
          This is an issue at this exact rental address that has already
          been reported to the relevant individual or service. I will not post
          names or contact details of landlords/property managers. The
          address will be public on RentalCheck.co.nz.
        </span>
      </label>

      <button
        type="submit"
        disabled={submitting}
        className="rounded-full bg-teal-800 px-5 py-2.5 text-sm font-medium text-white hover:bg-teal-950 active:bg-teal-950 disabled:opacity-60"
      >
        {submitting
          ? editing
            ? "Saving…"
            : "Publishing…"
          : editing
            ? "Save changes"
            : "Publish issue"}
      </button>
    </form>
  );
}
