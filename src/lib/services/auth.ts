import { cookies } from "next/headers";
import {
  ADMIN_COOKIE,
  isAdminSession,
  signToken,
  matchesSecret,
} from "./session";

export async function isAdmin() {
  return isAdminSession((await cookies()).get(ADMIN_COOKIE)?.value);
}
export async function requireAdmin() {
  if (!(await isAdmin()))
    throw new Error("Ingresá a administración para realizar esta acción");
}
export async function rememberBooking(id: string, code: string) {
  const cookieStore = await cookies();
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  };
  cookieStore.set(`cm_booking_${id}`, signToken(`booking:${id}`), options);
  cookieStore.set(`cm_code_${code}`, signToken(`code:${code}`), options);
}
export async function ownsBooking(id: string) {
  const token = (await cookies()).get(`cm_booking_${id}`)?.value;
  return !!token && matchesSecret(token, signToken(`booking:${id}`));
}
export async function ownsCode(code: string) {
  const token = (await cookies()).get(`cm_code_${code}`)?.value;
  return !!token && matchesSecret(token, signToken(`code:${code}`));
}
