# Adding real movie posters

The app ships **no movie posters**. Comic artwork is used for characters only —
a film is represented by its real poster or by a typographic card, never by a
character illustration.

There are two ways to get real posters in, and they can be combined.

## 1. A TMDB key (recommended)

One key covers all 43 titles, and also unlocks backdrops, synopses,
country-specific streaming links and actor headshots in the vault.

1. Create a free account at <https://www.themoviedb.org/signup>
2. Request a v3 API key: Settings → API → *Create* → Developer
3. Add it to `multiverse-doomsday/.env`:

```
EXPO_PUBLIC_TMDB_API_KEY=your_key_here
EXPO_PUBLIC_TMDB_REGION=IN
```

4. Restart the dev server (`npx expo start -c`)

Posters appear immediately, and `resolveTmdbId()` verifies each bundled id
against the title and release year — so a wrong id fixes itself rather than
showing the wrong film.

## 2. Local poster files

Useful offline, or to override TMDB with a specific poster you prefer.

1. Save the poster as `assets/images/posters/<id>.jpg` (`.png` and `.webp` work too)
2. Run `npm run posters`
3. Restart the dev server

`npm run posters` regenerates `src/data/posterImages.ts` and prints whatever is
still missing. Posters look best at 2:3 — 500×750 is plenty.

### Filenames

| File | Title | Year |
| --- | --- | --- |
| `iron-man.jpg` | Iron Man | 2008 |
| `the-avengers.jpg` | The Avengers | 2012 |
| `age-of-ultron.jpg` | Avengers: Age of Ultron | 2015 |
| `civil-war.jpg` | Captain America: Civil War | 2016 |
| `doctor-strange.jpg` | Doctor Strange | 2016 |
| `thor-ragnarok.jpg` | Thor: Ragnarok | 2017 |
| `black-panther.jpg` | Black Panther | 2018 |
| `infinity-war.jpg` | Avengers: Infinity War | 2018 |
| `endgame.jpg` | Avengers: Endgame | 2019 |
| `captain-marvel.jpg` | Captain Marvel | 2019 |
| `far-from-home.jpg` | Spider-Man: Far From Home | 2019 |
| `wandavision.jpg` | WandaVision | 2021 |
| `falcon-winter-soldier.jpg` | The Falcon and the Winter Soldier | 2021 |
| `loki-s1.jpg` | Loki — Season 1 | 2021 |
| `what-if-s1.jpg` | What If...? — Season 1 | 2021 |
| `shang-chi.jpg` | Shang-Chi and the Legend of the Ten Rings | 2021 |
| `eternals.jpg` | Eternals | 2021 |
| `hawkeye.jpg` | Hawkeye | 2021 |
| `moon-knight.jpg` | Moon Knight | 2022 |
| `multiverse-of-madness.jpg` | Doctor Strange in the Multiverse of Madness | 2022 |
| `ms-marvel.jpg` | Ms. Marvel | 2022 |
| `she-hulk.jpg` | She-Hulk: Attorney at Law | 2022 |
| `wakanda-forever.jpg` | Black Panther: Wakanda Forever | 2022 |
| `no-way-home.jpg` | Spider-Man: No Way Home | 2021 |
| `quantumania.jpg` | Ant-Man and the Wasp: Quantumania | 2023 |
| `guardians-vol-3.jpg` | Guardians of the Galaxy Vol. 3 | 2023 |
| `secret-invasion.jpg` | Secret Invasion | 2023 |
| `loki-s2.jpg` | Loki — Season 2 | 2023 |
| `the-marvels.jpg` | The Marvels | 2023 |
| `echo.jpg` | Echo | 2024 |
| `deadpool-and-wolverine.jpg` | Deadpool & Wolverine | 2024 |
| `agatha-all-along.jpg` | Agatha All Along | 2024 |
| `brave-new-world.jpg` | Captain America: Brave New World | 2025 |
| `daredevil-born-again.jpg` | Daredevil: Born Again | 2025 |
| `thunderbolts.jpg` | Thunderbolts* | 2025 |
| `fantastic-four-first-steps.jpg` | The Fantastic Four: First Steps | 2025 |
| `x-men-2000.jpg` | X-Men | 2000 |
| `x2.jpg` | X2: X-Men United | 2003 |
| `x-men-first-class.jpg` | X-Men: First Class | 2011 |
| `days-of-future-past.jpg` | X-Men: Days of Future Past | 2014 |
| `deadpool.jpg` | Deadpool | 2016 |
| `deadpool-2.jpg` | Deadpool 2 | 2018 |
| `logan.jpg` | Logan | 2017 |
