import { cookies } from "next/headers";
import { createHmac, randomBytes, timingSafeEqual } from "crypto";

const COOKIE = "rc_admin";

export function adminPassword() {
  return process.env.ADMIN_PASSWORD || "";
}

function sign(value: string) {
  return createHmac("sha256", adminPassword()).update(value).digest("hex");
}

function isValidToken(token: string) {
  const [value, signature] = token.split(".");
  if (!value || !signature) return false;
  const expected = sign(value);
  try {
    return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}

export async function isAdmin() {
  if (!adminPassword()) return false;
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return false;
  return isValidToken(token);
}

export async function setAdminCookie() {
  const jar = await cookies();
  const value = randomBytes(32).toString("hex");
  const token = `${value}.${sign(value)}`;
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
    secure: process.env.NODE_ENV === "production",
  });
}

export async function clearAdminCookie() {
  const jar = await cookies();
  jar.delete(COOKIE);
}
