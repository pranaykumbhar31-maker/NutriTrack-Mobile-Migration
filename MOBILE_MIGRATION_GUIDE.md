# NutriTrack AI — Complete Mobile Migration Guide (React Native + Expo)

**Target Audience**: Replit AI / React Native Developers  
**Target Platform**: Android & iOS (via Expo SDK 52+ and React Native 0.76+)  
**Source Codebase**: Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS

---

## 1. Executive Migration Strategy

The goal of this migration is to convert the existing web application into a high-performance, native mobile experience on iOS and Android while:
1. **Preserving 100% of the mathematical, clinical, and data logic** (`nutritionEngine.ts`, `routineEngine.ts`, `festivalEngine.ts`, `foodDatabase.ts`).
2. **Preserving the complete visual identity** (Emerald Green `#059669`, Slate `#0f172a`, card elevation, rounded surfaces).
3. **Connecting directly to the existing backend API** (`/api/scan-food`, `/api/scan-food/search`, `/api/auth/*`, `/api/assistant`).
4. **Providing an offline-first mobile architecture** via `@react-native-async-storage/async-storage`.

---

## 2. Project Initialization in Replit AI / Expo

### 2.1 Expo Project Setup
```bash
# Initialize Expo project with TypeScript template
npx create-expo-app@latest NutriTrackMobile --template blank-typescript
cd NutriTrackMobile

# Install Core Navigation (Expo Router)
npx expo install expo-router react-native-safe-area-context react-native-screens expo-linking expo-constants expo-status-bar

# Install Native Device Features (Camera, Haptics, Storage)
npx expo install expo-camera expo-image-picker expo-haptics @react-native-async-storage/async-storage expo-notifications

# Install UI & Animation Libraries
npx expo install react-native-svg lucide-react-native react-native-reanimated react-native-gesture-handler

# (Optional) For Tailwind styling on React Native:
npm install nativewind tailwindcss
```

---

## 3. Component Reuse vs. Rewrite Matrix

### 3.1 100% Reusable Business Logic (Copy As-Is)
The following files from `nutritrack-app/src/lib/` can be copied directly into the mobile project without any modifications:
- `src/lib/types.ts`: All data models, interfaces, and enums.
- `src/lib/nutritionEngine.ts`: Mifflin-St Jeor BMR, TDEE, BMI, and macro calculations.
- `src/lib/routineEngine.ts`: 7-day routine generator, calorie deficits, and timeline engine.
- `src/lib/festivalEngine.ts`: Cultural fasting and holiday calorie adaptation logic.
- `src/lib/foodDatabase.ts`: Static offline nutrition database (50+ staples).

### 3.2 HTML to Native Component Translation Table
| Next.js / Web Element | React Native / Expo Equivalent | Migration Notes |
|---|---|---|
| `<div>`, `<section>`, `<main>` | `<View>` | Requires `flexDirection: 'column'` by default in React Native. |
| `<span>`, `<p>`, `<h1>`–`<h6>` | `<Text>` | All plain strings MUST be wrapped in `<Text>`. |
| `<button>`, `<a>` | `<Pressable>`, `<TouchableOpacity>` | Use `onPress` instead of `onClick`. Add `expo-haptics` for tactile feedback. |
| `<input type="text">` | `<TextInput>` | Use `value` and `onChangeText`. Set `keyboardType` and `autoCapitalize`. |
| `<input type="file" capture>` | `expo-camera` / `expo-image-picker` | Native camera viewfinder or photo picker sheet. |
| `<select>` / dropdown | `@react-native-picker/picker` or Bottom Sheet | Native modal or bottom sheet picker. |
| `localStorage.getItem/setItem` | `AsyncStorage.getItem/setItem` | All operations are asynchronous (`await AsyncStorage...`). |
| SVG `<svg>`, `<circle>`, `<path>` | `react-native-svg` (`Svg`, `Circle`, `Path`) | Identical SVG path syntax; used for `EnergyGauge`. |
| `lucide-react` | `lucide-react-native` | Direct drop-in icon replacement with identical icon names. |

---

## 4. Navigation Architecture (Expo Router)

Use Expo Router's file-based navigation to match the web app routes:

