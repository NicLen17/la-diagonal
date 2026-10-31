import "server-only";

export function supabaseConfig() {
  const url = process.env.SUPABASE_URL,
    key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key)
    throw new Error(
      "Falta configurar la conexión de Cancha Manager a Supabase",
    );
  return { url, key };
}
export async function supabaseRequest(path: string, init: RequestInit = {}) {
  const { url, key } = supabaseConfig();
  const headers = new Headers(init.headers);
  headers.set("apikey", key);
  if (!key.startsWith("sb_secret_"))
    headers.set("Authorization", `Bearer ${key}`);
  const response = await fetch(`${url}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    if (error.code === "23P01")
      throw new Error("Ese turno acaba de ocuparse. Elegí otro horario.");
    if (error.code === "23503")
      throw new Error(
        "Hay datos relacionados. Desactivá la cancha para conservar las reservas.",
      );
    console.error(
      "Supabase request failed",
      response.status,
      error.code,
      error.message,
    );
    throw new Error(
      error.code === "P0001"
        ? error.message
        : "No se pudo guardar el cambio. Volvé a intentarlo.",
    );
  }
  return response;
}
export async function database<T>(
  table: string,
  query = "",
  method = "GET",
  body?: unknown,
): Promise<T[]> {
  const response = await supabaseRequest(
    `/rest/v1/${table}${query ? `?${query}` : ""}`,
    {
      method,
      headers: {
        "Content-Type": "application/json",
        Prefer:
          method === "POST"
            ? "return=representation,resolution=merge-duplicates"
            : "return=representation",
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    },
  );
  return response.status === 204 ? [] : response.json();
}
export async function rpc<T>(name: string, body: unknown = {}): Promise<T> {
  const response = await supabaseRequest(`/rest/v1/rpc/${name}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const bodyText = await response.text();
  return bodyText ? (JSON.parse(bodyText) as T) : (undefined as T);
}
export const eq = (value: string) => `eq.${encodeURIComponent(value)}`;
