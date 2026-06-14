# ADR-001: Initial Decisions — Golf Weather

Date: 2026-06-14
Status: Accepted

---

## ADR-001-A: Expo (React Native + TypeScript) over Flutter and Capacitor

**Context:** First-time mobile developer. Needs to ship to Google Play Store. Mentioned TypeScript and React in the brief; open to any stack.

**Decision:** Expo (React Native + TypeScript + NativeWind).

**Rationale:**
- TypeScript is the language family stated in the brief — lowest cognitive overhead
- Expo Go gives instant live testing on an Android device from Day 1 — no build pipeline needed during development
- EAS Build abstracts Play Store AAB generation (cloud-based, free tier)
- NativeWind brings Tailwind-style class names — consistent with the brief's styling assumptions
- React Native has the largest community of the three options

**Rejected alternatives:**
- Flutter: Dart is a separate language; no advantage for this app's complexity
- Capacitor: a web-app wrapper; acceptable but React Native gives a more "native" result and better learning value as a "first mobile app"

---

## ADR-001-B: Open-Meteo geocoding over Google Places / OSM Overpass for course input

**Context:** User wants to find a course by name or GPS location. Original brief had a seed-list JSON of courses. Round 1 clarified that free-text search is preferred.

**Decision:** Open-Meteo geocoding API (`geocoding-api.open-meteo.com/v1/search`) for place-name search.

**Rationale:**
- Same provider as weather data — no additional API key or signup
- Returns lat/lng for any city, town, or village — sufficient for "search by course location"
- Completely free, CORS-friendly
- Limitations: searches places, not golf course names specifically. User searches "Warwick" not "The Warwickshire Golf Club." This is acceptable for v1.

**Rejected alternatives:**
- Google Places API: has a free tier but requires billing setup + API key; overkill for v1
- Overpass/OSM: can search for `leisure=golf_course` by name, but data quality is variable and adds query complexity. Reserved for v2 "course name search" feature.

---

## ADR-001-C: No backend (client-side only)

**Context:** User prefers no backend. App only needs weather data from a free public API.

**Decision:** Fully client-side. No server, no database, no auth.

**Rationale:**
- Open-Meteo supports CORS — can be called directly from the React Native app
- No user data to store server-side
- Removes infra complexity, hosting cost, and auth surface entirely
- User preferences stored in AsyncStorage (device-local only)

**If this changes (v2+):** A lightweight Cloudflare Worker could act as a caching proxy to reduce Open-Meteo calls and absorb rate-limit risk. Out of scope for v1.

---

## ADR-001-D: Android-only for v1 (no iOS)

**Context:** Duncan has an Android phone. iOS requires a Mac with Xcode + Apple Developer Account ($99/year). Expo supports both platforms.

**Decision:** Android-only for v1. iOS is explicitly v2+.

**Rationale:**
- Duncan's test device is Android
- Apple Developer Account adds cost and toolchain complexity
- Google Play Developer Account is $25 one-time — much lower barrier
- Expo's codebase is 95% shared — iOS can be added in a future slice with minimal rework

---

## ADR-001-E: AsyncStorage for user preferences (no cloud sync)

**Context:** Settings (units, scoring weights, round preferences) need to persist across app restarts.

**Decision:** AsyncStorage (device-local, React Native's built-in key/value store).

**Rationale:**
- No user accounts means no cloud sync target
- Preferences are not sensitive — no encryption needed
- AsyncStorage is the standard Expo/React Native approach
- If a user reinstalls the app, settings reset (acceptable for a personal tool)

---

## ADR-001-F: GitHub Pages for privacy policy

**Context:** Google Play requires a privacy policy URL even for apps that collect no personal data.

**Decision:** A single-page static HTML file deployed to GitHub Pages.

**Rationale:**
- Free, permanent URL
- Sufficient for Play Store review
- Takes 30 minutes to write and deploy
- Hosted in the same GitHub account as the app repo

---

## ADR-001-G: EAS Build for Play Store AAB (over local Android Studio builds)

**Context:** First-time Android developer. Local Android Studio builds require Java SDK, Android SDK, and configuration.

**Decision:** EAS Build (Expo Application Services cloud build) for all Play Store builds.

**Rationale:**
- Zero local Android toolchain required for standard builds
- Free tier: 30 builds/month — more than enough for v1
- EAS Submit can automate Play Store upload
- Fallback: `eas build --local` if cloud queue wait is too long (requires local Android Studio at that point)

---

## Future ADRs

Later slices will capture:
- ADR-002: Course name search (Overpass vs other) when v2 is scoped
- ADR-003: Monetisation approach if "Buy Me a Coffee" link triggers Play Store policy review
- ADR-004: iOS support when Apple Developer Account is set up
