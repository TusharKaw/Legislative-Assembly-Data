# How to Access Your Mobile App

## Option 1: View in Browser (Recommended for Quick Testing)

Since Expo dev tools aren't opening automatically, try these steps:

1. **Check your terminal** where Expo is running - you should see:
   - A QR code
   - URLs like: `exp://192.168.1.6:8081` or `http://localhost:8081`

2. **Open Metro Bundler directly:**
   ```
   http://localhost:8081
   ```

3. **Or open Expo Dev Tools manually:**
   ```
   http://localhost:19006
   ```

## Option 2: Use Expo Go App on Your Phone

1. **Install Expo Go** from Google Play Store (Android)

2. **Make sure your phone and computer are on the same WiFi**

3. **From the terminal where Expo is running:**
   - Look for the QR code
   - Open Expo Go app
   - Tap "Scan QR code"
   - Scan the code from your terminal

4. **Or enter the URL manually:**
   - In Expo Go, tap "Enter URL manually"
   - Type: `exp://192.168.1.6:8081`

## Option 3: Android Emulator

1. **Start Android Studio Emulator** or have an emulator running

2. **In the terminal where Expo is running, press:**
   ```
   a
   ```
   (This opens the app in the Android emulator)

## Option 4: Open Web Version

1. **In the terminal where Expo is running, press:**
   ```
   w
   ```
   (This opens the app in your web browser)

## Current Setup

- **Backend**: http://localhost:5000 ✅ Running
- **MongoDB**: ✅ Running  
- **Mobile API**: http://192.168.1.6:5000/api ✅ Configured
- **Expo**: Should be showing in terminal

## Quick Fix: Restart Expo

If nothing is showing, stop and restart Expo:

```bash
# Stop Expo
pkill -f expo

# Restart
cd mobile
npm start

# Then press:
# - 'w' for web browser
# - 'a' for Android emulator  
# - Scan QR code for phone
```

