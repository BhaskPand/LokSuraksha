# Quick Start Guide

Get the Citizen Safety Ecosystem running in 5 minutes!

## Prerequisites Check

```bash
node --version  # Should be 18+
npm --version   # Should be 9+
```

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Setup Environment

```bash
# Run the setup script
chmod +x scripts/setup.sh
./scripts/setup.sh

# OR manually:
cp backend/env.example backend/.env
cp web/env.example web/.env
# Edit backend/.env and set ADMIN_TOKEN
```

## Step 3: Initialize Database

```bash
npm run migrate --workspace=backend
```

## Step 4: Start Everything

Open **3 terminal windows**:

**Terminal 1 - Backend:**
```bash
npm run dev:backend
```
✅ Backend running on http://localhost:3001

**Terminal 2 - Web:**
```bash
npm run dev:web
```
✅ Web app running on http://localhost:5173

**Terminal 3 - Mobile:**
```bash
npm run dev:mobile
```
Then press:
- `i` for iOS simulator
- `a` for Android emulator
- Scan QR code with Expo Go app

## Step 5: Test It!

1. **Web Dashboard**: Open http://localhost:5173
   - View issues list
   - Click an issue to see details
   - Filter by category

2. **Mobile App**: 
   - Fill out the report form
   - Add a photo
   - Submit the report
   - See success screen

3. **Backend API**: 
   ```bash
   curl http://localhost:3001/api/ping
   # Should return: {"ok":true}
   ```

## Troubleshooting

**Backend won't start?**
- Check if port 3001 is free: `lsof -i :3001`
- Verify `.env` file exists in `backend/`

**Web can't connect?**
- Check `VITE_API_BASE_URL` in `web/.env`
- Make sure backend is running

**Mobile can't connect?**
- For physical device: Update `app.json` with your computer's IP
- Example: `"apiBaseUrl": "http://192.168.1.100:3001"`

## Next Steps

- Read the full [README.md](./README.md) for detailed documentation
- Check [api-spec.md](./api-spec.md) for API details
- Run tests: `npm test --workspace=backend`

Happy coding! 🚀

