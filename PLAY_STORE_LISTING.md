# Golf Weather — Google Play Store Listing

## App Details

**App name** (30 chars max)
```
Golf Weather
```

**Short description** (80 chars max)
```
Score every tee window 0–100. Find your perfect time to play.
```

**Full description** (4000 chars max)
```
Golf Weather scores every tee window in the day so you can pick the best time to play — not just whether it will rain, but exactly when.

Every hour of daylight is scored 0–100 for wind, rain, and temperature. The app then finds every possible round window (you pick the length) and ranks them. The best window sits at the top with a full breakdown.

─── What you get ───

• Ranked tee windows — every slot in the day scored, best first
• Hourly breakdown — tap any window to see what each hour looks like
• Condition cards — rainy windows look rainy, cold windows look cold, hot windows look hot, with subtle animated weather effects
• Narrative summaries — "Showers possible 11:00–13:00" or "Wind picks up from 14:00"
• Golf course search — search by club name or town to get a forecast exactly where you're playing
• GPS auto-detect — opens on your current location straight away

─── Tune it to how you play ───

Not everyone minds a bit of rain. Settings let you dial in exactly how much each factor matters to you:

• Rain sensitivity — boost it if soggy shoes are a dealbreaker
• Wind sensitivity — boost it if crosswinds ruin your game
• Temperature — the scoring penalises both cold and heat (the sweet spot is 12–25 °C)
• Earliest tee time — filter out windows that start too early
• Default round length — 3 to 5 hours

─── Clean and honest ───

No account. No ads. No data collected. Weather is pulled from Open-Meteo's free public API — accurate hourly forecasts with no API key needed. Your settings stay on your device.

─── Support the app ───

Golf Weather is free with no ads. If it saves you walking out into a downpour, consider buying me a coffee — there's a link right in the app.
```

---

## Categorisation

**Category:** Sports
**Sub-category:** Golf *(if available)*
**Tags / Keywords:** golf, weather, tee time, forecast, golf course, wind, rain, score

---

## Content Rating

**Questionnaire answers:**
- Violence: No
- Sexual content: No
- Profanity: No
- Controlled substances: No
- User-generated content: No
- Location sharing: No (location used locally only, not transmitted to third parties)
- Financial transactions: No (Ko-fi link opens browser — no in-app payments)

**Expected rating:** Everyone (E)

---

## App Access

No login or account required. All features available immediately on launch.

---

## Privacy Policy URL

Host `privacy-policy.html` at a public URL before submitting.
Recommended: `https://dusk-labs.com/golf-weather/privacy`
Or GitHub Pages: `https://duncanjohnston1983.github.io/golf-weather/privacy-policy`

---

## Contact Details (for Play Console)

- **Email:** support@dusk-labs.com
- **Website:** https://ko-fi.com/golfweather *(until a proper site exists)*

---

## Assets Checklist

| Asset | File | Size | Status |
|-------|------|------|--------|
| App icon | `assets/images/icon.png` | 1024×1024 PNG | ✅ |
| Adaptive icon foreground | `assets/images/android-icon-foreground.png` | 1024×1024 PNG | ✅ |
| Adaptive icon background | `assets/images/android-icon-background.png` | 1024×1024 PNG | ✅ |
| Adaptive icon monochrome | `assets/images/android-icon-monochrome.png` | 1024×1024 PNG | ✅ |
| Splash screen | `assets/images/splash-icon.png` | 1284×2778 PNG | ✅ |
| Feature graphic | `assets/images/feature-graphic.png` | 1024×500 PNG | ✅ |
| Privacy policy | `privacy-policy.html` | — | ✅ (needs public hosting) |
| Screenshots | — | Min 2, portrait | ⏳ Needs device screenshots |
| Production AAB | — | via EAS production build | ⏳ |

---

## Remaining before submission

1. **Screenshots** — Take 4–6 on-device screenshots: idle screen, location search, best window card (rainy condition), settings, window breakdown
2. **Privacy policy** — Host `privacy-policy.html` at a public URL and enter it in Play Console
3. **Production AAB** — Run: `eas build --platform android --profile production`
4. **Play Console** — Create app, fill in listing, upload AAB, complete data safety form, submit for review

---

## Data Safety Form (Play Console)

**Does your app collect or share any of the required user data types?**
- Location: Yes — *Approximate location, for local weather forecast only. Not shared. Not stored.*
- Everything else: No

**Is all user data encrypted in transit?** Yes (HTTPS to Open-Meteo)
**Can users request data deletion?** Not applicable — no data collected or stored.
