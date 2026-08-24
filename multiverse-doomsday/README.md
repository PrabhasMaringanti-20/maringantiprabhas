# Multiverse Roadmap: Guide to Doomsday

An offline-first companion app for Marvel fans preparing for *Avengers: Doomsday*.
Pick a watch path, track what you have seen, learn who everyone is, rank the saga
and export a story card of your readiness score.

Built with Expo (managed workflow), TypeScript, Expo Router, NativeWind,
Zustand and Reanimated. No account, no backend, no paid services.

---

## Screens

| Tab | What it does |
| --- | --- |
| **Roadmap** | Animated readiness dashboard (circular meter, completion counters, hours remaining), five selectable watch paths, and a vertical connected timeline with tap-to-complete nodes, haptics and a micro particle burst. |
| **Vault** | 45-character codex with live search (name, alias, actor, power), allegiance filter chips with counts, a staggered 2-column grid and a drag-dismissable detail sheet. |
| **Tier Studio** | S/A/B/C/D board with long-press drag-and-drop between tiers, tap-to-assign, star ratings and a 9:16 branded story-card export. |
| **Movie detail** (modal route) | Backdrop, runtime, synopsis, a prominent "Why It Matters for Doomsday" alert box, live "Where to Stream" widget, star rating, tier assigner and key players. |

### Watch paths

| Path | Titles | For |
| --- | --- | --- |
| **Express** | 9 | The shortest honest route to being Doomsday-ready. |
| **Doom & F4 Lore** | 13 | Victor Von Doom, Marvel's First Family and cosmic scale. |
| **Mutants & Incursions** | 12 | The Fox legacy timeline, anchor beings and collisions. |
| **The New Avengers** | 17 | The roster forming right now and the vacuum it fills. |
| **Completionist** | 43 | Everything, in release order. |

---

## Getting started

```bash
cd multiverse-doomsday
npm install
npx expo start
```

Then press `i` (iOS simulator), `a` (Android emulator), `w` (web), or scan the QR
code with Expo Go.

### Optional: TMDB enrichment

The app ships fully functional offline — every title, description and character
is bundled. A free [TMDB v3 key](https://www.themoviedb.org/settings/api) adds
live posters, backdrops, synopses, actor headshots and country-specific
streaming providers (TMDB's JustWatch-powered endpoint).

```bash
cp .env.example .env
# then set:
EXPO_PUBLIC_TMDB_API_KEY=your_key_here
EXPO_PUBLIC_TMDB_REGION=US
```

Without a key nothing errors: posters fall back to typographic cards, portraits
fall back to generated allegiance emblems, and the stream widget explains how to
switch it on.

### Scripts

```bash
npm run typecheck   # tsc --noEmit
npm run lint        # eslint
npm run web         # expo start --web
```

---

## Architecture

```
multiverse-doomsday/
├── app/                        # Expo Router file-based routes
│   ├── (tabs)/
│   │   ├── _layout.tsx         # Tab bar
│   │   ├── index.tsx           # Roadmap / timeline
│   │   ├── characters.tsx      # Character vault
│   │   └── tierlist.tsx        # Tier studio + share export
│   ├── movie/[id].tsx          # Movie detail (modal presentation)
│   └── _layout.tsx             # Root stack, gesture root, safe areas
├── src/
│   ├── components/
│   │   ├── common/             # Badge, ProgressBar, CustomButton, SearchBar,
│   │   │                       # StarRating, Poster, Confetti, BottomSheet
│   │   ├── roadmap/            # TimelineNode, PathSelector, ReadinessCard, StreamWidget
│   │   ├── characters/         # CharacterCard, CharacterDetailModal, FilterChips, CharacterAvatar
│   │   └── tierlist/           # TierRow, DraggableItem, ShareCard
│   ├── data/                   # movies.json (43), characters.json (45)
│   ├── hooks/                  # useRoadmapStore, useCharacters, useTMDB
│   ├── services/               # tmdbApi.ts
│   ├── types/                  # index.ts — all domain models
│   └── utils/                  # timeCalc.ts, imageHelper.ts
└── tailwind.config.js          # Cosmic palette as design tokens
```

### State

`useRoadmapStore` is a Zustand store persisted to AsyncStorage. It holds only
what the user owns — watched flags, ratings, tiers, the active path — keyed by
movie id. The bundled catalogue stays immutable and the two are merged by
`hydrateMovie()` at read time, so shipping new titles never migrates user data.

Selectors (`usePathMovies`, `useReadiness`, `useTierBoard`, `useFavouriteMovie`)
live next to the store, so screens never reach into raw state.

### TMDB layer

`src/services/tmdbApi.ts` handles details, watch providers and actor lookups with:

- a 7-day AsyncStorage cache plus an in-memory tier,
- in-flight request de-duplication (20 posters mounting at once = one request each),
- a 12-second abort timeout,
- `null` on every failure path, so the UI degrades instead of throwing.

### Design tokens

The cosmic palette is defined once in `tailwind.config.js` and used as utility
classes everywhere: `void` `#0B0813`, `surface` `#161124`, `surface-raised`
`#211A35`, `surface-border` `#372B56`, `doom` `#10B981`, `infinity` `#F59E0B`,
`incursion` `#EF4444`.

---

## Implementation notes

- **`comicBio` is `string[]`.** The spec typed it as `string` but described it as
  "3–4 bullet points", so it is modelled as an array and rendered as a bullet list.
- **`avatarUrl` ships empty by design.** Portraits resolve in this order: a curated
  `avatarUrl`, then a TMDB actor headshot when a key is present, then a generated
  allegiance-gradient emblem with the character's initials. Dropping in CDN URLs is
  a one-field change per character if you want fixed art.
- **`keyCharacterIds`** was added to the movie model so the detail screen can show
  key players without scanning every character.
- **Web output is SPA (`"output": "single"`).** Static rendering runs routes through
  Node, where a native-only dependency fails to interop; the app itself is
  native-first and bundles cleanly for iOS, Android and web.
- **TMDB ids are best-effort.** They were written from reference rather than verified
  against the live API (no outbound access at build time). A wrong id only affects
  remote artwork, which falls back gracefully — worth a pass if you enable a key.

## Verified

`tsc --noEmit` clean · `eslint` clean across 32 files · `expo export` succeeds for
web, iOS and Android.
