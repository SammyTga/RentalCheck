import { dbConfigured } from "@/lib/db";

export async function GET() {
  const raw = process.env.SUPABASE_URL || "";
  return Response.json({
    database: dbConfigured(),
    adminReady: Boolean(process.env.ADMIN_PASSWORD),
    urlLooksSet: raw.includes("supabase.co"),
    urlHasRestPath: /rest\/v1/i.test(raw),
    keyLooksSet: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
  });
}
