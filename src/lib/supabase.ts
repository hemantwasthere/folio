import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Read as whole member expressions so Next can inline them into the client
// bundle at build time.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

/**
 * `null` on a fresh clone, which is the point: the signature wall is the only
 * feature that needs a database, so an unconfigured environment degrades to a
 * "not connected" notice instead of throwing at import time and taking the
 * whole page down with it.
 *
 * The anon key is public by design — every write is gated by row level
 * security, see `supabase/signatures.sql`.
 */
export const supabase: SupabaseClient | null =
  url && anonKey ? createClient(url, anonKey) : null;