```
app/
├── _layout.tsx              # Root Stack Layout (Theme Provider, Auth Context)
├── (auth)/
│   ├── login.tsx            # Login Screen
│   └── register.tsx         # Registration Screen
├── (tabs)/                  # Bottom Tab Navigator
│   ├── _layout.tsx          # Tab Bar configuration with icons
│   ├── index.tsx            # Dashboard Screen (replaces /dashboard)
│   ├── routine.tsx          # Goal & Routine Generator (replaces /routine)
│   ├── scanner.tsx          # Native Camera Scanner (replaces /scanner)
│   ├── calendar.tsx         # Festival & Fasting Calendar (replaces /calendar)
│   └── profile.tsx          # User Profile & Biometrics (replaces /profile)
├── modal/
│   ├── assistant.tsx        # Slide-up AI Chatbot Modal (replaces assistant drawer)
│   └── manual-logger.tsx    # Manual Meal Logger Sheet
└── recommendations.tsx      # Micronutrient & Health Guidance Screen
```

### 4.1 Tab Bar Configuration Example (`app/(tabs)/_layout.tsx`)
```tsx
import { Tabs } from 'expo-router';
import { LayoutDashboard, Dumbbell, Scan, Calendar, User } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#059669', // Emerald-600
        tabBarInactiveTintColor: '#64748b', // Slate-500
        tabBarStyle: {
          backgroundColor: '#0f172a', // Slate-900
          borderTopColor: '#1e293b',
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        headerStyle: { backgroundColor: '#0f172a' },
        headerTintColor: '#ffffff',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="routine"
        options={{
          title: 'Routines',
          tabBarIcon: ({ color, size }) => <Dumbbell color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="scanner"
        options={{
          title: 'Scan Food',
          tabBarIcon: ({ color, size }) => <Scan color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendar',
          tabBarIcon: ({ color, size }) => <Calendar color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
```

---

## 5. Storage & Offline-First Implementation

Replace the synchronous `localStorage` utility with an asynchronous `AsyncStorage` service wrapper:

```typescript
// src/lib/storage.mobile.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile, MealLog } from './types';

const KEYS = {
  USER: 'nutri_user',
  TOKEN: 'nutri_token',
  MEALS: 'nutri_meals',
  ROUTINE: 'nutri_routine',
  WATER: 'nutri_water',
};

export const MobileStorage = {
  async getUser(): Promise<UserProfile | null> {
    const raw = await AsyncStorage.getItem(KEYS.USER);
    return raw ? JSON.parse(raw) : null;
  },

  async setUser(user: UserProfile): Promise<void> {
    await AsyncStorage.setItem(KEYS.USER, JSON.stringify(user));
  },

  async getMeals(): Promise<MealLog[]> {
    const raw = await AsyncStorage.getItem(KEYS.MEALS);
    return raw ? JSON.parse(raw) : [];
  },

  async saveMeal(meal: MealLog): Promise<void> {
    const meals = await this.getMeals();
    meals.unshift(meal);
    await AsyncStorage.setItem(KEYS.MEALS, JSON.stringify(meals));
  },

  async clearSession(): Promise<void> {
    await AsyncStorage.multiRemove([KEYS.USER, KEYS.TOKEN]);
  },
};
```

---

## 6. Native Camera Food Scanner Implementation

In React Native, implement camera scanning with `expo-image-picker` or `expo-camera`.

