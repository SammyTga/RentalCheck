import { isAdmin } from "@/lib/admin";
import {
  dbConfigured,
  dbDeleteContact,
  dbDeleteIssue,
  dbListAll,
  dbListContact,
  dbMarkContactRead,
  dbUpdate,
} from "@/lib/db";

export async function GET() {
  if (!(await isAdmin())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!dbConfigured()) {
    return Response.json({ error: "Database not configured" }, { status: 503 });
  }
  const [issues, messages] = await Promise.all([dbListAll(), dbListContact()]);
  return Response.json({
    issues: issues.map((issue) => ({ ...issue, manageCode: undefined })),
    messages,
  });
}

export async function PATCH(req: Request) {
  if (!(await isAdmin())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await req.json()) as {
    id?: string;
    type?: "issue" | "message";
    action?: "hide" | "unhide" | "delete" | "read" | "unread";
  };
  if (!body.id || !body.action) {
    return Response.json({ error: "Missing action." }, { status: 400 });
  }
  if (body.type === "message") {
    if (body.action === "delete") await dbDeleteContact(body.id);
    if (body.action === "read") await dbMarkContactRead(body.id, true);
    if (body.action === "unread") await dbMarkContactRead(body.id, false);
    return Response.json({ ok: true });
  }
  if (body.action === "hide") await dbUpdate(body.id, { hidden: true });
  if (body.action === "unhide") await dbUpdate(body.id, { hidden: false });
  if (body.action === "delete") await dbDeleteIssue(body.id);
  return Response.json({ ok: true });
}
