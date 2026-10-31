# NutriTrack AI — Comprehensive Feature Documentation

This document provides an exhaustive technical and functional breakdown of every feature implemented in the **NutriTrack AI** health and nutrition platform. It details the internal algorithms, formulas, data flows, state management, and edge-case behaviors to enable complete, accurate migration to native mobile (React Native & Expo).

---

## Table of Contents
1. [User Authentication & Session Management](#1-user-authentication--session-management)
2. [User Profile & Biometric Engine](#2-user-profile--biometric-engine)
3. [Goal & Routine Generator Engine](#3-goal--routine-generator-engine)
4. [AI Food Vision & Camera Scanner](#4-ai-food-vision--camera-scanner)
5. [Nutrition & Calorie Calculation Engine](#5-nutrition--calorie-calculation-engine)
6. [Daily Dashboard & Energy Gauge](#6-daily-dashboard--energy-gauge)
7. [Meal Logging System (Automated & Manual)](#7-meal-logging-system-automated--manual)
8. [Cultural & Festival Calendar Engine](#8-cultural--festival-calendar-engine)
9. [Smart Micronutrient & Lifestyle Recommendations](#9-smart-micronutrient--lifestyle-recommendations)
10. [AI Nutrition Chatbot Assistant](#10-ai-nutrition-chatbot-assistant)
11. [Water Intake & Hydration Tracker](#11-water-intake--hydration-tracker)
12. [Reminder & Habit Alert System](#12-reminder--habit-alert-system)
13. [Nutrition Score & Adherence Evaluation](#13-nutrition-score--adherence-evaluation)

---

## 1. User Authentication & Session Management

### 1.1 Overview
NutriTrack implements a **dual-tier hybrid authentication architecture**:
- **Offline / Local Demo Tier**: Instant access via `localStorage` with predefined demo credentials or newly registered offline accounts.
- **Cloud Backend Tier**: Server-validated auth (`/api/auth/login`, `/api/auth/register`) backed by `data/users.json` with bcrypt password hashing and optional Supabase Auth synchronization.

### 1.2 Internal Workflow & State Machine
```
[User Input: Email + Password]
         │
         ▼
[POST /api/auth/login] ──(Network / Server Available?)──► [Yes] ──► Validate bcrypt hash in data/users.json
         │                                                                   │
        [No]                                                                 ▼
         │                                                      [Return AuthToken + UserProfile]
         ▼                                                                   │
[Fallback: localStorage lookup] ◄─────────────────────────────────────────────┘
         │
         ▼
[Persist session: nutri_user + nutri_token]
         │
         ▼
[Sync state into Navbar, Dashboard, and Profile context]
```

### 1.3 Key State Keys
- `nutri_user`: Serialized `UserProfile` object containing `id`, `email`, `name`, `age`, `weightKg`, `heightCm`, `goal`, etc.
- `nutri_token`: JWT session token or local mock bearer token.
- `nutri_is_guest`: Boolean flag indicating anonymous/guest mode.

### 1.4 Mobile Migration Mapping
- In React Native/Expo, replace `localStorage` with `@react-native-async-storage/async-storage` wrapped in a React Context (`AuthContext`).
- Keep identical JSON schema so users can sync cross-platform.

---

## 2. User Profile & Biometric Engine

### 2.1 Biometric Fields
Located in [`src/lib/types.ts`](file:///c:/Users/PRANAY/OneDrive/Desktop/cc/nutritrack-app/src/lib/types.ts):
- `age`: Number (years)
- `gender`: `'male' | 'female' | 'other'`
- `weightKg`: Number (kilograms)
- `heightCm`: Number (centimeters)
- `activityLevel`: `'sedentary' | 'light' | 'moderate' | 'very_active'`
- `goal`: `'lose_fat' | 'build_muscle' | 'maintain' | 'improve_health'`
- `dietaryPreferences`: Array of strings (`'vegetarian'`, `'vegan'`, `'keto'`, `'balanced'`, etc.)
- `allergies`: Array of strings (`'peanuts'`, `'dairy'`, `'gluten'`, etc.)

### 2.2 Mathematical Formulas (Internal Logic)

#### A. Basal Metabolic Rate (BMR)
Calculated via the clinically validated **Mifflin-St Jeor Equation** in [`src/lib/nutritionEngine.ts`](file:///c:/Users/PRANAY/OneDrive/Desktop/cc/nutritrack-app/src/lib/nutritionEngine.ts):
$$\text{BMR}_{\text{base}} = (10 \times \text{weight}_{\text{kg}}) + (6.25 \times \text{height}_{\text{cm}}) - (5 \times \text{age}_{\text{years}})$$
$$\text{BMR} = \begin{cases} \text{BMR}_{\text{base}} + 5 & \text{if male} \\ \text{BMR}_{\text{base}} - 161 & \text{if female} \\ \text{BMR}_{\text{base}} - 78 & \text{if other} \end{cases}$$

#### B. Total Daily Energy Expenditure (TDEE)
$$\text{TDEE} = \text{BMR} \times \text{Activity Multiplier}$$
- `sedentary`: $1.200$
- `light`: $1.375$ (1-3 days light exercise/week)
- `moderate`: $1.550$ (3-5 days moderate exercise/week)
- `very_active`: $1.725$ (6-7 days intense exercise/week)

#### C. Goal-Adjusted Calorie Targets
- **Fat Loss (`lose_fat`)**: $\text{Target} = \text{TDEE} - 400\text{ kcal}$ (with female floor of 1,300 kcal, male floor of 1,500 kcal).
- **Muscle Building (`build_muscle`)**: $\text{Target} = \text{TDEE} + 250\text{ kcal}$ (lean surplus).
- **Maintenance / Health (`maintain`, `improve_health`)**: $\text{Target} = \text{TDEE}$.

#### D. Body Mass Index (BMI) & Healthy Weight Range
$$\text{BMI} = \frac{\text{weight}_{\text{kg}}}{(\text{height}_{\text{m}})^2}$$
- **Underweight**: $< 18.5$
- **Normal**: $18.5 - 24.9$
- **Overweight**: $25.0 - 29.9$
- **Obese**: $\ge 30.0$
- **Healthy Weight Range**: $[18.5 \times (\text{height}_{\text{m}})^2, 24.9 \times (\text{height}_{\text{m}})^2]$

---

## 3. Goal & Routine Generator Engine

### 3.1 Overview
The **Routine Generator** ([`src/lib/routineEngine.ts`](file:///c:/Users/PRANAY/OneDrive/Desktop/cc/nutritrack-app/src/lib/routineEngine.ts) and [`src/app/routine/page.tsx`](file:///c:/Users/PRANAY/OneDrive/Desktop/cc/nutritrack-app/src/app/routine/page.tsx)) collects the user's current weight, height, age, target weight, goal, target pace, dietary preference, allergies, and workout environment (Gym, Home Dumbbells, Bodyweight) to generate a complete personalized schedule.

### 3.2 Timeline & Caloric Deficit Math
- **7,700 kcal Rule**: 1 kg of human fat tissue equates to approximately 7,700 kcal.
- **Pace Calculations**:
  - `sustainable`: $0.35\text{ kg/week} \implies \text{Deficit} = \frac{0.35 \times 7700}{7} = 385\text{ kcal/day}$
  - `moderate`: $0.55\text{ kg/week} \implies \text{Deficit} = \frac{0.55 \times 7700}{7} = 605\text{ kcal/day}$
  - `accelerated`: $0.85\text{ kg/week} \implies \text{Deficit} = \min\left(750, \frac{0.85 \times 7700}{7}\right) = 750\text{ kcal/day}$
- **Target Timeline**:
  $$\Delta W = |\text{Current Weight} - \text{Target Weight}|$$
  $$\text{Weeks Required} = \left\lceil \frac{\Delta W}{\text{Weekly Pace}} \right\rceil$$
  $$\text{Target Date} = \text{Today} + (\text{Weeks Required} \times 7\text{ days})$$

### 3.3 Generated Deliverables
1. **Clinical Biometric Summary**: BMI, BMR, TDEE, Calorie Deficit/Surplus, Safe Floor warnings.
2. **Timed 6-Meal Daily Diet Plan**:
   - Breakfast (08:00 AM)
   - Mid-Morning Snack (11:00 AM)
   - Lunch (01:30 PM)
   - Evening Pre-Workout Snack (05:00 PM)
   - Post-Workout Dinner (08:30 PM)
   - Pre-Bed Recovery Snack (10:15 PM)
   *(Filtered dynamically by dietary preferences: Vegetarian, Vegan, High-Protein, Keto, Balanced)*
3. **7-Day Workout Routine**:
   - Day 1: Push / Chest & Triceps (or Upper Body Functional)
   - Day 2: Pull / Back & Biceps (or Core & Posture)
   - Day 3: Legs & Core (or Lower Body Mobility)
   - Day 4: Active Recovery / Zone 2 Cardio & Mobility
   - Day 5: Upper Hypertrophy / Full Body Complex
   - Day 6: Lower Hypertrophy / HIIT Sprints
   - Day 7: Full Rest & Regeneration
4. **Daily Habit Checklist**: Hydration goal (ml), sleep duration (8 hours), steps target (10,000 steps), protein pacing.

---

## 4. AI Food Vision & Camera Scanner

### 4.1 Overview
The food scanner captures an image via the device camera or file upload and streams it to the `/api/scan-food` backend proxy, which coordinates with the Python OpenCLIP zero-shot classification backend (`scanner.api.app:app` on port 8001).

### 4.2 Status Code Protocol
The UI reacts to 7 distinct status states returned by the backend:
1. `accepted`: High confidence classification ($\ge 0.22$). Dish identified, nutritional breakdown populated.
2. `needs_confirmation`: Moderate confidence ($0.15 - 0.22$) or multiple competitive classes. Shows top candidate chips and manual search.
3. `rejected_non_food`: OpenCLIP non-food gate detected inanimate object, person, electronics, document, etc.
4. `ambiguous`: Food detected, but visual features match multiple divergent items equally.
5. `low_quality_image`: Image too dark, blurry, or low resolution.
6. `packaged_label_detected`: Scanned image appears to be a nutritional barcode or packaging label rather than prepared food.
7. `model_unavailable`: ML model daemon offline or weights not found. Gracefully opens manual search with zero fake predictions.

### 4.3 Portion Sizing & Re-Calculation
- When an item is identified, the UI fetches available serving sizes from `/api/scan-food/search?action=servings&foodId={id}`.
- User can toggle portions (e.g. `1 medium (182g)`, `1 bowl (240g)`, `100g`, `Custom grams`).
- Toggling the serving size immediately re-queries the backend `/api/scan-food` with `{ foodId, grams }` to receive linear Atwater-scaled nutrients.

---

## 5. Nutrition & Calorie Calculation Engine

### 5.1 Macronutrient Multipliers (Atwater System)
- Protein: $4\text{ kcal/g}$
- Carbohydrates: $4\text{ kcal/g}$
- Fats: $9\text{ kcal/g}$
- Total calculated calories:
  $$\text{Calories} = (\text{Protein} \times 4) + (\text{Carbs} \times 4) + (\text{Fats} \times 9)$$

### 5.2 Macro Ratio Breakdown
- **Protein Ratio**: $\frac{\text{Protein (g)} \times 4}{\text{Total Calories}} \times 100\%$
- **Carbs Ratio**: $\frac{\text{Carbs (g)} \times 4}{\text{Total Calories}} \times 100\%$
- **Fats Ratio**: $\frac{\text{Fats (g)} \times 9}{\text{Total Calories}} \times 100\%$

### 5.3 Micronutrient Tracking
The system tracks and displays micronutrients with units:
- Dietary Fiber ($g$)
- Sodium ($mg$)
- Potassium ($mg$)
- Calcium ($mg$)
- Iron ($mg$)
- Added Sugars ($g$)

---

## 6. Daily Dashboard & Energy Gauge

### 6.1 Energy Gauge Visualizer
Located in [`src/components/EnergyGauge.tsx`](file:///c:/Users/PRANAY/OneDrive/Desktop/cc/nutritrack-app/src/components/EnergyGauge.tsx):
- Radial SVG gauge with smooth animated stroke offset.
- Dynamic color thresholding:
  - $< 70\%$ of target: Cyan/Blue (`text-sky-500`)
  - $70\% - 105\%$ of target: Emerald Green (`text-emerald-500`)
  - $> 105\%$ of target: Amber Warning (`text-amber-500`)
  - $> 120\%$ of target: Rose Red Alert (`text-rose-500`)

### 6.2 Macro Split Bar
Located in [`src/components/MacroSplitBar.tsx`](file:///c:/Users/PRANAY/OneDrive/Desktop/cc/nutritrack-app/src/components/MacroSplitBar.tsx):
- Segmented progress bar depicting consumed vs remaining grams for Protein, Carbs, and Fats.
- Over-budget warning pills when a specific macro exceeds 100% of daily allotment.

---

## 7. Meal Logging System (Automated & Manual)

### 7.1 Data Structure
```typescript
interface MealLog {
  id: string;
  userId: string;
  timestamp: string;          // ISO 8601 string
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  items: FoodItem[];
  totalNutrition: NutritionalInfo;
  imageUrl?: string;
  notes?: string;
}
```

### 7.2 Manual Meal Logger
Located in [`src/components/ManualMealLogger.tsx`](file:///c:/Users/PRANAY/OneDrive/Desktop/cc/nutritrack-app/src/components/ManualMealLogger.tsx):
- Instant search bar connected to local offline database [`src/lib/foodDatabase.ts`](file:///c:/Users/PRANAY/OneDrive/Desktop/cc/nutritrack-app/src/lib/foodDatabase.ts) containing 50+ staple Indian and global dishes.
- Meal category selector with active time auto-detection:
  - 05:00 - 11:00 $\implies$ Breakfast
  - 11:00 - 16:00 $\implies$ Lunch
  - 16:00 - 19:00 $\implies$ Snack
  - 19:00 - 23:59 $\implies$ Dinner
- Portion gram adjusters with instant live preview.

---

## 8. Cultural & Festival Calendar Engine

### 8.1 Overview
Located in [`src/lib/festivalEngine.ts`](file:///c:/Users/PRANAY/OneDrive/Desktop/cc/nutritrack-app/src/lib/festivalEngine.ts) and [`src/app/calendar/page.tsx`](file:///c:/Users/PRANAY/OneDrive/Desktop/cc/nutritrack-app/src/app/calendar/page.tsx).
Accommodates cultural fasting, festive indulgence periods, and traditional nutritional patterns (e.g. Diwali, Navratri fasting, Ramadan, Eid, Christmas, Holi, Onam, Pongal).

### 8.2 Internal Logic
- **Fasting Rules**:
  - `Ekadashi / Navratri`: Replaces grains with buckwheat (Kuttu), water chestnut (Singhara), fruits, milk, and rock salt (Sendha Namak). Flags grain-containing meals as non-compliant.
  - `Ramadan / Roza`: Shifts calorie distribution to pre-dawn (*Suhoor*) and sunset (*Iftar*), recommending high-electrolyte hydration.
- **Festive Calorie Buffering**:
  - Automatically suggests a 200 kcal pre-event buffer deficit 2 days prior to major feasts to allow celebratory dining without weight gain.

---

## 9. Smart Micronutrient & Lifestyle Recommendations

### 9.1 Algorithmic Triggers
Located in [`src/app/recommendations/page.tsx`](file:///c:/Users/PRANAY/OneDrive/Desktop/cc/nutritrack-app/src/app/recommendations/page.tsx):
- **Iron Deficiency**: If aggregated daily iron $< 12\text{ mg}$ $\implies$ Recommends spinach, lentils, pumpkin seeds, paired with Vitamin C (lemon) for non-heme iron absorption.
- **Fiber Deficiency**: If daily fiber $< 20\text{ g}$ $\implies$ Recommends chia seeds, oats, psyllium husk, legumes.
- **Electrolyte Balance**: Evaluates sodium-to-potassium ratio; alerts when sodium exceeds 2,300 mg.

---

## 10. AI Nutrition Chatbot Assistant

### 10.1 Endpoint & Processing
Located in [`src/components/ConversationalAssistant.tsx`](file:///c:/Users/PRANAY/OneDrive/Desktop/cc/nutritrack-app/src/components/ConversationalAssistant.tsx) and [`src/app/api/assistant/route.ts`](file:///c:/Users/PRANAY/OneDrive/Desktop/cc/nutritrack-app/src/app/api/assistant/route.ts):
- Context-aware chatbot that receives the user's active profile, current day's consumed calories, macro targets, and recent meal logs.
- Can answer nutritional queries, suggest healthy substitutions for high-calorie cravings, explain food scan results, and adjust plans.

---

## 11. Water Intake & Hydration Tracker

### 11.1 Algorithm
$$\text{Hydration Target (ml)} = (\text{weight}_{\text{kg}} \times 35) + (\text{if very\_active then } 750 \text{ else if moderate then } 500 \text{ else } 0)$$
- Increment buttons: `+250 ml (1 glass)`, `+500 ml (1 bottle)`.
- Persisted in `localStorage` under `nutri_water_{userId}_{date}`.

---

## 12. Reminder & Habit Alert System

### 12.1 Overview
Located in [`src/components/ReminderDrawer.tsx`](file:///c:/Users/PRANAY/OneDrive/Desktop/cc/nutritrack-app/src/components/ReminderDrawer.tsx):
- Configurable alarms for Meal Times (Breakfast, Lunch, Dinner), Water Reminders (every 2 hours), and Daily Log Reminders (09:00 PM).
- On web: Uses Web Notifications API.
- On mobile (React Native): Must be mapped to `expo-notifications`.

---

## 13. Nutrition Score & Adherence Evaluation

### 13.1 Scoring Algorithm
Evaluated on a scale of $0 - 100$:
- **Baseline**: 50 points
- **Calorie Adherence**:
  - Within $\pm 15\%$ of target: $+25$ points
  - Within $\pm 30\%$ of target: $+15$ points
  - Outside $\pm 30\%$: $+5$ points
- **Protein Adequacy**:
  - Consumed $\ge 80\%$ of target: $+15$ points
  - Consumed $\ge 60\%$ of target: $+10$ points
- **Dietary Fiber**:
  - Consumed $\ge 20\text{ g}$: $+10$ points
  - Consumed $\ge 12\text{ g}$: $+5$ points

### 13.2 Categorization Labels
- $88 - 100$: **Exceptional** (Emerald)
- $70 - 87$: **Good** (Sky)
- $50 - 69$: **Moderate** (Amber)
- $< 50$: **Needs Attention** (Rose)
