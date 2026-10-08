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

  const match = codesMatch(row.manage_code, String(body.code || ""));
  if (!match.ok) {
    return Response.json({ error: match.message }, { status: 403 });
  }

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

  const photoUrls = await uploadPhotos(fields.photoUrls || []);
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
