import { dbAddContact, dbConfigured } from "@/lib/db";
import { LIMITS, tooLong, validateEmail } from "@/lib/limits";

export async function POST(req: Request) {
  const body = (await req.json()) as {
    topic?: string;
    message?: string;
    email?: string;
  };
  if (!body.topic || !body.message) {
    return Response.json({ error: "Please include a topic and message." }, { status: 400 });
  }
  if (tooLong(body.message, LIMITS.message) || tooLong(body.email, LIMITS.email)) {
    return Response.json({ error: "A field is too long." }, { status: 400 });
  }
  const emailError = validateEmail(String(body.email || ""));
  if (emailError) {
    return Response.json({ error: emailError }, { status: 400 });
  }
  if (!dbConfigured()) {
    return Response.json({ ok: true, demo: true });
  }
  await dbAddContact({
    topic: body.topic,
    message: body.message,
    email: body.email,
  });
  return Response.json({ ok: true });
}
