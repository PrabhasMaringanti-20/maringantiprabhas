# Getting the app onto your phone — step by step

**Total cost: nothing.** Every account and service below has a free tier that
needs no card. The one paid path (iPhone sideloading) is called out where it
appears, with a free alternative.

You need: a computer (Windows, macOS or Linux), an Android phone, and internet.

---

## Windows: opening a terminal

"Terminal" on Windows means **PowerShell**. It is already installed.

Press the **Windows key**, type `powershell`, press **Enter**. A window opens
with a prompt like `PS C:\Users\YourName>`. That is where every command below
gets typed. Type it, press Enter, wait for the prompt to come back.

To paste into PowerShell: **right-click**, or Ctrl+V.

---

## Step 1 — Install Node.js

Download the **LTS** version from <https://nodejs.org> and run the installer.

Then open a terminal (Windows: PowerShell; macOS: Terminal) and check:

```bash
node -v      # expect v20 or higher
npm -v
```

## Step 2 — Install Git

**Windows, one command** (PowerShell):

```powershell
winget install --id Git.Git -e
```

Then **close PowerShell and open it again** — new programs only appear in a
fresh window. Check:

```powershell
git --version
```

If `winget` is not recognised (older Windows), download the installer from
<https://git-scm.com/download/win> instead — that is a website, opened in a
browser. Accept every default in the installer.

macOS: `git --version` triggers the install prompt. Linux:
`sudo apt install git`.

## Step 3 — Download the project

```bash
git clone -b claude/multiverse-roadmap-marvel-v2svaq https://github.com/PrabhasMaringanti-20/maringantiprabhas.git
cd maringantiprabhas/multiverse-doomsday
```

## Step 4 — Install the dependencies

```bash
npm install
```

Two to four minutes. Warnings are normal; errors are not.

## Step 5 — Get a free TMDB key

This is what turns the typographic cards into real movie posters, and fills in
backdrops, synopses, streaming links and actor headshots.

1. Sign up at <https://www.themoviedb.org/signup> — free, no card
2. Go to **Settings → API → Create → Developer**
3. Fill the short form (any personal-project description is fine)
4. Copy the key labelled **API Key (v3 auth)**

Create a file called `.env` inside `multiverse-doomsday/`:

```
EXPO_PUBLIC_TMDB_API_KEY=paste_your_key_here
EXPO_PUBLIC_TMDB_REGION=IN
```

`.env` is git-ignored, so the key never leaves your machine.

> `EXPO_PUBLIC_` values are compiled into the app **at build time**. Set this
> before Step 7, or you will have to rebuild.

## Step 6 — Try it before you build

This costs nothing and uses no build quota, so do it first.

1. Install **Expo Go** from the Play Store
2. On the computer: `npx expo start`
3. Scan the QR code with Expo Go

Phone and computer must be on the same Wi-Fi. If the QR will not connect, stop
the server and run `npx expo start --tunnel` instead.

Check that posters load. If they do, the key works and the build will be right.

*Daily reminders are unreliable in Expo Go — that is expected, and Step 7 fixes
it. Everything else works.*

## Step 6b — Put the key on EAS as well

EAS builds on Expo's servers, from the files tracked in git. `.env` is
git-ignored — correctly, so your key never lands on GitHub — which means the
build machine cannot see it. `EXPO_PUBLIC_` values are compiled in at build
time, so a key that is missing during the build is missing from the app.

Set it once on EAS and every future build picks it up:

**Website (easiest):** <https://expo.dev> → your project → **Environment
Variables** → **Create** →

| Field | Value |
| --- | --- |
| Name | `EXPO_PUBLIC_TMDB_API_KEY` |
| Value | your key |
| Environment | tick **preview** (and **production**) |
| Visibility | Plain text |

Repeat for `EXPO_PUBLIC_TMDB_REGION` with value `IN`.

**Or from the terminal:**

```powershell
eas env:create --environment preview --name EXPO_PUBLIC_TMDB_API_KEY --value "your_key" --visibility plaintext
eas env:create --environment preview --name EXPO_PUBLIC_TMDB_REGION --value "IN" --visibility plaintext
```

`EXPO_PUBLIC_` variables end up readable inside the app bundle by design, so
plain text is the right visibility here — treat this key as public-ish and keep
it to personal use.

## Step 7 — Build the installable app

```bash
npm install -g eas-cli
eas login
```

If you have no Expo account, create one at <https://expo.dev/signup> — free,
**no credit card**. The free plan includes **15 Android builds a month**, and
once the quota is used builds simply pause until the 1st of the next month.
There are no overage charges on the free plan.

```bash
eas build:configure          # pick Android when asked
eas build --platform android --profile preview
```

Answer **Yes** when it offers to generate a keystore — Expo stores it for you,
free, and reuses it for future builds.

The build takes 10–20 minutes on the free queue. Leave the terminal open.

## Step 8 — Install it

When the build finishes, the terminal prints a link and a QR code.

1. Open that link on your phone (or scan the QR)
2. Tap **Install** — the browser downloads an `.apk`
3. Android asks to allow installs from this source: allow it for your browser
4. Install, then open the app

You now have a real app: home-screen icon, offline data, working notifications.

## Step 9 — Switch on the daily reminder

Open the app → **Ideator** tab → **Daily reminder** → toggle on, pick a time.
Allow notifications when Android asks. You will get one Marvel line a day with
the days-to-Doomsday count.

## Step 10 — Share it with your group

The link from Step 8 is public and reusable. Anyone can install the same APK —
no Expo Go, no account, no Play Store. Each person's progress, ratings and tier
list stay on their own phone.

---

## iPhone

Apple does not allow free sideloading of a build like this. Options:

- **Free:** Expo Go (Step 6). Everything works except reliable notifications.
- **Paid:** an Apple Developer account ($99/yr) for
  `eas build --platform ios --profile preview`. Not required for anything here.

---

## If something goes wrong

**`npm` or `git` not recognised** — close and reopen the terminal after
installing; the PATH updates only for new terminals.

**Windows: "running scripts is disabled on this system"** — this appears the
first time you run `eas` or `npx`. Fix it once:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

Press `Y` and Enter, then re-run the command.

**Windows: Notepad saved the file as `.env.txt`** — Notepad appends `.txt` when
you use *Save As*. Create the file from PowerShell instead (Step 5) or run
`notepad .env`, which keeps the name.

**QR code will not connect** — `npx expo start --tunnel`.

**Metro cache weirdness after editing** — `npx expo start -c`.

**"App not installed" on Android** — an older copy with the same package name is
present. Uninstall it first.

**Posters still missing after adding the key** — the key is compiled in at build
time, so rebuild (Step 7). In Expo Go, restart with `npx expo start -c`.

**Build quota used up** — 15 per month on the free plan; it resets on the 1st.
Test in Expo Go meanwhile, which uses no quota.

---

## Fully offline alternative (no cloud at all)

If you would rather not use Expo's servers, you can build on your own machine
with Android Studio installed:

```bash
npx expo run:android --variant release
```

This needs the Android SDK (a several-GB download) and is slower to set up, but
it is free and everything stays local.
