# Font Loading Troubleshooting

## Current Font Structure:
- `assets/fonts/fractual/fonnts.com-fractul-regular.otf`
- `assets/fonts/gobold/Gobold Regular.otf`
- `assets/fonts/gobold/Gobold Bold.otf`

## If fonts still don't load:

### Option 1: Restart Metro Bundler
```bash
# Stop Expo (Ctrl+C)
npx expo start --clear
```

### Option 2: Rename files to remove spaces
If files with spaces cause issues, you can rename:
- `Gobold Regular.otf` → `Gobold-Regular.otf`
- `Gobold Bold.otf` → `Gobold-Bold.otf`

Then update `App.js` paths accordingly.

### Option 3: Move fonts to root assets folder
Move font files directly to `assets/fonts/` (not in subfolders) and update paths in `App.js`.

### Option 4: Check Metro cache
```bash
# Clear Metro cache
rm -rf node_modules/.cache
npx expo start --clear
```

## Verify fonts are loading:
Check the console logs when the app starts. You should see:
- "✅ Fonts loaded successfully" if fonts load
- Warning messages if there are issues
