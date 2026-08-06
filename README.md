# folio

Aesthetic, minimalistic, and responsive portfolio website — [hemant.lol](https://hemant.lol)

## Stack

- [Next.js 16](https://nextjs.org/) (App Router, Turbopack) + [React 19](https://react.dev/)
- [TypeScript 6](https://www.typescriptlang.org/)
- [Tailwind CSS v4](https://tailwindcss.com/) (CSS-first config, no `tailwind.config.js`)
- [next-intl](https://next-intl.dev/) for i18n (`en`, `ja`)
- [next-themes](https://github.com/pacocoursey/next-themes) for light/dark
- [Motion](https://motion.dev/) for animation
- Fonts — Papyrus for display headings (`h1`/`h2`, system font, not bundled),
  self-hosted Space Grotesk for body and JetBrains Mono for accents
- [Hugeicons](https://hugeicons.com/) for icons
- [Supabase](https://supabase.com/) for the signature wall (Postgres + Google auth)
- [Bun](https://bun.sh/) as package manager

## Getting started

```bash
bun install
bun dev
```

Open [http://localhost:3000](http://localhost:3000).

Copy `.env.example` to `.env.local` and fill in the PostHog keys if you want
analytics locally. Everything there is optional — the app renders fine without
it, and the signature wall degrades to a "not connected" notice.

## Signature wall

The `sign:wall` section lets visitors draw a signature and leave it on the site.
It needs a Supabase project:

1. Run [`supabase/signatures.sql`](supabase/signatures.sql) in the Supabase SQL
   editor. It creates the `signatures` table and its row level security
   policies — public read, one insert per authenticated account.
2. Enable the **Google** provider under Authentication → Providers.
3. Add `http://localhost:3000` and the production URL under
   Authentication → URL Configuration → Redirect URLs.
4. Put the project URL and anon key in `.env.local`.

Signatures are stored as transparent PNG data URLs and painted on the wall as a
CSS mask, so the ink picks up the accent colour in both themes. Moderation is
manual: delete rows from the Supabase dashboard.

## Scripts

| Command          | Description                       |
| ---------------- | --------------------------------- |
| `bun dev`        | Start the dev server              |
| `bun run build`  | Production build                  |
| `bun start`      | Serve the production build        |
| `bun run lint`   | ESLint (flat config)              |
| `bun typecheck`  | `tsc --noEmit`                    |

## Structure

```
src/
  app/                    # App Router routes, root layout, global CSS
    (routes)/             # Page shell (cursor, nav, resume button)
  components/
    layout/               # Site chrome — nav, footer, resume button
    sections/             # One folder per page section
      hero/ about/ blog/ repos/ supporters/ signatures/ timeline/
    ui/                   # Reusable primitives — Button, Tooltip, Cursor, ...
  data/                   # Static content (supporters, timeline)
  i18n/                   # next-intl config and request handler
  lib/                    # Helpers (Lanyard/Discord presence, Supabase, cn)
  messages/               # Translation catalogues (en.json, ja.json)
  providers/              # Theme and PostHog providers
  services/               # Server actions (locale cookie)
public/                   # Static assets, fonts, resume.pdf
supabase/                 # SQL schema for the signature wall
```

## Theming

Colours live in **one place**: the `@layer base` block in `src/app/globals.css`.
`:root` holds the light palette and `.dark` holds the dark one. The `@theme inline`
block at the top of that file maps those CSS variables onto Tailwind utilities
(`text-text_primary`, `bg-elevation_one`, and so on), so changing a hex value
there updates the whole site.

## Deploy

Deployed on [Vercel](https://vercel.com/). Push to `main` and it ships.
