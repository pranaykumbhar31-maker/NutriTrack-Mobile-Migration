# NutriTrack AI — System Setup & Development Guide

This guide walks you through extracting the source code package, installing dependencies, configuring environment variables, running the full NutriTrack web and Python scanner stack, and launching the new React Native Expo mobile application.

---

## 1. Prerequisites

Ensure your development environment meets these minimum specifications:
- **Node.js**: `v18.18.0` or higher (Node `20.x` or `22.x` recommended)
- **npm**: `v9.x` or `v10.x` (or `pnpm` / `yarn`)
- **Python**: `3.10`, `3.11`, `3.12`, or `3.13`
- **Expo CLI**: `npx expo`
- **Operating System**: macOS, Linux, or Windows 10/11
- **Git**: For version control

---

## 2. Extracting the Source Code

The complete source code is bundled inside `NutriTrack_Source_Code.zip`.

```bash
# Unzip via command line (Linux / macOS):
unzip NutriTrack_Source_Code.zip -d NutriTrack

# Unzip via PowerShell (Windows):
Expand-Archive -Path NutriTrack_Source_Code.zip -DestinationPath NutriTrack

cd NutriTrack
```

Inside you will find:
```
NutriTrack/
├── nutritrack-app/         # Next.js 16 / React 19 Frontend & API routes
└── nutritrack-scanner/     # Python FastAPI OpenCLIP Scanner Daemon
```

---

## 3. Running the Python AI Scanner Service

The Python scanner provides the `/predict` and `/nutrition` endpoints used by the food camera.

### 3.1 Create Virtual Environment & Install Dependencies
```bash
cd nutritrack-scanner

# Create virtual environment
python -m venv venv

# Activate virtual environment:
# On Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# On macOS / Linux:
source venv/bin/activate

# Install dependencies:
pip install --upgrade pip
pip install -r requirements.txt
```

### 3.2 Launch the Scanner Daemon
```bash
# Set backend to OpenCLIP zero-shot:
# On Windows (PowerShell):
$env:SCANNER_BACKEND="clip_zero_shot"
uvicorn scanner.api.app:app --host 127.0.0.1 --port 8001

# On Linux / macOS:
export SCANNER_BACKEND="clip_zero_shot"
uvicorn scanner.api.app:app --host 127.0.0.1 --port 8001
```

### 3.3 Verify Scanner Health
Open a browser or terminal:
```bash
curl http://127.0.0.1:8001/health
# Expected Response:
# {"status":"ok","model_loaded":true,"reference_foods":43,...}
```

---

## 4. Running the Next.js Web Application & API Proxy

### 4.1 Install Node Dependencies
```bash
cd ../nutritrack-app

# Install packages
npm install
```

### 4.2 Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Ensure the following variables are present in `nutritrack-app/.env.local`:
```env
# Server-Side Scanner Configuration (DO NOT expose via NEXT_PUBLIC_*)
SCANNER_URL=http://127.0.0.1:8001
SCANNER_API_KEY=

# Application Port
PORT=3000
```

### 4.3 Run the Web App
```bash
# Development mode:
npm run dev

# Or build and run production:
npm run build
npm run start
```
Visit `http://localhost:3000` in your web browser.

---

## 5. Setting Up the React Native Expo Mobile App

### 5.1 Initialize Expo Project
```bash
cd ..
npx create-expo-app@latest NutriTrackMobile --template blank-typescript
cd NutriTrackMobile
```

### 5.2 Install Mobile Dependencies
```bash
npx expo install expo-router react-native-safe-area-context react-native-screens \
  expo-linking expo-constants expo-status-bar expo-camera expo-image-picker \
  expo-haptics @react-native-async-storage/async-storage react-native-svg \
  lucide-react-native
```

### 5.3 Configure Backend Host in Expo
In `NutriTrackMobile/src/config.ts`:
```typescript
import { Platform } from 'react-native';

export const API_BASE_URL = Platform.select({
  android: 'http://10.0.2.2:3000',      // Points to host machine from Android Emulator
  ios: 'http://localhost:3000',         // Points to host machine from iOS Simulator
  default: 'http://192.168.1.XX:3000',  // Physical phone: replace with your local Wi-Fi IP
});
```

### 5.4 Start Expo Development Server
```bash
npx expo start
```
- Press `a` to open in Android Emulator.
- Press `i` to open in iOS Simulator (macOS only).
- Scan QR code with the Expo Go app on your physical iOS or Android phone.

---

## 6. Troubleshooting Common Issues

### Issue 1: Scanner Service reports `model_unavailable`
- **Cause**: PyTorch or OpenCLIP failed to download weights, or virtual environment is missing packages.
- **Fix**: Run `pip install torch open_clip_torch torchvision` and ensure network access is enabled for LAION-2B weight caching. If weights cannot be downloaded, the web app and mobile app will smoothly switch to manual search fallback.

### Issue 2: Mobile App cannot reach backend (`Network request failed`)
- **Cause**: Mobile device cannot reach `http://localhost:3000` because `localhost` refers to the mobile device itself.
- **Fix**: Use your computer's LAN IP (e.g. `192.168.1.15:3000`) and ensure your computer and phone are connected to the same Wi-Fi network.

### Issue 3: Camera permission denied on mobile
- **Cause**: User dismissed permission dialog.
- **Fix**: Add camera permission strings to `app.json`:
  ```json
  {
    "expo": {
      "plugins": [
        [
          "expo-image-picker",
          {
            "cameraPermission": "NutriTrack requires camera access to scan and analyze meals."
          }
        ]
      ]
    }
  }
  ```
