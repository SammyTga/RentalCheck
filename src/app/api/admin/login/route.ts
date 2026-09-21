import { adminPassword, setAdminCookie } from "@/lib/admin";

export async function POST(req: Request) {
  const body = (await req.json()) as { password?: string };
  if (!adminPassword() || body.password !== adminPassword()) {
    return Response.json({ error: "Wrong password." }, { status: 401 });
  }
  await setAdminCookie();
  return Response.json({ ok: true });
}
