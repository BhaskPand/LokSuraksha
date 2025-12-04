# Complete Step-by-Step Guide to Run Citizen Safety Ecosystem

This guide will walk you through running the entire application from scratch.

## 📋 Prerequisites Check

First, verify you have the required tools installed:

```bash
# Check Node.js version (should be 18 or higher)
node --version

# Check npm version (should be 9 or higher)
npm --version
```

**If Node.js is not installed:**
- Download from: https://nodejs.org/
- Install version 18 or higher

**For Mobile Development (Optional but Recommended):**
- **iOS**: Install Xcode from Mac App Store (macOS only)
- **Android**: Install Android Studio and set up an emulator
- **Physical Device**: Install Expo Go app from App Store/Play Store

---

## Step 1: Navigate to Project Directory

```bash
cd /Users/apple/Citizen_safty
```

Verify you're in the right directory:
```bash
ls
# You should see: backend/, web/, mobile/, shared/, package.json, README.md, etc.
```

---

## Step 2: Install All Dependencies

This will install dependencies for all workspaces (backend, web, mobile, shared):

```bash
npm install
```

**Expected output:** This may take 2-5 minutes. You'll see packages being installed for all workspaces.

**If you encounter errors:**
- Make sure you have Node.js 18+ installed
- Try deleting `node_modules` folders and `package-lock.json`, then run `npm install` again

---

## Step 3: Set Up Environment Variables

### Option A: Use the Setup Script (Recommended)

```bash
# Make the script executable
chmod +x scripts/setup.sh

# Run the setup script
./scripts/setup.sh
```

This will:
- Create `backend/.env` from `backend/env.example`
- Create `web/.env` from `web/env.example`
- Initialize the database

### Option B: Manual Setup

**Backend Environment (`backend/.env`):**
```bash
# Copy the example file
cp backend/env.example backend/.env

# Edit the file (use any text editor)
nano backend/.env
# or
open -e backend/.env
```

Set these values:
```
PORT=3001
NODE_ENV=development
ADMIN_TOKEN=my-secret-admin-token-12345
DATABASE_PATH=./data/citizen_safety.db
CORS_ORIGIN=http://localhost:5173,exp://localhost:8081
```

