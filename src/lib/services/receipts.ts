import "server-only";
import { supabaseRequest } from "@/lib/data/supabase/http";

export const MAX_RECEIPT_SIZE = 3 * 1024 * 1024;
export async function saveReceipt(reservationId: string, file: File) {
  if (file.size === 0 || file.size > MAX_RECEIPT_SIZE)
    throw new Error("El comprobante debe pesar hasta 3 MB");
  const bytes = new Uint8Array(await file.arrayBuffer());
  const pdf = Buffer.from(bytes.slice(0, 5)).toString() === "%PDF-";
  const png =
    bytes[0] === 137 && bytes[1] === 80 && bytes[2] === 78 && bytes[3] === 71;
  const jpg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
  const webp =
    Buffer.from(bytes.slice(0, 4)).toString() === "RIFF" &&
    Buffer.from(bytes.slice(8, 12)).toString() === "WEBP";
  const mime = pdf
    ? "application/pdf"
    : png
      ? "image/png"
      : jpg
        ? "image/jpeg"
        : webp
          ? "image/webp"
          : null;
  if (!mime)
    throw new Error("Elegí un comprobante JPG, PNG, WEBP o PDF válido");
  const ext = pdf ? "pdf" : png ? "png" : jpg ? "jpg" : "webp";
  const path = `${reservationId}/${crypto.randomUUID()}.${ext}`;
  await supabaseRequest(`/storage/v1/object/cm-receipts/${path}`, {
    method: "POST",
    headers: { "Content-Type": mime },
    body: bytes,
  });
  return { path, name: file.name.slice(0, 160) };
}
export async function removeReceipts(paths: string[]) {
  if (!paths.length) return;
  await supabaseRequest("/storage/v1/object/cm-receipts", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prefixes: paths }),
  });
}
