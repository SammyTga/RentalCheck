import { cookies } from "next/headers";

const COOKIE = "pc_admin";

export function adminPassword() {
  return process.env.ADMIN_PASSWORD || "";
}

export async function isAdmin() {
  const expected = adminPassword();
  if (!expected) return false;
  const jar = await cookies();
  return jar.get(COOKIE)?.value === expected;
}

export async function setAdminCookie() {
  const jar = await cookies();
  jar.set(COOKIE, adminPassword(), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
}

export async function clearAdminCookie() {
  const jar = await cookies();
  jar.delete(COOKIE);
}
