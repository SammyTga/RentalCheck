import { isAdmin } from "@/lib/admin";
import {
  dbConfigured,
  dbDeleteIssue,
  dbGet,
  dbUpdate,
  fromFields,
  toIssue,
  uploadPhotos,
} from "@/lib/db";
import { LIMITS, tooLong, validateIssueFields, validateResolvedNote } from "@/lib/limits";
import type { Issue } from "@/lib/types";

const codeAttempts = new Map<string, { fails: number; lockedUntil: number }>();
const MAX_CODE_FAILS = 5;
const CODE_LOCK_MS = 15 * 60 * 1000;

function clientKey(req: Request) {
  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || req.headers.get("x-real-ip") || "unknown";
}

function codesMatch(stored: string, given: string) {
  const a = stored.trim();
  const b = given.trim();
  if (a === b) return { ok: true as const };
  if (a.toUpperCase() === b.toUpperCase()) {
    return { ok: false as const, message: "The code is case sensitive." };
  }
  return { ok: false as const, message: "That code does not match this post." };
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!dbConfigured()) {
    return Response.json({ error: "Database not configured" }, { status: 503 });
  }
  const { id } = await params;
  const row = await dbGet(id);
  if (!row || (row.hidden && !(await isAdmin()))) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
  return Response.json({ issue: toIssue(row) });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!dbConfigured()) {
    return Response.json({ error: "Database not configured" }, { status: 503 });
  }
  const { id } = await params;
  const row = await dbGet(id, true);
  if (!row) return Response.json({ error: "Post not found." }, { status: 404 });

  const body = (await req.json()) as {
    code?: string;
    action?: "resolve" | "delete" | "edit" | "check";
    resolvedNote?: string;
    fields?: Partial<Issue>;
  };

  const key = clientKey(req) + ":" + id;
  const now = Date.now();
  const current = codeAttempts.get(key);
  if (current && current.lockedUntil > now) {
    const minutes = Math.ceil((current.lockedUntil - now) / 60000);
    return Response.json(
      { error: `Too many attempts. Try again in ${minutes} minute${minutes === 1 ? "" : "s"}.` },
      { status: 429 },
    );
  }

  const match = codesMatch(row.manage_code, String(body.code || ""));
  if (!match.ok) {
    const fails = (current && current.lockedUntil <= now ? current.fails : current?.fails || 0) + 1;
    const lockedUntil = fails >= MAX_CODE_FAILS ? now + CODE_LOCK_MS : 0;
    codeAttempts.set(key, { fails: lockedUntil ? 0 : fails, lockedUntil });
    if (lockedUntil) {
      return Response.json(
        { error: "Too many attempts. Try again in 15 minutes." },
        { status: 429 },
      );
    }
    return Response.json({ error: match.message }, { status: 403 });
  }
  codeAttempts.delete(key);

  if (body.action === "check") {
    return Response.json({ ok: true, posterEmail: row.poster_email || "" });
  }

  if (body.action === "delete") {
    await dbDeleteIssue(id);
    return Response.json({ ok: true, message: "Post deleted." });
  }

  if (body.action === "resolve") {
    const noteError = validateResolvedNote(String(body.resolvedNote || ""));
    if (noteError) {
      return Response.json({ error: noteError }, { status: 400 });
    }
    await dbUpdate(id, {
      status: "resolved",
      resolved_at: new Date().toISOString(),
      resolved_note: body.resolvedNote?.trim() || null,
    });
    return Response.json({ ok: true, message: "Marked as resolved." });
  }

  const fields = body.fields || {};
  if (fields.description?.trim()) {
    fields.title = fields.description.trim().split("\n")[0].slice(0, 70);
  }
  fields.handle = "Anonymous";
  if (
    tooLong(fields.title, LIMITS.title) ||
    tooLong(fields.description, LIMITS.description) ||
    tooLong(fields.roomDetail, LIMITS.roomDetail) ||
    tooLong(fields.unit, LIMITS.unit) ||
    tooLong(fields.streetNumber, LIMITS.streetNumber) ||
    tooLong(fields.streetName, LIMITS.streetName) ||
    tooLong(fields.area, LIMITS.area) ||
    tooLong(fields.city, LIMITS.city) ||
    tooLong(fields.postcode, LIMITS.postcode) ||
    tooLong(fields.handle, LIMITS.handle)
  ) {
    return Response.json({ error: "A field is too long." }, { status: 400 });
  }
  const fieldError = validateIssueFields(fields);
  if (fieldError) {
    return Response.json({ error: fieldError }, { status: 400 });
  }

  let photoUrls: string[] = [];
  try {
    photoUrls = await uploadPhotos(fields.photoUrls || []);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Could not upload photos.";
    return Response.json({ error: msg }, { status: 400 });
  }
  const updated = await dbUpdate(id, {
    ...fromFields({ ...body.fields, photoUrls }),
    poster_email: fields.posterEmail?.trim() || null,
  });
  return Response.json({
    ok: true,
    message: "Post updated.",
    issue: updated ? toIssue(updated) : undefined,
  });
}
