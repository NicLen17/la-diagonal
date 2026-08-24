import { mockDataAccess } from "./mock/store";
import type { DataAccess } from "./ports";

export function getDataAccess(): DataAccess {
  // Future: if (process.env.DATA_ADAPTER === "supabase") return supabaseDataAccess
  return mockDataAccess;
}

export * from "./types";
export * from "./schemas";
