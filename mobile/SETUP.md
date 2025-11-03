# Mobile App Setup Guide

## Quick Start

1. **Install dependencies:**
   ```bash
   cd mobile
   npm install
   ```

2. **Update API URL:**
   - Edit `src/config/theme.js`
   - Replace `localhost` with your computer's IP address
   - Example: `http://192.168.1.100:5000/api`

3. **Start the app:**
   ```bash
   npm start
   # or
   expo start
   ```

4. **Run on Android:**
   - Press `a` in terminal for Android emulator
   - Or scan QR code with Expo Go app

## Building APK

### Option 1: EAS Build (Recommended)

1. Install EAS CLI:
   ```bash
   npm install -g eas-cli
   ```

2. Login:
   ```bash
   eas login
   ```

3. Configure:
   ```bash
   eas build:configure
   ```

4. Build APK:
   ```bash
   eas build --platform android --profile preview
   ```

5. Download from the provided link

### Option 2: Local Build

1. Install Android Studio and SDK
2. Set up environment variables
3. Run:
   ```bash
   expo build:android -t apk
   ```

## Troubleshooting

- **Connection issues:** Ensure backend is running and IP address is correct
- **Build errors:** Check Expo documentation for latest requirements
- **Dependencies:** Delete `node_modules` and run `npm install` again

