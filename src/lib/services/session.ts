import { createHmac, timingSafeEqual } from "node:crypto";

export const ADMIN_COOKIE = "cm_admin";
export function adminPasscode() {
  const value = process.env.ADMIN_PASSCODE;
  if (!value || value.length < 12)
    throw new Error("Configurá ADMIN_PASSCODE con al menos 12 caracteres");
  return value;
}
export function signToken(payload: string) {
  return createHmac("sha256", adminPasscode()).update(payload).digest("hex");
}
export function matchesSecret(a: string, b: string) {
  const aa = Buffer.from(a),
    bb = Buffer.from(b);
  return aa.length === bb.length && timingSafeEqual(aa, bb);
}
export function createAdminSession() {
  const payload = `${Date.now() + 12 * 60 * 60 * 1000}`;
  return `${payload}.${signToken(payload)}`;
}
export function isAdminSession(token?: string) {
  if (!token) return false;
  const [expires, signature, extra] = token.split(".");
  if (
    extra ||
    !signature ||
    !/^\d+$/.test(expires) ||
    Number(expires) < Date.now()
  )
    return false;
  try {
    return matchesSecret(signature, signToken(expires));
  } catch {
    return false;
  }
}
