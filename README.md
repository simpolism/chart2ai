# chart2ai

> Smart Prompts for AI Astrology

A React Native + Expo app (web/iOS/Android) that takes birth data, computes a precise astrological or human design chart, renders it as structured text designed for LLM consumption, and lets you pair it with the reading-style prompt of your choice.

**chart2ai does not call an LLM itself.** It generates a chart-text + prompt blob that you copy into the AI of your choice — Claude, GPT, Gemini, a local model, whatever. Your readings, your model, your data.

Powered by [chart2txt](https://github.com/simpolism/chart2txt) for the chart-rendering core.

---

## Why

Most LLM astrology tools either lock you into a single provider or feed the model a half-baked chart summary, which produces shallow readings. chart2ai's premise: if you give a modern LLM the *same* dense, structured chart data a human astrologer reads from — degrees and arcminutes, dispositor trees, aspect orbs, applying/separating motion, house overlays — and you pair it with a thoughtful reading-style prompt, you get something much closer to a real reading.

The chart-text format is defined and maintained in [chart2txt](https://github.com/simpolism/chart2txt). chart2ai is the user-facing layer: form, persistence, prompt library, and copy/share UX.

---

## Features

- **Natal, synastry, and transit charts** — single person, two-person compatibility, or chart + current-moment transits
- **Human Design support** — gates, lines, channels, centers, profile, type
- **Multiple house systems** — Placidus, Whole Sign, Equal, Porphyry
- **People library** — auto-saves charts you've generated so you can pull them up quickly
- **Prompt library** — built-in reading styles (modern, traditional, mystical) plus custom prompts (up to 100)
- **Smart location autocomplete** via the Photon API
- **GPS shortcut** for "use my current location" in transit setup
- **All data is local** — AsyncStorage, no account, no backend, your charts never leave your device

---

## Quick start

Prerequisites:

- Node.js 18 or later
- Expo CLI: `npm install -g @expo/cli`

```bash
git clone https://github.com/simpolism/chart2ai.git
cd chart2ai
npm install
cp .env.example .env  # optional, only needed if you wire up future auth/email features
npm start
```

Then either:

- Press `w` to open the web build in your browser
- Scan the QR code with the Expo Go app on iOS or Android

---

## How it works

```
[user fills form] → ChartFormData
       ↓
[chartGenerator.ts]
       ↓
fetch /api/positions from simple-astro-api
       ↓
[chart2txt] renders structured text
       ↓
[chartFiltering.ts] applies orb sensitivity & weight settings
       ↓
[promptSections.ts] composes system prompt + chart text
       ↓
result dialog → copy / share / paste into your LLM
```

Key modules:

- `src/utils/chartGenerator.ts` — bridges form data to chart2txt's `analyzeCharts` / `formatReportToText`
- `src/utils/astroApi.ts` — fetches planetary positions from [simple-astro-api](https://simple-astro-api.netlify.app/)
- `src/utils/chartFiltering.ts` — orb sensitivity presets, planet weighting, aspect/pattern count limits
- `src/data/promptSections.ts` — composable reading-style prompts
- `src/data/systemPrompt.ts` — the "you are an astrologer" guardrails and truth-rules
- `src/components/chart-generation/` — the input form and its dialogs
- `src/components/chart-results/` — the result dialog with copy/share
- `src/components/chart-management/` — chart/result libraries
- `src/components/chart-input/` — date/time/location pickers

---

## External dependencies

- **[chart2txt](https://github.com/simpolism/chart2txt)** — chart math + text rendering. Maintained alongside this app; bug reports affecting chart content usually belong upstream.
- **[Photon API](https://photon.komoot.io/)** — location geocoding and autocomplete. Free, no key required.
- **[simple-astro-api](https://github.com/simpolism/simple-astro-api)** — planetary position calculations. The default endpoint is the maintainer's free hosted instance at `https://simple-astro-api.netlify.app/`. **Commercial users must self-host:** the API wraps the [Swiss Ephemeris](https://www.astro.com/swisseph/) (`sweph`), which is free for non-commercial use but requires a paid license for commercial deployments. See the [simple-astro-api README](https://github.com/simpolism/simple-astro-api) for self-hosting instructions, and the [Swiss Ephemeris license terms](https://www.astro.com/swisseph/swephinfo_e.htm) for commercial details.
- **Mailerlite (optional)** — only used by `functions/subscribe-email.js` if you deploy the email-subscribe Netlify function.

---

## Contributing

PRs welcome. A few guidelines:

- **Chart content / numerics:** belongs upstream in [chart2txt](https://github.com/simpolism/chart2txt). The chart-text format and its astrological correctness live there.
- **App UX / new features / bug fixes:** go here.
- **Run `npm run type-check` before pushing.** Linting via `npm run lint`.
- **Match the existing code style** — Prettier + ESLint config in repo.
- For larger changes, open an issue first to talk through the approach.

This project is solo-maintained, so review may not be instant. Be patient.

---

## License

chart2ai itself is MIT. See [`LICENSE`](LICENSE).

**Commercial users:** chart2ai depends on the Swiss Ephemeris via [simple-astro-api](https://github.com/simpolism/simple-astro-api). Swiss Ephemeris is free for non-commercial use but requires a paid license for commercial deployments. See the [External dependencies](#external-dependencies) section above.
