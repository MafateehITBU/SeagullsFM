# Fonts (same as website – moodfm-web)

Fonts here match the website so the app and site look consistent.

## Loaded in the app (see `src/App.js`)

- **Fractul** – `fractual/fonnts.com-fractul-regular.otf` (titles/headings)
- **Fractul-Bold** – `fractual/fonnts.com-fractul-bold.otf` (bold headings)
- **Gobold** – `gobold/Gobold-Regular.otf` (body text)
- **Gobold-Bold** – `gobold/Gobold-Bold.otf` (bold body)
- **GoboldThinLight** – `gobold/Gobold Thin.otf` (optional)
- **GoboldLowplus** – `gobold/Gobold Lowplus.otf` (optional)

## Copying from the website project

To sync with the web app fonts:

1. From `moodfm-web/src/assets/fonts/` copy:
   - `fonnts.com-fractul-regular.otf` and `fonnts.com-fractul-bold.otf` → `Mood_Mobile/assets/fonts/fractual/`
2. Gobold files are already in `Mood_Mobile/assets/fonts/gobold/` (e.g. `Gobold-Regular.otf`, `Gobold-Bold.otf`, `Gobold Thin.otf`, `Gobold Lowplus.otf`).

## Usage in code

```javascript
import { fonts } from '../theme/fonts';

// Titles / headings
fontFamily: fonts.primary,      // Fractul
fontFamily: fonts.primaryBold,  // Fractul-Bold

// Body
fontFamily: fonts.secondary,     // Gobold
fontFamily: fonts.secondaryBold, // Gobold-Bold
```
