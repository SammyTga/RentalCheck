import {
  dbConfigured,
  dbGet,
  dbUpdate,
  fromFields,
  toIssue,
  uploadPhotos,
} from "@/lib/db";
import { LIMITS, tooLong, validateIssueFields } from "@/lib/limits";
import type { Issue } from "@/lib/types";

function codesMatch(stored: string, given: string) {
  return stored.trim().toUpperCase() === given.trim().toUpperCase();
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
  if (!row || row.hidden) {
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

  if (!codesMatch(row.manage_code, String(body.code || ""))) {
    return Response.json({ error: "That code does not match this post." }, { status: 403 });
  }

  if (body.action === "check") {
    return Response.json({ ok: true });
  }

  if (body.action === "delete") {
    await dbUpdate(id, { hidden: true });
    return Response.json({ ok: true, message: "Post deleted." });
  }

  if (body.action === "resolve") {
    if (tooLong(body.resolvedNote, LIMITS.resolvedNote)) {
      return Response.json({ error: "A field is too long." }, { status: 400 });
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
  });
  return Response.json({
    ok: true,
    message: "Post updated.",
    issue: updated ? toIssue(updated) : undefined,
  });
}
