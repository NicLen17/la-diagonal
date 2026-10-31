"use server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "./auth";
import { buildDemoSeed } from "@/lib/data/mock/seed";
import { resetMockDemo } from "@/lib/data/mock/store";
import { getDataAccess } from "@/lib/data";
import { rpc } from "@/lib/data/supabase/http";
import { removeReceipts } from "./receipts";

export async function resetDemoAction(confirmation: string) {
  await requireAdmin();
  if (confirmation !== "REINICIAR DEMO")
    throw new Error("Escribí REINICIAR DEMO para confirmar");
  if (process.env.DATA_ADAPTER === "supabase") {
    const db = getDataAccess();
    const venue = await db.venues.getDefaultVenue();
    const reservations = await db.reservations.listByVenue(venue.id);
    await rpc("cm_reset_demo", { seed: buildDemoSeed() });
    await removeReceipts(
      reservations.flatMap((r) => (r.receiptPath ? [r.receiptPath] : [])),
    );
  } else resetMockDemo();
  revalidatePath("/", "layout");
}
