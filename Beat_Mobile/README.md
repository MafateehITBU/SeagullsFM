# Beat FM Mobile

Expo React Native app for Beat FM, mirroring the **beat-web** design and the **Mood_Mobile** app structure.

## Setup

```bash
cd Beat_Mobile
npm install
npm start
```

## Features

- Dark Beat FM branding (`#0c0c0c`, pink/blue listen button)
- Home: hero, live stream, programs carousel, download band
- Navigation drawer with all beat-web routes
- Animated splash, screen entrances, and Coming Soon pages
- Shared backend API (`https://mood.fm/api`) filtered for `BeatFM` channel
- Live stream: `https://securestreams2.autopo.st:1242/live`

## Screens

| Screen | Status |
|--------|--------|
| Home | Full Beat web design |
| About, News, Presenters, Login, Sign Up, Profile, Get Discovered, Show Your Talent, Program Detail | Ported from Mood with Beat theme |
| Programs, Events, Broadcaster | Coming Soon (matches beat-web) |

## Fonts

Gotham + Museo copied from `beat-web`.
