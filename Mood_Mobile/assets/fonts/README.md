# Fonts Directory

Place your custom font files here:

## Required Fonts:

### Fractul (Primary - for titles)
- `Fractul-Regular.ttf`
- `Fractul-Bold.ttf`
- (Optional: Fractul-Medium.ttf, Fractul-SemiBold.ttf, etc.)

### Gobold (Secondary - for body text)
- `Gobold-Regular.ttf`
- `Gobold-Bold.ttf`
- (Optional: Gobold-Medium.ttf, Gobold-SemiBold.ttf, etc.)

## How to Add Fonts:

1. Download the font files (.ttf or .otf format)
2. Place them in this `assets/fonts/` directory
3. Update `app.json` if you add additional font weights
4. The fonts will be automatically loaded when the app starts

## Font Usage:

Import fonts in your components:
```javascript
import { fonts } from '../theme/fonts';

// Use in styles:
fontFamily: fonts.primary, // For titles
fontFamily: fonts.secondary, // For body text
```
