# Quick Fix: Network Connection Error

## Problem
"Network request failed" or "Cannot connect to server" error when signing up/login.

## Solution Steps

### Step 1: Restart Backend Server
The backend needs to be restarted to listen on all network interfaces:

```bash
# Stop the current backend (Ctrl+C)
# Then restart:
npm run dev:backend
```

You should see:
```
🚀 Backend server running on http://localhost:3001
🌐 Network access: http://192.168.14.55:3001
```

### Step 2: Restart Expo/Mobile App
The mobile app needs to reload to pick up the new app.json settings:

1. **Stop Expo** (Ctrl+C in the terminal)
2. **Clear cache and restart:**
   ```bash
   cd mobile
   npx expo start --clear
   ```
3. **Reload the app:**
   - Press `r` in the Expo terminal, OR
   - Shake your device and tap "Reload"

### Step 3: Verify Connection

**Test from your phone's browser:**
1. Open browser on your phone
2. Go to: `http://192.168.14.55:3001/api/ping`
3. Should see: `{"ok":true}`

If this works, the mobile app should also work.

### Step 4: Check These Things

1. **Same WiFi Network**: Phone and computer must be on same WiFi
2. **Firewall**: Make sure port 3001 is not blocked
3. **Backend Running**: Check terminal shows "Backend server running"
4. **IP Address**: Current IP is `192.168.14.55` (if it changes, update app.json)

## If Still Not Working

### Option 1: Use Expo Tunnel
1. In Expo terminal, press `s`
2. Select "tunnel"
3. This creates a public URL that works from anywhere

### Option 2: Check Your IP Again
```bash
# macOS/Linux
ifconfig | grep "inet " | grep -v 127.0.0.1

# Windows
ipconfig
```

Update `mobile/app.json` with the new IP if it changed.

### Option 3: For iOS Simulator
If using iOS Simulator, you can use:
```json
"apiBaseUrl": "http://localhost:3001"
```

### Option 4: For Android Emulator
If using Android Emulator, use:
```json
"apiBaseUrl": "http://10.0.2.2:3001"
```

## Current Configuration

- **Your IP**: `192.168.14.55`
- **Backend Port**: `3001`
- **API URL**: `http://192.168.14.55:3001`
- **app.json**: Already configured ✅

## Test Commands

```bash
# Test backend locally
curl http://localhost:3001/api/ping

# Test backend from network
curl http://192.168.14.55:3001/api/ping

# Both should return: {"ok":true}
```

After restarting both backend and mobile app, try signing up again!

