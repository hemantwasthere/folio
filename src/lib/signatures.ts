import type { SupabaseClient } from "@supabase/supabase-js";

import type { Signature, SignaturePayload } from "@/types";

export const SIGNATURE_TABLE = "signatures";
export const SIGNATURE_FETCH_LIMIT = 120;
export const SIGNATURE_NAME_MAX = 36;
export const SIGNATURE_MESSAGE_MAX = 40;

const SIGNATURE_DATA_PREFIX = "data:image/png;base64,";
// An empty 520x280 canvas still serialises to a few hundred bytes, so this only
// rejects a payload that never touched the pad at all. The real "did you
// actually draw something" check is the stroke count in the modal.
const SIGNATURE_MIN_DATA_LENGTH = 120;

const SIGN_INTENT_KEY = "signature-wall-intent";

export const SIGNATURE_ERRORS = {
  NOT_CONFIGURED:
    "Signatures are not connected. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY, then restart the dev server.",
  AUTH_REQUIRED: "Please sign in with Google before placing a signature.",
  AUTH_FINISH_LOGIN: "Finish the Google login, then hit Add your signature.",
  GOOGLE_PROVIDER_DISABLED:
    "Google auth is disabled in Supabase. Enable the Google provider under Authentication → Providers, then try again.",
  ALREADY_SIGNED: "You already placed a signature with this account.",
  NAME_REQUIRED: "Name is required.",
  SIGNATURE_REQUIRED: "Signature is required.",
  SIGNATURE_TOO_SHORT: "Signature is too short. Please sign inside the pad.",
  INVALID_SIGNATURE_REJECTED:
    "Invalid signature payload rejected by the database (blank name or signature).",
  INSERT_POLICY_BLOCKED:
    "Save blocked by a database policy. Ensure the INSERT policy allows authenticated users and checks auth.uid() = user_id.",
  SAVE_FAILED: "Could not save your signature right now.",
} as const;

/* -------------------------------------------------------------------------- */
/* queries                                                                     */
/* -------------------------------------------------------------------------- */

export async function loadSignatures(
  client: SupabaseClient
): Promise<Signature[]> {
  const { data, error } = await client
    .from(SIGNATURE_TABLE)
    .select("id, name, message, signature_data, created_at")
    .order("created_at", { ascending: false })
    .limit(SIGNATURE_FETCH_LIMIT);

  if (error) throw new Error(error.message);

  return (data as Signature[]) ?? [];
}

export async function hasSigned(client: SupabaseClient, userId: string) {
  const { data, error } = await client
    .from(SIGNATURE_TABLE)
    .select("id")
    .eq("user_id", userId)
    .limit(1);

  if (error) throw new Error(error.message);

  return (data?.length ?? 0) > 0;
}

export async function insertSignature(
  client: SupabaseClient,
  userId: string,
  payload: SignaturePayload
) {
  const { error } = await client
    .from(SIGNATURE_TABLE)
    .insert({ ...sanitizeSignature(payload), user_id: userId });

  if (!error) return;

  // Postgres error codes, so the person signing gets a sentence rather than
  // "duplicate key value violates unique constraint".
  const byCode: Record<string, string> = {
    "23505": SIGNATURE_ERRORS.ALREADY_SIGNED,
    "23514": SIGNATURE_ERRORS.INVALID_SIGNATURE_REJECTED,
    "42501": SIGNATURE_ERRORS.INSERT_POLICY_BLOCKED,
  };

  throw new Error(byCode[error.code] ?? error.message);
}

export function sanitizeSignature(payload: SignaturePayload) {
  const name = payload.name.trim();
  const message = payload.message?.trim() || null;
  const signature_data = payload.signature_data.trim();

  if (!name) {
    throw new Error(SIGNATURE_ERRORS.NAME_REQUIRED);
  }
  if (!signature_data || !signature_data.startsWith(SIGNATURE_DATA_PREFIX)) {
    throw new Error(SIGNATURE_ERRORS.SIGNATURE_REQUIRED);
  }
  if (signature_data.length < SIGNATURE_MIN_DATA_LENGTH) {
    throw new Error(SIGNATURE_ERRORS.SIGNATURE_TOO_SHORT);
  }

  return { name, message, signature_data };
}

/* -------------------------------------------------------------------------- */
/* visuals                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * The wall is meant to look like a page people scribbled on, not a spreadsheet.
 * Every offset is derived from the row id so a signature keeps the same tilt,
 * position and ink weight on every render — a `Math.random()` here would make
 * the wall reshuffle itself on each hydration.
 */
function stableHash(seed: number, source: string) {
  let hash = seed;
  for (let i = 0; i < source.length; i += 1) {
    hash = (hash * 33 + source.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export function getSignatureRotation(id: string) {
  return ((stableHash(17, id) % 15) - 7) * 0.9;
}

export function getSignatureOrder(id: string) {
  return stableHash(23, id) % 10000;
}

export function getSignatureInkOpacity(id: string) {
  const normalized = (stableHash(29, id) % 100) / 100;
  return Number((0.72 + normalized * 0.2).toFixed(2));
}

/* -------------------------------------------------------------------------- */
/* auth round trip                                                             */
/* -------------------------------------------------------------------------- */

/**
 * Signing in with Google navigates away from the site, so the intent to sign
 * has to survive a full page load. It is stored twice — in `localStorage` and
 * as a `?sign=1` query flag on the redirect URL — because either one alone
 * breaks: storage is unavailable in some privacy modes, and the query flag is
 * lost if the provider drops it.
 */
export function setSignIntent(active: boolean) {
  if (typeof window === "undefined") return;

  if (active) {
    window.localStorage.setItem(SIGN_INTENT_KEY, "1");
  } else {
    window.localStorage.removeItem(SIGN_INTENT_KEY);
  }
}

export function hasSignIntent() {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(SIGN_INTENT_KEY) === "1";
}

export function buildAuthRedirectUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  let origin = window.location.origin;
  if (configured) {
    try {
      origin = new URL(configured).origin;
    } catch {
      // Fall through to the current origin — a typo'd env var should not be
      // able to send people to a dead redirect.
    }
  }

  const redirect = new URL(origin);
  redirect.searchParams.set("sign", "1");
  return redirect.toString();
}

/** Reads the `?sign=1` flag and strips it, so a refresh does not re-trigger. */
export function consumeSignFlag() {
  if (typeof window === "undefined") return false;

  const url = new URL(window.location.href);
  if (url.searchParams.get("sign") !== "1") return false;

  url.searchParams.delete("sign");
  history.replaceState({}, "", url.toString());
  return true;
}

export function readAuthCallbackError() {
  if (typeof window === "undefined") return "";

  const url = new URL(window.location.href);
  const message =
    url.searchParams.get("error_description") || url.searchParams.get("error");

  return message ? decodeURIComponent(message.replace(/\+/g, " ")) : "";
}
