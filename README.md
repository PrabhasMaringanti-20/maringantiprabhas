# Maringanti Prabhas — Portfolio

The source of my personal site. A single-page portfolio built as a demonstration of the
work it describes: typed content, real deployments, verified links, and no invented claims.

**Live:** _(set once deployed)_

## Stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 15 (App Router) · React 19 |
| Language | TypeScript, strict |
| Styling | Tailwind CSS v4 with runtime CSS-variable tokens |
| Type | Clash Display + Satoshi, self-hosted as woff2 |
| Icons | simple-icons brand marks, inlined as paths |
| Hosting | Vercel |

## Running it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm run lint
```

> Don't run `npm run build` while `npm run dev` is running — they share `.next` and it
> corrupts into 500s. Stop the dev server first, or `rm -rf .next` to recover.

## Environment

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical origin. Feeds `sitemap.xml`, `robots.txt`, OpenGraph and the JSON-LD `Person` schema. Without it these fall back to `localhost:3000`. |

## How content is organised

All content is typed and lives in one place per concern, so nothing is scattered through
components:

- `src/data/projects.ts` — every project, including each GitHub and live URL. A project
  without a deployment is `status: 'source'` and never renders a demo button.
- `src/data/experience.ts` — roles, straight from the resume.
- `src/data/skills.ts` — grouped technologies. No proficiency scores, deliberately.
- `src/data/journey.ts` — timeline, education, award, certification.
- `src/lib/site.ts` — name, contact details, section order.

## Design system

Both themes are defined as CSS variables in `src/app/globals.css` and exposed to Tailwind
through `@theme inline`. Light is the default; dark applies on `prefers-color-scheme`
unless the visitor pinned light, and on an explicit `data-theme="dark"`. Every colour is
referenced through a token, so both themes always resolve as a complete set.

Note: the `next/font` variables must sit on `<html>`, not `<body>` — Tailwind resolves
`--font-sans` at `:root`, and a variable defined only on `<body>` silently falls back to
system fonts.

## Accessibility

Text and UI colours meet WCAG AA in both themes (measured, not assumed). The page ships a
skip link, a single `h1`, real `tablist` and `aria-expanded` semantics, `inert` on
collapsed panels, visible focus rings, and honours `prefers-reduced-motion` — which
disables the pointer effects, the reveals and the architecture pulse.

## Licence

Code is MIT. The written content, resume and screenshots are not.
