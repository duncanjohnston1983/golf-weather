---
project_slug: golf-weather
project_name: Golf Weather
status: spec'd
pentest_target: no
classification: public
created: 2026-06-14
clarify_loop:
  rounds: 1
  started: 2026-06-14T09:37:00+01:00
  elapsed_min: 5
---

# Golf Weather — Brief

## Summary

A standalone web app: pick a course and a date, get the **best 4-hour window to play**, ranked by a golf-specific playability score.

## Positioning

This is a **reps build**, not a market play. The space is already crowded (TeeCast, Weather4Golf, Golf Weather Pro, shouldiplaygolf.com all do "best window + 0-100 playability score"). The goal is to **ship the full loop end to end** — scope, build, deploy, and optionally wire payments once — for Duncan and golf mates.

Success = it's deployed, you use it, and you've touched every part of shipping a real product solo.

## Core Concept

- **Input:** course (or location) + date (today → +15 days) + round length (default 4h)
- **Output:** every viable tee-off window that day, scored 0-100 for golf playability, ranked best-first, with the winning window highlighted and a short "why" (wind / rain / temp / daylight)
- The **playability score is the product.** Everything else is plumbing.

## Playability Scoring Model

### Candidate Windows
- Earliest start = max(`sunrise`, configurable floor e.g. 07:00)
- Latest start = `sunset` - round length - buffer (e.g. 30 min)
- Step = 1 hour
- A window that can't finish before `sunset - buffer` is **excluded**, not scored

### Per-Hour Penalties

| Factor | Source field | Starting logic |
|---|---|---|
| Rain | `precipitation_probability` (%), `precipitation` (mm) | Light below ~20% prob & <0.2mm; ramp up sharply above; thunderstorm = near-zero |
| Wind | `wind_speed_10m` + `wind_gusts_10m` (mph) | Negligible <12mph; noticeable 12-20; rough 20-28; brutal >28 sustained |
| Temperature | `apparent_temperature` (°C) | Ideal band ~11-22°C; penalty for cold <7, hot >27 |

### Aggregation

```
windowPenalty = 0.5 * mean(hourlyPenalties) + 0.5 * max(hourlyPenalties)
windowScore   = clamp(100 - windowPenalty, 0, 100)
```

### Config Object (tune "your" playability)

```ts
const SCORING = {
  roundLengthHours: 4,
  daylightBufferMins: 30,
  earliestStart: "07:00",
  weights: { rain: 0.5, wind: 0.35, temp: 0.15 },
  wind:  { calm: 12, breezy: 20, rough: 28, gustRough: 35 },
  temp:  { idealMin: 11, idealMax: 22, cold: 7, hot: 27 },
  rain:  { probLow: 20, probHigh: 60, mmLight: 0.2, mmHeavy: 2 },
};
```

## Weather Data — Open-Meteo

- **Endpoint:** `https://api.open-meteo.com/v1/forecast`
- No API key, no signup, JSON over HTTP GET, CORS-friendly
- Free for non-commercial use; CC BY 4.0 (attribution required)
- If monetised: must move to paid commercial plan

### Hourly Fields
`temperature_2m, apparent_temperature, precipitation, precipitation_probability, weather_code, wind_speed_10m, wind_gusts_10m, wind_direction_10m`

### Daily Fields
`sunrise, sunset, uv_index_max`

## Courses / Location Handling

Seed a small JSON of courses Duncan and mates play, with lat/long. Geocode fallback is v2.

## Tech Stack

- React + Vite + TypeScript
- Tailwind CSS
- No backend needed for v1 (Open-Meteo direct from client)
- Hosting: Vercel / Netlify / Cloudflare Pages free tier
- Plain React state — no DB for v1

## MVP Scope (v1)

**In:**
1. Course selector (from seed list)
2. Date selector (today → +15 days)
3. Fetch forecast, score all viable windows, render ranked list
4. Highlight single best window + one-line reason
5. Per-window mini-breakdown: score, wind, gust, rain %, feels-like
6. UK units (mph / °C / mm)
7. Open-Meteo attribution credit

**Explicitly OUT (v2+):**
- Course database / search
- Accounts/login
- Full payments/subscription (but "Buy Me a Coffee" or donate button may be added)
- Alerts/notifications
- Multi-course compare
- Ball-flight/yardage modelling
- Mobile-native app (this is a web app, mobile-first)
- Ground/frost/drainage modelling

## UI / Dashboard Layout

```
┌───────────────────────────────────────────────┐
│  ⛳ Golf Weather                                 │
│  [ Course ▼ ]   [ Date ▼ ]   [ Round: 4h ▼ ]    │
├───────────────────────────────────────────────┤
│  BEST WINDOW                                     │
│  09:00 – 13:00   ·  Score 88/100                 │
│  "Light winds, dry, comfortable."                │
├───────────────────────────────────────────────┤
│  All windows                                     │
│  08:00–12:00  ▓▓▓▓▓▓▓░  82   12mph · 0% · 14°C   │
│  09:00–13:00  ▓▓▓▓▓▓▓▓  88   9mph  · 0% · 16°C   │
│  10:00–14:00  ▓▓▓▓▓░░░  64   18mph · 30%· 17°C   │
└───────────────────────────────────────────────┘
```

## Build Phases

