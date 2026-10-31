import { getDataAccess } from "@/lib/data";
import { supabaseRequest } from "@/lib/data/supabase/http";
import { isAdmin } from "@/lib/services/auth";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdmin()))
    return new Response("Acceso restringido", { status: 401 });
  const { id } = await params;
  const reservation = await getDataAccess().reservations.getById(id);
  if (!reservation?.receiptPath)
    return new Response("Comprobante no disponible", { status: 404 });
  const path = reservation.receiptPath
    .split("/")
    .map(encodeURIComponent)
    .join("/");
  const response = await supabaseRequest(
    `/storage/v1/object/cm-receipts/${path}`,
  );
  return new Response(response.body, {
    headers: {
      "Content-Type":
        response.headers.get("content-type") ?? "application/octet-stream",
      "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(reservation.receiptFileName ?? "comprobante")}`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "sandbox",
    },
  });
}
