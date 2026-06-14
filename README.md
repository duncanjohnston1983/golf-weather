# Golf Weather ⛳

Find the best 4-hour window to play golf today. Powered by [Open-Meteo](https://open-meteo.com) (free, no API key).

**Developer:** Dusk-Labs | **Platform:** Android (Play Store)

---

## Stack

- [Expo](https://expo.dev) (SDK 56) + React Native + TypeScript
- [NativeWind v4](https://nativewind.dev) (Tailwind CSS for React Native)
- [Expo Router](https://expo.github.io/router) (file-based navigation)
- EAS Build for Play Store distribution

---

## Dev Setup

### Prerequisites

- Node.js 18+
- Expo Go installed on your Android phone ([Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent))
- An [Expo account](https://expo.dev/signup) (free)

### Install

```bash
npm install
```

### Run on your phone (Slice 1 onward)

```bash
npm start
```

Scan the QR code with Expo Go. You should see the Golf Weather placeholder screen.

### Other commands

```bash
npm run typecheck   # TypeScript check
npm run lint        # Biome lint
npm run format      # Biome format
npm run check       # Biome lint + format check
```

---

## EAS Build (Play Store)

One-time setup (run once, then skip):

```bash
npx eas-cli login        # Log in to your Expo account
npx eas-cli init         # Links this project to your Expo account, adds projectId to app.json
```

Build an APK for internal testing:

```bash
npx eas-cli build --profile preview --platform android
```

Build a production AAB for Play Store submission:

```bash
npx eas-cli build --profile production --platform android
```

---

## Project Structure

```
app/
  (tabs)/
    index.tsx       ← Home screen (weather results)
    settings.tsx    ← Settings screen
  _layout.tsx       ← Root layout + NativeWind CSS import
src/
  services/         ← Open-Meteo geocoding + forecast fetchers (Slice 2)
  scoring/          ← scoreHour / scoreWindow / rankWindows (Slice 3)
  types/            ← Shared TypeScript types
docs/               ← SPEC.md, BRIEF.md, ADR-001 (project spec docs)
```

---

## Slices

| # | What | Status |
|---|------|--------|
| 1 | Scaffold + GitHub + EAS config | ✅ Done |
| 2 | Data layer (Open-Meteo API) | 🔜 |
| 3 | Scoring engine + unit tests | 🔜 |
| 4 | UI core (results list + best window) | 🔜 |
| 5 | Settings screen | 🔜 |
| 6 | Play Store ship | 🔜 |

---

*Weather data by [Open-Meteo.com](https://open-meteo.com) (CC BY 4.0)*
