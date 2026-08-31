# Quick Setup Instructions

## Fixing the Current Issues

You're seeing errors because:
1. The global `expo-cli` is deprecated and doesn't work with Node 17+
2. Some package versions don't match Expo SDK 52 requirements

## Solution

1. **Remove the global expo-cli (if installed):**
   ```bash
   npm uninstall -g expo-cli
   ```

2. **Navigate to the project:**
   ```bash
   cd Mood_mobile
   ```

3. **Install/update dependencies:**
   ```bash
   npm install
   ```

4. **Fix dependency versions automatically:**
   ```bash
   npx expo install --fix
   ```
   This command will automatically install the correct versions that match Expo SDK 52.

5. **Start the development server:**
   ```bash
   npx expo start
   # or
   npm start
   ```

6. **Run on device/simulator:**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app on physical device

## Alternative: Manual Version Fix

If `expo install --fix` doesn't work, you can manually install the correct versions:

```bash
npx expo install react-native@0.76.9
npx expo install react-native-safe-area-context@4.12.0
npx expo install react-native-screens@~4.4.0
```

## Notes

- Always use `npx expo` instead of the global `expo` command
- The `expo install` command ensures you get versions compatible with your Expo SDK
- If you still see errors, try deleting `node_modules` and `package-lock.json`, then run `npm install` again
