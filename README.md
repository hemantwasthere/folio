# folio

Aesthetic, minimalistic, and responsive portfolio website — [hemant.lol](https://hemant.lol)

## Stack

- [Next.js 16](https://nextjs.org/) (App Router, Turbopack) + [React 19](https://react.dev/)
- [TypeScript 6](https://www.typescriptlang.org/)
- [Tailwind CSS v4](https://tailwindcss.com/) (CSS-first config, no `tailwind.config.js`)
- [next-intl](https://next-intl.dev/) for i18n (`en`, `ja`)
- [next-themes](https://github.com/pacocoursey/next-themes) for light/dark
- [Motion](https://motion.dev/) for animation
- [Bun](https://bun.sh/) as package manager

## Getting started

```bash
bun install
bun dev
```

Open [http://localhost:3000](http://localhost:3000).

Copy `.env.example` to `.env.local` and fill in the PostHog keys if you want
analytics locally. Both are optional — the app renders fine without them.

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
      hero/ about/ blog/ repos/ supporters/ timeline/
    ui/                   # Reusable primitives — Button, Tooltip, Cursor, ...
  data/                   # Static content (supporters, timeline)
  i18n/                   # next-intl config and request handler
  lib/                    # Helpers (Lanyard/Discord presence, cn)
  messages/               # Translation catalogues (en.json, ja.json)
  providers/              # Theme and PostHog providers
  services/               # Server actions (locale cookie)
public/                   # Static assets, fonts, resume.pdf
```

## Theming

Colours live in **one place**: the `@layer base` block in `src/app/globals.css`.
`:root` holds the light palette and `.dark` holds the dark one. The `@theme inline`
block at the top of that file maps those CSS variables onto Tailwind utilities
(`text-text_primary`, `bg-elevation_one`, and so on), so changing a hex value
there updates the whole site.

## Deploy

Deployed on [Vercel](https://vercel.com/). Push to `main` and it ships.