1. **Scaffold** — Vite + React + TS + Tailwind, deploy hello-world to Vercel first
2. **Data layer** — `fetchForecast(lat, lng, date)`, typed response, logged
3. **Scoring** — pure functions: `scoreHour()`, `scoreWindow()`, `rankWindows()` with unit tests
4. **UI** — selectors → results list → best-window highlight
5. **Polish** — units, attribution, empty/error states, loading state
6. **Ship** — redeploy, share URL with golf mates

## Data Shapes

```ts
interface HourPoint {
  time: string; temp: number; feelsLike: number;
  precip: number; precipProb: number; windSpeed: number;
  windGust: number; windDir: number; weatherCode: number;
}
interface ScoredWindow {
  start: string; end: string; score: number;
  reason: string; hours: HourPoint[];
}
```

## Monetisation

Donate link only — Buy Me a Coffee or Ko-fi external link. Not a subscription. If the donate link earns money, Open-Meteo commercial tier must be verified.

## MAJOR PIVOT (from Round 1 answers)

The brief was written assuming a web app. Duncan's actual intent is:

- **Play Store Android app** (not a web app)
- **Android only** (has an Android phone, no iOS concern for v1)
- Open to any stack — mentioned Flutter; open to Expo/React Native or anything better
- Course search by name or location (not just a seed list)
- User-configurable units (mph/kph, °C/°F — not locked to UK)
- Duncan is a first-time mobile app developer — needs full guidance on every step
- Hosting/distribution = Play Store (not Vercel); has GitHub
- The react/vite/tailwind from the brief is no longer the locked stack

## Open Decisions

- Final seed course list + verified lat/long
- Round length default (4h vs 4.5h for 18-hole fourball)
- Earliest tee floor and daylight buffer values
- Scoring weight calibration against real remembered rounds

## Inputs ingested

None. No files in inputs/.

## Round 1 answers (verbatim)

- **Intent/Success:** "I want the app to not just be for mates, so let's just clear that one out. It should be Play Store. We're gonna make it Android only, I think, because I have an Android phone available and it'd be great if I made a touch of coffee money off it. It's just a test really more than anything I'm not chasing down the big dogs with it. Also the ask is for React, TS, Tailwind, no backend. I mean I don't particularly want a back end; it should be mobile-only, but there's no specifics set on that, so whatever's best. Same with things like units: they should be configurable by the user. I don't want to lock anything down essentially here, so this should be a fully user-facing Play Store app that allows someone to just search for a course or check their location and have a look at golf weather around them for, like, a four hour window. What's the best four hour window on the day that they've picked to play golf?"
- **Scope/PWA:** "It needs to be an app that's available on the Play Store. Again, I'm not really fussed on what it's going to be written in. Maybe something like Flutter could be good, but that's just a suggestion. But if there are better things out there for doing what we need to do, then use those."
- **Hosting:** "I've got GitHub available. I don't actually know what Vercel is, so yeah, either take me through that or give me options. Like I say, I'm open to suggestions. I just want to get an app that's easily shippable."
- **Security:** "I'll need full steer on this side of it, to be honest. I don't know what the best is. This is one of the reasons for doing this app: it's the first time I've ever done anything like it, so it'll be a learning experience for me. So I'll need guidance."

## Round 1 questions

**Intent — Q1**
I would assume the primary success measure is "you deployed it and use it yourself." Confirm or correct: if the app is live and works perfectly but your golf mates never bother (they're happy with Weather4Golf), is the project still fully successful? I'm asking because "mates actually adopt it" vs "I shipped the loop" require different decisions around UX polish, reliability, and onboarding.

**Scope — Q2**
I would assume "mobile app" in your opening message means a mobile-first web app (React/Vite/Tailwind), not a React Native or Expo native app. Confirm or correct. And specifically: is adding a PWA web manifest so it's installable from the iOS/Android home screen (and optionally works offline) in scope for v1, or is that v2?

**Users — Q3**
I would assume all the courses you'd put in the seed list are in the UK (so `timezone=auto` in Open-Meteo is sufficient and hardcoding BST/GMT isn't needed). Confirm or correct. More importantly: give me the 3-5 real course names you'd put in v1 — name and rough location (town/county is enough). This is the only blocker before I can write the data layer.

**Decisions — Q4 (Hosting & Repo)**
I would assume you either have an existing Vercel account or are happy to create one. Confirm or correct: do you have a Vercel account already (ideally linked to the GitHub you'd use for this repo)? And: public repo or private? Custom domain for v1, or *.vercel.app is fine?

**Decisions — Q5 (Scoring calibration)**
I would assume the scoring weights in the brief are educated guesses that need tuning to your actual tolerances. Tell me about two real rounds: one you regret going out in (what were the conditions — mostly wind? mostly rain? cold?), and one that surprised you positively. This is the only way to set the weights to _your_ golf preferences rather than generic ones.

**Security — Q6**
I would assume this app has no server, no auth, no user data stored anywhere — it's a fully client-side read-only tool calling a public API. Confirm or correct. For the donate button: I'm assuming that's a Buy Me a Coffee or Ko-fi external link (you redirect the user, no payment handling on your side). Confirm that's the model. One genuine risk: if the URL gets widely shared, Open-Meteo's free tier allows ~10k requests/day. You'd need ~2,500 simultaneous daily users to hit it — not a concern for a personal app, but worth confirming you're comfortable with it staying uncached client-side.

**Constraints — Q7**
I would assume "weekend-shippable" is an aspiration, not a committed deadline. Confirm or correct. More practically: do you want the dev build served from the Mac mini / Caddy / Tailscale setup so you can test on your phone mid-build, or does it go straight to Vercel from day one?
