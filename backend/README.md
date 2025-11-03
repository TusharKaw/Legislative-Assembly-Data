# Backend API - Delhi Legislative Council

Express.js backend API for the Legislative Assembly mobile app.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env` file (copy from `.env.example`):
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/legislative-assembly
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   ADMIN_EMAIL=admin@example.com
   ADMIN_PASSWORD=admin123
   ```

3. Initialize admin user:
   ```bash
   node scripts/initAdmin.js
   ```

4. Start server:
   ```bash
   npm run dev  # Development mode with nodemon
   # or
   npm start    # Production mode
   ```

## API Documentation

See main README.md for endpoint details.