**Important:** Change `ADMIN_TOKEN` to a secure random string (you'll need this for admin features).

**Web Environment (`web/.env`):**
```bash
# Copy the example file
cp web/env.example web/.env

# Edit if needed (defaults are usually fine)
nano web/.env
```

Default content:
```
VITE_API_BASE_URL=http://localhost:3001
VITE_ADMIN_TOKEN=my-secret-admin-token-12345
```

**Important:** Use the same `ADMIN_TOKEN` value as in `backend/.env`.

**Mobile Configuration (`mobile/app.json`):**
The mobile app is already configured. For physical devices, you may need to update the API URL later.

---

## Step 4: Initialize the Database

```bash
npm run migrate --workspace=backend
```

**Expected output:**
```
Running database migrations...
Database migrations completed successfully!
```

**Optional: Seed with sample data:**
```bash
npm run seed --workspace=backend
```

This adds 2 sample issues to help you test the application.

---

## Step 5: Start the Backend Server

**Open Terminal 1** (keep this running):

```bash
cd /Users/apple/Citizen_safty
npm run dev:backend
```

**Expected output:**
```
🚀 Backend server running on http://localhost:3001
📊 Database: ./data/citizen_safety.db
```

**✅ Success indicators:**
- You see the "Backend server running" message
- No error messages
- The terminal stays active (don't close it)

**Test the backend:**
Open a new terminal and run:
```bash
curl http://localhost:3001/api/ping
```

You should see: `{"ok":true}`

---

## Step 6: Start the Web Application

**Open Terminal 2** (keep this running):

```bash
cd /Users/apple/Citizen_safty
npm run dev:web
```

**Expected output:**
```
  VITE v5.0.8  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

**✅ Success indicators:**
- You see the Vite server URL
- No error messages
- The terminal stays active

**Access the web app:**
1. Open your web browser
2. Go to: **http://localhost:5173**
3. You should see the "Citizen Safety Dashboard" with a header and issue list

---

## Step 7: Start the Mobile Application

**Open Terminal 3** (keep this running):

```bash
cd /Users/apple/Citizen_safty
npm run dev:mobile
```

**Expected output:**
```
› Metro waiting on exp://192.168.x.x:8081
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)

› Press a │ open Android
› Press i │ open iOS simulator
› Press w │ open web

› Press r │ reload app
› Press m │ toggle menu
```

### Option A: Run on iOS Simulator (macOS only)

1. Press `i` in the terminal
2. Wait for the simulator to open (first time may take a minute)
3. The app will automatically load

### Option B: Run on Android Emulator

1. Make sure Android Studio is running with an emulator started
2. Press `a` in the terminal
3. Wait for the app to load in the emulator

### Option C: Run on Physical Device

1. **Install Expo Go** on your phone:
   - iOS: App Store → Search "Expo Go"
   - Android: Play Store → Search "Expo Go"

2. **Connect to the same WiFi** as your computer

3. **Scan the QR code**:
   - iOS: Use the Camera app to scan the QR code
   - Android: Use the Expo Go app to scan the QR code

4. **If connection fails**, you may need to:
   - Update `mobile/app.json` with your computer's IP address
   - Find your IP: `ifconfig | grep "inet "` (macOS/Linux) or `ipconfig` (Windows)
   - Update: `"apiBaseUrl": "http://YOUR_IP_ADDRESS:3001"`

---

## Step 8: Verify Everything is Working

### Test Backend API

```bash
# Test ping endpoint
curl http://localhost:3001/api/ping
# Should return: {"ok":true}

# Test issues endpoint
curl http://localhost:3001/api/issues
# Should return JSON with issues array
```

### Test Web App

1. Open **http://localhost:5173** in your browser
2. You should see:
   - Header: "Citizen Safety Dashboard"
   - Filter bar with category buttons
   - Analytics charts (if you seeded data)
   - List of issues (or empty state)
3. Click on an issue card to see the detail view
4. Try filtering by category
5. Try the search box

### Test Mobile App

1. The app should show the "Report Issue" screen
2. Fill out the form:
   - Enter a title
   - Enter a description
   - Select a category
   - Add a photo (camera or gallery)
   - Location should auto-populate
   - Optionally add contact info
3. Tap "Submit Report"
4. You should see the success screen with the issue ID

### Test Admin Features (Web)

1. In the web app, click on an issue to view details
2. If you set `VITE_ADMIN_TOKEN` in `web/.env`, you'll see "Admin Controls" section
3. You can:
   - Change status (open → in_progress → resolved)
   - Add notes
   - Click "Update Issue"

---

## 🎯 Quick Access Summary

| Component | URL/Command | Status Check |
|-----------|------------|--------------|
| **Backend API** | http://localhost:3001 | `curl http://localhost:3001/api/ping` |
| **Web Dashboard** | http://localhost:5173 | Open in browser |
| **Mobile App** | Expo Dev Server | Check terminal for QR code |
| **API Docs** | See `api-spec.md` | - |

---

## 🔧 Troubleshooting

### Backend won't start

**Problem:** Port 3001 is already in use
```bash
# Find what's using port 3001
lsof -i :3001

# Kill the process or change PORT in backend/.env
```

**Problem:** Database errors
```bash
# Delete and recreate database
rm -rf data/
npm run migrate --workspace=backend
```

### Web app can't connect to backend

**Problem:** CORS errors or connection refused
- Make sure backend is running (Terminal 1)
- Check `VITE_API_BASE_URL` in `web/.env` matches backend URL
- Verify backend CORS settings in `backend/.env`

### Mobile app can't connect

**Problem:** Network request failed
- For physical device: Update `mobile/app.json` with your computer's IP
- Make sure phone and computer are on same WiFi
- Try tunnel mode: In Expo terminal, press `s` then select "tunnel"

**Problem:** Expo Go can't load
- Make sure Expo CLI is installed: `npm install -g expo-cli`
- Clear Expo cache: `expo start -c`

### Images not showing

**Problem:** Images appear broken
- Check browser console for errors
- Verify image data is being saved correctly
- For mobile: Check camera/photo permissions

---

## 📱 Running on Physical Device (Detailed)

### Step 1: Find Your Computer's IP Address

**macOS/Linux:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**Windows:**
```bash
ipconfig
```

Look for something like: `192.168.1.100` or `10.0.0.5`

### Step 2: Update Mobile Configuration

Edit `mobile/app.json`:
```json
{
  "extra": {
    "apiBaseUrl": "http://192.168.1.100:3001"
  }
}
```

Replace `192.168.1.100` with your actual IP address.

### Step 3: Restart Mobile App

1. Stop the mobile dev server (Ctrl+C)
2. Restart: `npm run dev:mobile`
3. Scan QR code again

---

## 🚀 Next Steps

Once everything is running:

1. **Create a real issue** from the mobile app
2. **View it** in the web dashboard
3. **Update its status** as an admin
4. **Export data** as CSV (admin feature)
5. **Test offline mode** by turning off WiFi on mobile device

---

## 📞 Quick Commands Reference

```bash
# Start all services (if you have concurrently installed)
npm run dev:all

# Run tests
npm test --workspace=backend

# Build for production
npm run build:backend
npm run build:web

# Database operations
npm run migrate --workspace=backend  # Initialize/update DB
npm run seed --workspace=backend     # Add sample data
```

---

## ✅ Success Checklist

- [ ] Backend running on http://localhost:3001
- [ ] Web app accessible at http://localhost:5173
- [ ] Mobile app running in simulator/device
- [ ] Can create issue from mobile app
- [ ] Can view issues in web dashboard
- [ ] Admin features work (if token set)
- [ ] Images upload and display correctly
- [ ] Offline queue works (test by turning off network)

---

**🎉 Congratulations! Your Citizen Safety Ecosystem is now running!**

For more details, see:
- `README.md` - Full documentation
- `api-spec.md` - API reference
- `QUICKSTART.md` - Quick reference




