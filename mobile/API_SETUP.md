# API Setup Guide - Fixing Network Request Failed

## Problem
If you're getting "Network request failed" when trying to sign up or login, it's because the mobile app can't reach `localhost:3001` from a physical device or sometimes from a simulator.

## Solution: Use Your Computer's IP Address

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

### Step 2: Update app.json

Edit `mobile/app.json` and update the `apiBaseUrl`:

```json
{
  "extra": {
    "apiBaseUrl": "http://192.168.1.100:3001"
  }
}
```

Replace `192.168.1.100` with YOUR actual IP address.

### Step 3: Restart Expo

After updating `app.json`:
1. Stop the Expo dev server (Ctrl+C)
2. Restart it: `npm run dev:mobile`
3. Reload the app (press `r` in the terminal or shake device)

### Step 4: Verify Backend is Running

Make sure your backend is running:
```bash
npm run dev:backend
```

Test it:
```bash
curl http://localhost:3001/api/ping
# Should return: {"ok":true}
```

### Step 5: Test from Mobile

Try the API URL from your phone's browser:
- Open browser on your phone
- Go to: `http://YOUR_IP:3001/api/ping`
- Should see: `{"ok":true}`

## Alternative: Use Expo Tunnel

If you can't use your local IP:

1. In Expo terminal, press `s` to open settings
2. Select "tunnel" connection type
3. This creates a public URL that works from anywhere

## Troubleshooting

### Still getting network errors?

1. **Check firewall**: Make sure port 3001 is not blocked
2. **Same WiFi**: Phone and computer must be on same network
3. **Backend running**: Verify backend is actually running
4. **Check console**: Look at Expo terminal for error messages
5. **Test API**: Try `curl http://YOUR_IP:3001/api/ping` from terminal

### For iOS Simulator
- `localhost:3001` should work
- If not, use `127.0.0.1:3001`

### For Android Emulator
- Use `10.0.2.2:3001` instead of `localhost:3001`

## Quick Fix Script

Run this to automatically update app.json with your IP:

```bash
# macOS/Linux
IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | head -1 | awk '{print $2}')
sed -i '' "s|http://localhost:3001|http://$IP:3001|g" mobile/app.json
echo "Updated app.json with IP: $IP"
```

