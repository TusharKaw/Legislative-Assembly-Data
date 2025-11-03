# Assets Required

The mobile app requires the following asset files. You can use placeholder images for development or create custom assets for production.

## Required Assets

Create these files in the `mobile/assets/` directory:

1. **icon.png** (1024x1024)
   - App icon for iOS/Android
   - Should be square with rounded corners (handled by platform)

2. **splash.png** (1242x2436 recommended)
   - Splash screen image
   - Shown when app is launching

3. **adaptive-icon.png** (1024x1024)
   - Android adaptive icon foreground
   - Transparent background preferred

4. **favicon.png** (48x48)
   - Web favicon (optional, for web builds)

## Quick Solution

For development, you can:
1. Use online tools to generate placeholder icons
2. Use Expo's default assets temporarily
3. Create simple colored squares with text

For production:
- Use professional design tools (Figma, Adobe XD, etc.)
- Follow platform-specific guidelines:
  - iOS: https://developer.apple.com/design/human-interface-guidelines/
  - Android: https://developer.android.com/guide/practices/ui_guidelines/icon_design

## Generate Placeholder Assets

You can use Expo's asset generator:
```bash
cd mobile
npx expo-asset-cli
```

Or create simple placeholders manually with any image editor.

