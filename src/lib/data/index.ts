import { mockDataAccess } from "./mock/store";
import type { DataAccess } from "./ports";
import { supabaseDataAccess } from "./supabase/adapter";

export function getDataAccess(): DataAccess {
  if (process.env.DATA_ADAPTER === "supabase") return supabaseDataAccess;
  if (process.env.NODE_ENV === "production")
    throw new Error(
      "Configurá DATA_ADAPTER=supabase para conservar las reservas",
    );
  return mockDataAccess;
}

export * from "./types";
export * from "./schemas";
