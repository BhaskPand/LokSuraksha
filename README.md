# LokSuraksha Ecosystem

A complete mono-repo project for reporting and managing public safety issues. Includes a web dashboard, mobile app, and backend API.

## 🎯 Project Overview

Citizen Safety is a platform that allows citizens to quickly report public issues (potholes, broken infrastructure, safety concerns, etc.) with photos, GPS location, and optional contact information. The web app provides an admin dashboard for managing and tracking these reports.

### Demo Flow

1. **Mobile App**: User opens app → Takes photo → Adds description → Selects category → GPS location captured → Submits report
2. **Backend API**: Receives report → Validates data → Stores in SQLite database → Returns issue ID
3. **Web Dashboard**: Admin views all issues → Filters by category → Updates status → Exports data

## 🛠 Tech Stack

### Backend
- **Node.js** + **Express** + **TypeScript**
- **SQLite** (better-sqlite3) for persistence
- RESTful API with admin authentication

### Web App
- **React** + **Vite** + **TypeScript**
- **Chart.js** for analytics
- Responsive design with muted color palette

### Mobile App
- **Expo** + **React Native** + **TypeScript**
- Camera and location permissions
- Offline queue support with AsyncStorage

### Shared
- Common TypeScript types and API client
- Workspace-based mono-repo structure

## 📁 Project Structure

```
citizen-safety-ecosystem/
├── backend/          # Express API server
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── models/
│   │   ├── db/
│   │   └── middleware/
│   ├── migrations/
│   └── Dockerfile
├── web/              # React web dashboard
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   └── api/
│   └── vite.config.ts
├── mobile/           # Expo mobile app
│   ├── screens/
│   ├── components/
│   ├── utils/
│   └── app.json
├── shared/           # Shared types and utilities
│   └── src/
│       ├── types.ts
│       └── api-client.ts
├── tests/            # Backend tests
└── docs/             # Documentation and screenshots
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm 9+
- **Expo CLI** (for mobile): `npm install -g expo-cli`
- For mobile development: iOS Simulator (macOS) or Android Studio

### Installation

1. **Clone and install dependencies:**

```bash
cd citizen-safety-ecosystem
npm install
```

This will install dependencies for all workspaces (backend, web, mobile, shared).

2. **Set up environment variables:**

**Option A: Use setup script (recommended):**
```bash
chmod +x scripts/setup.sh
./scripts/setup.sh
```

**Option B: Manual setup:**

**Backend** (`backend/.env`):
```bash
cp backend/env.example backend/.env
# Edit backend/.env with your values
```

Required variables:
- `PORT=3001` (backend port)
- `ADMIN_TOKEN=your-secret-admin-token` (for admin endpoints)
- `DATABASE_PATH=./data/citizen_safety.db` (SQLite database path)
- `CORS_ORIGIN=http://localhost:5173,exp://localhost:8081` (allowed origins)

**Web** (`web/.env`):
```bash
cp web/env.example web/.env
# Edit web/.env with your values
```

Variables:
- `VITE_API_BASE_URL=http://localhost:3001`
- `VITE_ADMIN_TOKEN=your-secret-admin-token` (Optional, for admin features)

**Mobile** (`mobile/app.json` extra or environment):
Update `app.json`:
```json
{
  "extra": {
    "apiBaseUrl": "http://localhost:3001"
  }
}
```

For physical devices, use your computer's IP address instead of `localhost`.

3. **Initialize database:**

```bash
npm run migrate --workspace=backend
```

Optionally seed with sample data:
```bash
npm run seed --workspace=backend
```

### Running Locally

You'll need **three terminal windows**:

**Terminal 1 - Backend:**
```bash
npm run dev:backend
```
Backend runs on http://localhost:3001

**Terminal 2 - Web:**
```bash
npm run dev:web
```
Web app runs on http://localhost:5173

**Terminal 3 - Mobile:**
```bash
npm run dev:mobile
```
Then:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app on physical device

### Using Concurrently (Optional)

Install `concurrently` globally and use:
```bash
npm run dev:all
```

## 📱 Mobile App Setup

### Running on Physical Device

1. **Install Expo Go** app on your phone (iOS App Store or Google Play)

2. **Start the mobile app:**
```bash
cd mobile
npm start
```

3. **Choose connection method:**
   - **Tunnel** (recommended for testing): Works anywhere, slower
   - **LAN**: Faster, requires same WiFi network
   - **Local**: Only works on same machine

4. **Scan QR code** with Expo Go app

5. **Update API URL** in `mobile/app.json` or `.env`:
   - For LAN: Use your computer's local IP (e.g., `http://192.168.1.100:3001`)
   - For tunnel: Use the tunnel URL provided by Expo

### Permissions

The app will request:
- **Camera**: For taking photos
- **Photo Library**: For selecting images
- **Location**: For GPS coordinates

## 🧪 Testing

Run backend tests:
```bash
npm test --workspace=backend
```

Tests use Jest + Supertest and cover:
- Health check endpoint
- Issue creation
- Input validation

## 🏗 Building

