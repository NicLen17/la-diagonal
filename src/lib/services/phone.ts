import { parsePhoneNumberFromString } from "libphonenumber-js";
export function normalizePhone(raw: string) {
  const phone = parsePhoneNumberFromString(raw, "AR");
  if (!phone?.isValid())
    throw new Error("Ingresá un teléfono válido con código de área");
  let digits = phone.number.replace(/\D/g, "");
  if (digits.startsWith("54") && !digits.startsWith("549"))
    digits = `549${digits.slice(2)}`;
  return digits;
}
