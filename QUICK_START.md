# Quick Start Guide

## 1. Backend Setup (5 minutes)

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and credentials
node scripts/initAdmin.js
npm run dev
```

Backend will run on `http://localhost:5000`

## 2. Mobile App Setup (5 minutes)

```bash
cd mobile
npm install
```

Edit `mobile/src/config/theme.js` and update API_URL:
```javascript
export const API_URL = 'http://YOUR_COMPUTER_IP:5000/api';
```

Find your IP:
- Mac/Linux: `ifconfig | grep "inet " | grep -v 127.0.0.1`
- Windows: `ipconfig` (look for IPv4 Address)

## 3. Run Mobile App

```bash
cd mobile
npm start
```

Press `a` for Android or scan QR code with Expo Go app.

## 4. Test the App

1. **Login as Admin:**
   - Tap login icon (top right)
   - Use credentials from `.env` file (default: `admin@example.com` / `admin123`)

2. **Add Members:**
   - In Admin Dashboard, tap `+` button
   - Fill all fields and save

3. **View Members:**
   - Logout to return to home screen
   - View all members
   - Use filters to filter by session name/date
   - Tap a member card to see details

## 5. Build APK

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --platform android --profile preview
```

Download APK from the provided link.

## Troubleshooting

- **Backend won't start:** Check MongoDB is running
- **Can't connect from phone:** Use computer IP, not localhost
- **Build fails:** Check Expo documentation for latest requirements

