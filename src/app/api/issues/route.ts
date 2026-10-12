import { dbConfigured, dbInsert, dbListPublic, uploadPhotos } from "@/lib/db";
import { LIMITS, tooLong, validateIssueFields } from "@/lib/limits";
import type { Issue } from "@/lib/types";

export async function GET() {
  if (!dbConfigured()) {
    return Response.json({ error: "Database not configured" }, { status: 503 });
  }
  try {
    const issues = await dbListPublic();
    return Response.json({ issues });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Database error" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  if (!dbConfigured()) {
    return Response.json({ error: "Database not configured" }, { status: 503 });
  }
  const body = (await req.json()) as Partial<Issue>;
  if (!body.description?.trim()) {
    return Response.json({ error: "Missing required fields." }, { status: 400 });
  }
  body.title = body.description.trim().split("\n")[0].slice(0, 70);
  body.handle = "Anonymous";
  if (!body.streetNumber || !body.streetName || !body.city) {
    return Response.json({ error: "Missing required fields." }, { status: 400 });
  }
  if (
    tooLong(body.title, LIMITS.title) ||
    tooLong(body.description, LIMITS.description) ||
    tooLong(body.roomDetail, LIMITS.roomDetail) ||
    tooLong(body.unit, LIMITS.unit) ||
    tooLong(body.streetNumber, LIMITS.streetNumber) ||
    tooLong(body.streetName, LIMITS.streetName) ||
    tooLong(body.area, LIMITS.area) ||
    tooLong(body.city, LIMITS.city) ||
    tooLong(body.postcode, LIMITS.postcode) ||
    tooLong(body.handle, LIMITS.handle)
  ) {
    return Response.json({ error: "A field is too long." }, { status: 400 });
  }
  const email = body.posterEmail?.trim() || "";
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: "Enter a valid email, or leave it blank." }, { status: 400 });
  }
  if (email.length > 120) {
    return Response.json({ error: "A field is too long." }, { status: 400 });
  }
  const fieldError = validateIssueFields(body);
  if (fieldError) {
    return Response.json({ error: fieldError }, { status: 400 });
  }
  let photoUrls: string[] = [];
  try {
    photoUrls = await uploadPhotos(body.photoUrls || []);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Could not upload photos.";
    return Response.json({ error: msg }, { status: 400 });
  }
  const issue = await dbInsert({ ...body, posterEmail: email || undefined, photoUrls });
  const { posterEmail: _private, ...publicIssue } = issue;
  return Response.json({ issue: publicIssue });
}
