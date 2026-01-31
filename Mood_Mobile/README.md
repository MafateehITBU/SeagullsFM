## Mood_mobile - Expo React Native App

This folder contains the **mobile frontend (iOS & Android)** for the SeagullsFM project, built with **Expo** and **React Native**.

### Tech Stack
- **Expo** - Development platform and tooling
- **React Native** (iOS & Android)
- **React Navigation** for routing

### Project Structure
- `package.json` – dependencies and scripts
- `app.json` – Expo configuration
- `index.js` – application entry point
- `src/`
  - `App.js` – main application component
  - `screens/` – screen components (e.g. `HomeScreen`)
  - `navigation/` – navigation setup
  - `config/` – API config and environment settings
  - `theme/` – shared colors, spacing, typography
  - `components/` – reusable UI components

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Expo CLI (installed globally or via npx)
- For iOS: Xcode (macOS only)
- For Android: Android Studio

### Getting Started

1. **Install dependencies:**
   ```bash
   cd Mood_mobile
   npm install
   # or
   yarn install
   ```

2. **Fix dependency versions (if needed):**
   ```bash
   npx expo install --fix
   # This will install compatible versions for Expo SDK 52
   ```

2. **Start the Expo development server:**
   ```bash
   npm start
   # or use npx to use the local Expo CLI (recommended)
   npx expo start
   ```
   
   > **Important:** Use `npx expo` instead of the global `expo` command. The global expo-cli is deprecated.

3. **Run on your device/simulator:**
   - **iOS Simulator** (macOS only):
     ```bash
     npm run ios
     # or press 'i' in the Expo CLI
     ```
   - **Android Emulator**:
     ```bash
     npm run android
     # or press 'a' in the Expo CLI
     ```
   - **Physical Device**:
     - Install Expo Go app from App Store (iOS) or Play Store (Android)
     - Scan the QR code shown in the terminal/browser

4. **Web (optional):**
   ```bash
   npm run web
   # or press 'w' in the Expo CLI
   ```

### Backend Connection
- Default API base URL is configured in `src/config/api.js`
- Update this to point to your backend instance:
  - Development: `http://localhost:5000/api` (use your computer's IP for physical devices)
  - Production: Your production API URL

### Development Tips
- Use Expo Go app for quick testing on physical devices
- For custom native modules, you may need to create a development build
- Hot reloading is enabled by default
- Check Expo documentation for adding native modules: https://docs.expo.dev/

### Building for Production
- **iOS:** Use `expo build:ios` or EAS Build
- **Android:** Use `expo build:android` or EAS Build
- See Expo documentation for detailed build instructions

