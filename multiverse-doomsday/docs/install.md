# Getting the app onto your phone

Three ways, from quickest to most permanent. All are free.

---

## Option A — Real installable app (recommended)

EAS Build compiles the app on Expo's servers and hands you a download link. You
end up with a normal app on your home screen: icon, notifications, everything.
No Play Store, no developer fee.

You need a computer for these commands, and a free Expo account.

```bash
cd multiverse-doomsday
npm install

npm install -g eas-cli
eas login                    # create a free account at expo.dev if you have none
eas build:configure          # links the project (first time only)

eas build --platform android --profile preview
```

The build takes roughly 10–20 minutes on the free queue. When it finishes the
terminal prints a URL and a QR code:

1. Open that link on your phone (or scan the QR)
2. Tap **Install**
3. Android will warn about installing outside the Play Store — allow it for
   your browser, then install

That APK is yours to share. Send the link to anyone in your group and they can
install the same build.

### iPhone

iOS is stricter: sideloading needs either a paid Apple Developer account
($99/yr) or a TestFlight build. Without one, use Option B on iOS.

```bash
eas build --platform ios --profile preview   # needs an Apple Developer account
```

---

## Option B — Expo Go (fastest look, no build)

Good for trying it in two minutes, or for iPhone without a developer account.

1. Install **Expo Go** from the Play Store or App Store
2. On your computer, in the project folder:

```bash
npm install
npx expo start
```

3. Scan the QR code with Expo Go (Android) or the Camera app (iOS)

Phone and computer must be on the same Wi-Fi. Add `--tunnel` if they are not.

**Limitation:** daily reminders are unreliable in Expo Go. Everything else —
progress, vault, tiers, themes, the countdown — works fully. For notifications,
use Option A or C.

---

## Option C — Development build (for changing the code)

A build that runs your local code with the full native runtime, so
notifications behave exactly as they will in production.

```bash
eas build --platform android --profile development
# install the resulting APK, then:
npx expo start --dev-client
```

---

## Before you build: add your TMDB key

Posters, backdrops, streaming links and actor headshots all come from TMDB.
Without a key the app still works — it falls back to typographic cards — but
with one it looks complete.

Create `multiverse-doomsday/.env`:

```
EXPO_PUBLIC_TMDB_API_KEY=your_key_here
EXPO_PUBLIC_TMDB_REGION=IN
```

Free key: <https://www.themoviedb.org/settings/api> (v3 auth).

`EXPO_PUBLIC_` variables are compiled into the app at build time, so set this
**before** running `eas build`. Rebuild if you add it later.

---

## Sharing it with your group

The `preview` APK from Option A is a single file with a public download link.
Anyone can install it — no account, no Expo Go, no Play Store. Each person's
progress, ratings and tier list live only on their own device.

Note the app bundles Marvel-owned artwork, so keep distribution to people you
know rather than a public listing.
