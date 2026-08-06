-- Schema for the sign:wall section.
-- Paste this into the Supabase SQL editor (Dashboard → SQL Editor → New query)
-- and run it once. Then enable the Google provider under
-- Authentication → Providers, and add your site URL plus
-- http://localhost:3000 to Authentication → URL Configuration → Redirect URLs.

create table if not exists public.signatures (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users (id) on delete cascade,
  name           text not null,
  message        text,
  signature_data text not null,
  created_at     timestamptz not null default now(),

  -- One signature per Google account. The client checks this too, but the
  -- constraint is what actually enforces it.
  constraint signatures_user_id_key unique (user_id),

  -- Mirrors sanitizeSignature() in src/lib/signatures.ts, so a hand-rolled
  -- request cannot store a blank name or a non-PNG payload.
  constraint signatures_name_not_blank check (length(btrim(name)) > 0),
  constraint signatures_name_max check (length(name) <= 36),
  constraint signatures_message_max check (message is null or length(message) <= 40),
  constraint signatures_data_is_png check (signature_data like 'data:image/png;base64,%'),
  constraint signatures_data_min_length check (length(signature_data) >= 120),
  -- A 520x280 PNG of a few strokes lands well under 100 KB. The cap stops
  -- anyone from using the wall as free blob storage.
  constraint signatures_data_max_length check (length(signature_data) <= 200000)
);

create index if not exists signatures_created_at_idx
  on public.signatures (created_at desc);

alter table public.signatures enable row level security;

-- The wall is public, so anyone (including logged-out visitors) can read it.
drop policy if exists "signatures are readable by everyone" on public.signatures;
create policy "signatures are readable by everyone"
  on public.signatures
  for select
  to anon, authenticated
  using (true);

-- Writes require a logged-in user, and the row must belong to them. Without the
-- with check clause, a signed-in visitor could write rows under someone else's
-- user_id and sidestep the one-per-account unique constraint.
drop policy if exists "authenticated users can add their own signature" on public.signatures;
create policy "authenticated users can add their own signature"
  on public.signatures
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- No update or delete policy on purpose: signatures are append-only from the
-- browser. Moderate from the dashboard with the service role.
