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
  if (!body.title || !body.description || !body.streetNumber || !body.streetName || !body.city) {
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
  const fieldError = validateIssueFields(body);
  if (fieldError) {
    return Response.json({ error: fieldError }, { status: 400 });
  }
  const photoUrls = await uploadPhotos(body.photoUrls || []);
  const issue = await dbInsert({ ...body, photoUrls });
  return Response.json({ issue });
}
