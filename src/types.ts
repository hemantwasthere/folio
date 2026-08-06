/**
 * Discord/Lanyard payload shapes are not redeclared here — `react-use-lanyard`
 * ships its own (`LanyardData`), and keeping a hand-rolled copy in sync with the
 * websocket contract is how they drift apart.
 */

export interface Repo {
  owner: string;
  repo: string;
  link: string;
  description: string;
  website: string;
  language: string;
  languageColor: string;
  stars: string;
  forks: string;
}

/** A row of the `signatures` table — see `supabase/signatures.sql`. */
export interface Signature {
  id: string;
  name: string;
  message: string | null;
  /** A `data:image/png;base64,…` URL exported from the signing pad. */
  signature_data: string;
  created_at: string;
}

export type SignaturePayload = Pick<
  Signature,
  "name" | "message" | "signature_data"
>;

export interface SignaturePoint {
  x: number;
  y: number;
}

export interface SignatureStroke {
  width: number;
  points: SignaturePoint[];
}
