import { dbConfigured, dbInsert, dbListPublic, uploadPhotos } from "@/lib/db";
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
  const photoUrls = await uploadPhotos(body.photoUrls || []);
  const issue = await dbInsert({ ...body, photoUrls });
  return Response.json({ issue });
}
