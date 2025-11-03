# Delhi Legislative Council Mobile App

A full-stack mobile application for displaying and managing members of the Delhi Legislative Council. The app includes an admin dashboard for managing member data and a public-facing interface for viewing member information.

## Tech Stack

- **Frontend**: React Native (Expo)
- **Backend**: Node.js + Express.js
- **Database**: MongoDB
- **Authentication**: JWT-based
- **UI Library**: React Native Paper

## Project Structure

```
Legislative-Assembly-Data-1/
├── backend/              # Express.js backend API
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   ├── middleware/      # Auth middleware
│   └── scripts/         # Utility scripts
├── mobile/              # React Native mobile app
│   ├── src/
│   │   ├── screens/     # App screens
│   │   └── config/      # Configuration files
│   └── App.js          # Main app component
└── README.md           # This file
```

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- Expo CLI (`npm install -g expo-cli`)
- Android Studio (for building APK)

## Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env` file:**
   ```bash
   cp .env.example .env
   ```
   
   Then edit `.env` and update the values:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/legislative-assembly
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   ADMIN_EMAIL=admin@example.com
   ADMIN_PASSWORD=admin123
   ```

4. **Start MongoDB:**
   - If using local MongoDB, make sure the service is running
   - If using MongoDB Atlas, use your connection string in `MONGODB_URI`

5. **Initialize admin user:**
   ```bash
   node scripts/initAdmin.js
   ```

6. **Start the backend server:**
   ```bash
   npm run dev
   # or
   npm start
   ```

   The server will run on `http://localhost:5000`

## Mobile App Setup

1. **Navigate to mobile directory:**
   ```bash
   cd mobile
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Update API URL:**
   Edit `mobile/src/config/theme.js` and update the `API_URL`:
   ```javascript
   export const API_URL = 'http://YOUR_IP_ADDRESS:5000/api';
   ```
   
   **Important:** Replace `YOUR_IP_ADDRESS` with your computer's local IP address (not `localhost`). You can find it using:
   - Mac/Linux: `ifconfig | grep "inet "`
   - Windows: `ipconfig`
   
   For example: `http://192.168.1.100:5000/api`

4. **Start the Expo development server:**
   ```bash
   npm start
   # or
   expo start
   ```

5. **Run on Android device/emulator:**
   - Press `a` in the terminal to open on Android emulator
   - Or scan the QR code with Expo Go app on your Android device

## Building Android APK

1. **Install EAS CLI (Expo Application Services):**
   ```bash
   npm install -g eas-cli
   ```

2. **Login to Expo:**
   ```bash
   eas login
   ```

3. **Configure EAS Build:**
   ```bash
   eas build:configure
   ```

4. **Build APK:**
   ```bash
   eas build --platform android --profile preview
   ```
   
   This will create a preview APK that you can download and install.

   Alternatively, for a development build:
   ```bash
   eas build --platform android --profile development
   ```

5. **Download the APK:**
   - After the build completes, EAS will provide a download link
   - You can also view builds at: https://expo.dev/accounts/[your-account]/builds

## Alternative: Local APK Build (Expo CLI)

If you want to build locally without EAS:

1. **Install Android build tools:**
   - Install Android Studio
   - Set up Android SDK and environment variables

2. **Build APK:**
   ```bash
   cd mobile
   expo build:android -t apk
   ```

   Note: This method requires more setup and may not work on all systems.

## API Endpoints

### Admin Authentication
- `POST /api/admin/login` - Admin login
  - Body: `{ "email": "admin@example.com", "password": "admin123" }`
  - Returns: `{ "token": "...", "admin": {...} }`

### Members
- `GET /api/members` - Get all members
  - Query params (optional): `?sessionName=Session1&sessionDate=2024-01-15`
- `GET /api/members/filters` - Get unique session names and dates for filters
- `GET /api/members/:id` - Get single member
- `POST /api/members` - Add new member (Admin only, requires auth token)
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ "name": "...", "constituency": "...", "sessionName": "...", "sessionDate": "2024-01-15", "speechGiven": "...", "timeTaken": 10 }`
- `PUT /api/members/:id` - Update member (Admin only)
- `DELETE /api/members/:id` - Delete member (Admin only)

## Features

### Admin Dashboard
- Login with email and password
- Add new members with all required fields
- Edit existing member records
- Delete members
- View all members in a list

### User Home Screen
- View all Legislative Council members
- Filter by Session Name
- Filter by Session Date
- Pull-to-refresh to reload data
- Tap member card to view details

### Member Details Screen
- Display complete member information
- Show speech content
- Display time taken for speech

## Default Admin Credentials

After running `initAdmin.js`, you can login with:
- **Email**: (as set in `.env` file, default: `admin@example.com`)
- **Password**: (as set in `.env` file, default: `admin123`)

**Important:** Change these credentials in production!

## Troubleshooting

### Backend Issues

1. **MongoDB Connection Error:**
   - Ensure MongoDB is running locally, or
   - Update `MONGODB_URI` in `.env` with correct connection string

2. **Port Already in Use:**
   - Change `PORT` in `.env` file
   - Or stop the process using port 5000

### Mobile App Issues

1. **Cannot Connect to Backend:**
   - Ensure backend is running
   - Check that API_URL uses your computer's IP address (not localhost)
   - Ensure both devices are on the same network
   - Check firewall settings

2. **Expo Go App Issues:**
   - Clear Expo Go cache
   - Restart Expo development server

3. **Build Issues:**
   - Ensure all dependencies are installed
   - Check Expo CLI version compatibility
   - Review Expo documentation for latest build requirements

## Production Deployment

### Backend
- Deploy to services like Heroku, Railway, or AWS
- Update MongoDB URI to production database
- Set secure JWT_SECRET
- Enable CORS for your mobile app domain

### Mobile App
- Update API_URL in `theme.js` to production backend URL
- Build production APK using EAS
- Sign the APK for release to Google Play Store

## License

ISC