### 6.1 Scanner Screen (`app/(tabs)/scanner.tsx`)
```tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, ActivityIndicator, StyleSheet, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Image as ImageIcon, CheckCircle, AlertTriangle, Search } from 'lucide-react-native';

const BACKEND_URL = 'https://your-nutritrack-backend.com'; // or local IP in development

export default function MobileScannerScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);

  const takePhoto = async () => {
    const { granted } = await ImagePicker.requestCameraPermissionsAsync();
    if (!granted) {
      alert('Camera access is required to take photos of your meals.');
      return;
    }

    const res = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.85,
    });

    if (!res.canceled && res.assets[0]) {
      processImage(res.assets[0].uri);
    }
  };

  const processImage = async (uri: string) => {
    setImageUri(uri);
    setLoading(true);
    setScanResult(null);

    try {
      const formData = new FormData();
      formData.append('image', {
        uri,
        name: 'meal.jpg',
        type: 'image/jpeg',
      } as any);

      const resp = await fetch(`${BACKEND_URL}/api/scan-food`, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' },
      });

      const data = await resp.json();
      setScanResult(data);
    } catch (err: any) {
      alert(`Scan failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>AI Meal Scanner</Text>
      <Text style={styles.subtitle}>Snap a photo of your plate for instant nutrient breakdown</Text>

      {imageUri && (
        <Image source={{ uri: imageUri }} style={styles.previewImage} />
      )}

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#059669" />
          <Text style={styles.loadingText}>Analyzing dish features with OpenCLIP...</Text>
        </View>
      )}

      {scanResult && (
        <View style={styles.resultCard}>
          <Text style={styles.resultStatus}>Status: {scanResult.scanStatus}</Text>
          <Text style={styles.resultMessage}>{scanResult.message}</Text>
          {scanResult.candidates?.map((c: any) => (
            <TouchableOpacity key={c.label} style={styles.candidateChip}>
              <Text style={styles.candidateText}>{c.display} ({(c.probability * 100).toFixed(0)}%)</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.primaryButton} onPress={takePhoto}>
          <Camera color="#ffffff" size={20} />
          <Text style={styles.buttonText}>Capture Meal</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  content: { padding: 20, alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '700', color: '#ffffff', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#94a3b8', textAlign: 'center', marginBottom: 20 },
  previewImage: { width: '100%', height: 260, borderRadius: 16, marginBottom: 20 },
  loadingContainer: { marginVertical: 20, alignItems: 'center' },
  loadingText: { color: '#10b981', marginTop: 10, fontSize: 14 },
  resultCard: { width: '100%', backgroundColor: '#1e293b', padding: 16, borderRadius: 12, marginBottom: 20 },
  resultStatus: { color: '#10b981', fontWeight: '700', fontSize: 16, marginBottom: 4 },
  resultMessage: { color: '#cbd5e1', fontSize: 14, marginBottom: 12 },
  candidateChip: { backgroundColor: '#334155', padding: 10, borderRadius: 8, marginVertical: 4 },
  candidateText: { color: '#ffffff', fontWeight: '500' },
  buttonRow: { flexDirection: 'row', width: '100%', justifyContent: 'center' },
  primaryButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#059669', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 12, gap: 10 },
  buttonText: { color: '#ffffff', fontWeight: '600', fontSize: 16 },
});
```

---

## 7. Connecting to the Backend API

When testing on mobile:
1. **Local Physical Device**: Replace `localhost:3000` with your machine's local Wi-Fi IP address (e.g. `http://192.168.1.15:3000`).
2. **Android Emulator**: Use `http://10.0.2.2:3000` to reach the host machine.
3. **iOS Simulator**: Use `http://localhost:3000`.
4. **Production**: Point to your deployed Vercel or cloud URL (`https://your-domain.com`).

---

## 8. Brand & Design Tokens (Color Palette)

Ensure consistent styling by adopting the following constants:
```typescript
export const NutriTheme = {
  colors: {
    primary: '#059669',       // Emerald 600
    primaryLight: '#10b981',  // Emerald 500
    primaryDark: '#047857',   // Emerald 700
    background: '#0f172a',    // Slate 900
    card: '#1e293b',          // Slate 800
    cardBorder: '#334155',    // Slate 700
    textPrimary: '#ffffff',   // White
    textSecondary: '#94a3b8', // Slate 400
    textMuted: '#64748b',     // Slate 500
    accentAmber: '#f59e0b',   // Amber 500 (Warning)
    accentRose: '#f43f5e',    // Rose 500 (Danger)
    accentSky: '#0284c7',     // Sky 600 (Info / Hydration)
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
  },
};
```

---

## 9. Comprehensive Testing Checklist

- [ ] **Auth Flow**: Register new user, log in, persist token across app restarts.
- [ ] **Profile Setup**: Set weight, height, age, activity level, verify BMI and target calorie calculations.
- [ ] **Routine Generator**: Generate a 7-day routine, verify timed meal schedule and workout days.
- [ ] **Camera Permissions**: Check prompt on first scan attempt on both Android and iOS.
- [ ] **AI Scanner**: Upload meal photo, verify multipart submission and status chips.
- [ ] **Manual Search Fallback**: Search "Apple" or "Paneer" and log grams.
- [ ] **Daily Dashboard**: Verify Energy Gauge updates calories in real-time when a meal is logged.
- [ ] **Hydration**: Tap `+250ml` and ensure water count increments and persists.
- [ ] **Festival Calendar**: Verify fasting dates and cultural food adjustments render.
- [ ] **Offline Mode**: Turn on Airplane mode, confirm logged meals and profile remain accessible via local storage.