### Backend
```bash
npm run build:backend
npm start --workspace=backend
```

### Web
```bash
npm run build:web
npm run preview --workspace=web
```

### Mobile
```bash
cd mobile
expo build:android  # or expo build:ios
```

Or use EAS Build:
```bash
eas build --platform android
eas build --platform ios
```

## 🐳 Docker

### Backend Only

```bash
docker build -t citizen-safety-backend -f backend/Dockerfile .
docker run -p 3001:3001 \
  -e PORT=3001 \
  -e ADMIN_TOKEN=your-token \
  -e DATABASE_PATH=/app/data/citizen_safety.db \
  -v $(pwd)/data:/app/data \
  citizen-safety-backend
```

### Docker Compose

```bash
docker-compose up
```

See `docker-compose.yml` for full setup.

## 🚢 Deployment

### Backend (Render / Railway)

1. **Set environment variables:**
   - `PORT` (usually auto-set)
   - `ADMIN_TOKEN` (generate secure token)
   - `DATABASE_PATH` (or use provided path)
   - `CORS_ORIGIN` (your web app URL)

2. **Deploy:**
   - Connect GitHub repo
   - Set build command: `npm install && npm run build --workspace=shared && npm run build --workspace=backend`
   - Set start command: `npm run migrate --workspace=backend && npm start --workspace=backend`

### Web (Vercel / Netlify)

1. **Set environment variables:**
   - `VITE_API_BASE_URL` (your backend URL)
   - `VITE_ADMIN_TOKEN` (optional)

2. **Deploy:**
   - Connect GitHub repo
   - Build command: `npm install && npm run build --workspace=web`
   - Output directory: `web/dist`

### Mobile (Expo)

1. **Update API URL** in `app.json`:
```json
{
  "extra": {
    "apiBaseUrl": "https://your-backend-url.com"
  }
}
```

2. **Build and publish:**
```bash
cd mobile
expo publish
# or
eas build --platform all
```

## 📊 API Documentation

See [api-spec.md](./api-spec.md) for complete API documentation.

### Quick Reference

- `GET /api/ping` - Health check
- `GET /api/issues` - List issues (supports `?limit`, `?category`, `?since`)
- `GET /api/issues/:id` - Get single issue
- `POST /api/issues` - Create issue
- `PATCH /api/issues/:id` - Update issue (admin)
- `GET /api/issues/export.csv` - Export CSV (admin)
- `GET /api/issues/:id/image/:index` - Get issue image

## 🎨 Design System

### Color Palette

- **Primary Text**: `#0f172a` (slate-900)
- **Secondary Text**: `#64748b` (slate-500)
- **Background**: `#f8fafc` (slate-50)
- **Primary Accent**: `#2563eb` (blue-600) or `#0ea5a4` (teal-600)
- **Success**: `#16a34a` (green-600)
- **Warning**: `#ca8a04` (yellow-600)
- **Error**: `#dc2626` (red-600)

**No neon colors** - muted, professional palette for readability and calm UX.

## 🏛 Architecture

```
┌─────────────┐
│   Mobile    │
│   (Expo)    │
└──────┬──────┘
       │
       │ HTTP/REST
       │
┌──────▼──────┐         ┌──────────┐
│   Backend   │────────▶│  SQLite  │
│  (Express)  │         │ Database │
└──────┬──────┘         └──────────┘
       │
       │ HTTP/REST
       │
┌──────▼──────┐
│  Web App    │
│  (React)    │
└─────────────┘
```

### Data Flow

1. **Mobile**: User submits report → Offline queue (if offline) → API → Database
2. **Web**: Dashboard polls API → Displays issues → Admin updates status → API → Database
3. **Shared**: Common types ensure consistency across all clients

## 🔒 Security

- Admin endpoints protected with Bearer token authentication
- Input validation on all endpoints
- CORS configured for specific origins
- SQL injection protection via parameterized queries
- Image size limits (base64 in request body)

## 📝 Code Style

- **TypeScript** strict mode enabled
- **ESLint** for linting
- **Prettier** for formatting
- Consistent naming conventions

Run linting:
```bash
npm run lint  # (if configured)
```

## 🤝 Contributing

1. Create feature branch
2. Make changes
3. Run tests: `npm test`
4. Submit pull request

## 📄 License

MIT License - see LICENSE file

## 🆘 Troubleshooting

### Backend won't start
- Check if port 3001 is available
- Verify `.env` file exists and has correct values
- Run `npm run migrate` to initialize database

### Web app can't connect to API
- Verify `VITE_API_BASE_URL` in `web/.env`
- Check CORS settings in backend
- Ensure backend is running

### Mobile app can't connect
- For physical device: Use computer's IP address, not `localhost`
- Check firewall settings
- Try tunnel mode in Expo

### Database errors
- Delete `data/citizen_safety.db` and run `npm run migrate` again
- Check file permissions on database directory

## 📚 Additional Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Router](https://reactrouter.com/)
- [Express.js](https://expressjs.com/)
- [SQLite Documentation](https://www.sqlite.org/docs.html)

---

**Built with ❤️ for citizen safety and public service**

