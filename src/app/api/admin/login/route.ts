import { adminPassword, setAdminCookie } from "@/lib/admin";

const attempts = new Map<string, { fails: number; lockedUntil: number }>();
const MAX_FAILS = 5;
const LOCK_MS = 15 * 60 * 1000;

function clientKey(req: Request) {
  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || req.headers.get("x-real-ip") || "unknown";
}

export async function POST(req: Request) {
  const key = clientKey(req);
  const now = Date.now();
  const current = attempts.get(key);
  if (current && current.lockedUntil > now) {
    const minutes = Math.ceil((current.lockedUntil - now) / 60000);
    return Response.json(
      { error: `Too many attempts. Try again in ${minutes} minute${minutes === 1 ? "" : "s"}.` },
      { status: 429 },
    );
  }

  const body = (await req.json()) as { password?: string };
  if (!adminPassword() || body.password !== adminPassword()) {
    const fails = (current && current.lockedUntil <= now ? current.fails : current?.fails || 0) + 1;
    const lockedUntil = fails >= MAX_FAILS ? now + LOCK_MS : 0;
    attempts.set(key, { fails: lockedUntil ? 0 : fails, lockedUntil });
    if (lockedUntil) {
      return Response.json(
        { error: "Too many attempts. Try again in 15 minutes." },
        { status: 429 },
      );
    }
    return Response.json({ error: "Wrong password." }, { status: 401 });
  }

  attempts.delete(key);
  await setAdminCookie();
  return Response.json({ ok: true });
}

