# Building for App Store and Google Play

This project uses **Expo** and **EAS Build** to produce store-ready builds.

## Prerequisites

1. **Expo account** – [expo.dev](https://expo.dev) (free).
2. **Apple Developer Program** ($99/year) – for iOS/App Store.
3. **Google Play Developer** ($25 one-time) – for Android.

## 1. Install EAS CLI

```bash
npm install -g eas-cli
```

## 2. Log in to Expo

```bash
eas login
```

## 3. Configure the project (first time only)

```bash
cd Mood_Mobile
eas build:configure
```

This links the project to your Expo account and ensures `eas.json` is used.

## 4. Build for stores

### iOS (App Store)

You need an [Apple Developer account](https://developer.apple.com/account) (Apple Developer Program, $99/year).

```bash
eas build --platform ios --profile production
```

- **First run:** EAS will ask you to sign in with your **Apple ID** (the one tied to your [developer.apple.com](https://developer.apple.com/account) membership). It can then create or use:
  - A distribution certificate
  - A provisioning profile
  - An app in [App Store Connect](https://appstoreconnect.apple.com) (if you don’t have one yet)
- **Output:** An `.ipa` file and a link to download it. You can also submit from the [Expo dashboard](https://expo.dev).

### Android (Google Play)

```bash
eas build --platform android --profile production
```

- First run: EAS will generate a keystore (or use yours) for signing.
- Output: `.aab` (Android App Bundle) for upload to Google Play Console.

### Both platforms

```bash
eas build --platform all --profile production
```

## 5. Submit to stores (optional)

After a build finishes, you can submit from the [Expo dashboard](https://expo.dev) or via CLI:

```bash
# Submit latest production iOS build
eas submit --platform ios --profile production --latest

# Submit latest production Android build
eas submit --platform android --profile production --latest
```

Fill in `eas.json` → `submit.production` with your Apple ID, App Store Connect App ID, and (for Android) service account key path if you use one.

## 6. App icon

The app icon is set to `./assets/apple-touch-icon.png` in `app.json` (used for both iOS and Android). Replace that file to change the icon, then run a new build.

## Build profiles (in `eas.json`)

- **development** – for development clients.
- **preview** – internal testing (APK for Android, ad-hoc/simulator for iOS).
- **production** – store builds (AAB for Android, IPA for iOS).

## Useful links

- [EAS Build docs](https://docs.expo.dev/build/introduction/)
- [EAS Submit docs](https://docs.expo.dev/submit/introduction/)
- [Expo dashboard](https://expo.dev) – view builds and submit.
