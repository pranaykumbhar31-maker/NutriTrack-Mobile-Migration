# NutriTrack AI — Database Schema & Data Models Documentation

## 1. Database Architecture Overview

NutriTrack AI implements a **Hybrid Local-First + Server Database Architecture**:
1. **Client Persistence (Offline-First)**: The web browser operates on reactive client storage (`localStorage`) managed through `src/lib/storage.ts`. Custom window events (`nutritrack_meals_updated`, `nutritrack_profile_updated`) notify components across tabs and windows of data mutations without requiring re-renders or page refreshes.
2. **Server-Side File Database**: On the server, `src/lib/serverDatabase.ts` maintains a structured JSON document store (`data/nutritrack-backend.json`) with an in-memory cache layer. In serverless environments where `process.cwd()` is read-only, it automatically switches to `/tmp/nutritrack-backend.json`.
3. **Cloud Database (Supabase PostgreSQL Ready)**: `src/lib/supabase.ts` provisions a standard PostgreSQL client via `@supabase/supabase-js`. When configured, entities can be mapped 1:1 to relational PostgreSQL tables.

---

## 2. Entity-Relationship & Schema Diagram

```
+-------------------------------------------------------------+
|                         UserAccount                         |
+-------------------------------------------------------------+
| * id: string (PK)                                           |
|   email: string (Unique)                                    |
|   name: string                                              |
|   password?: string                                         |
|   avatarUrl?: string                                        |
|   createdAt: string (YYYY-MM-DD)                            |
+-------------------------------------------------------------+
         |                     |                     |
         | 1:1                 | 1:N                 | 1:N
         v                     v                     v
+-----------------+   +-----------------+   +-----------------+
|   UserProfile   |   |     MealLog     |   |    WeightLog    |
+-----------------+   +-----------------+   +-----------------+
| * id: string    |   | * id: string    |   | * id: string    |
|   userId (FK)   |   |   userId (FK)   |   |   userId (FK)   |
|   age: number   |   |   date: string  |   |   date: string  |
|   gender: string|   |   time: string  |   |   weightKg: num |
|   heightCm: num |   |   mealType: enum|   |   bmi: number   |
|   weightKg: num |   |   totalNutr: obj|   |   notes?: string|
|   targetWt: num |   |   photoUrl?: str|   +-----------------+
|   goal: enum    |   |   notes?: string|
|   calTarget: num|   |   eventId?: (FK)|
|   protein: num  |   +-----------------+
|   carbs: num    |            |
|   fats: num     |            | 1:N
|   streakDays    |            v
+-----------------+   +-----------------+
         |            |   MealLogItem   |
         | 1:1 (Opt)  +-----------------+
         v            |   foodItem: obj |
+-----------------+   |   quantity: num |
|GeneratedRoutine |   |   calcNutr: obj |
+-----------------+   +-----------------+
| * id: string    |
|   weeklySplit[] |
|   meals[]       |
|   checklist[]   |
+-----------------+
```

---

## 3. Data Entities & Field Specifications

### 3.1 `UserAccount`
The primary authentication and account container representing a registered user or persona.

```typescript
export interface UserAccount {
  id: string;               // PK, e.g. "usr-maya-01", "usr-1730000000000"
  email: string;            // Unique identifier, case-insensitive
  name: string;             // User display name
  password?: string;        // Hashed or plain credentials (omitted in API responses)
  avatarUrl?: string;       // Optional profile picture URL
  createdAt: string;        // Account creation timestamp (YYYY-MM-DD)
  profile: UserProfile;     // Embedded 1:1 UserProfile
  meals: MealLog[];         // Array of logged meals
  weightLogs: WeightLog[];  // Array of weight entries
  water: WaterLog;          // Daily hydration tracker state
  events: CalendarEvent[];  // User-specific or default festival calendar events
  reminders: SmartReminder[]; // User notification reminders
  exercises: ExerciseRecommendation[]; // Target workout recommendations
  routinePlan?: GeneratedRoutinePlan;  // Saved algorithmic routine plan
}
```

---

### 3.2 `UserProfile`
User anthropometric biometrics, dietary preferences, clinical calorie targets, and streak stats.

| Field Name | Type | Constraints / Enum | Description |
|---|---|---|---|
| `id` | `string` | PK / FK to `UserAccount.id` | Profile identifier. |
| `name` | `string` | Min 1 char | User full name. |
| `age` | `number` | $10 \le \text{age} \le 120$ | Chronological age for BMR calculations. |
| `gender` | `string` | `'female' \| 'male' \| 'other'` | Biological sex used in Mifflin-St Jeor formula. |
| `heightCm` | `number` | $50 \le \text{height} \le 260$ | Height in centimeters. |
| `weightKg` | `number` | $20 \le \text{weight} \le 300$ | Current scale body weight in kilograms. |
| `targetWeightKg` | `number` | $20 \le \text{target} \le 300$ | Goal body weight. |
| `targetDate` | `string` | ISO Date `YYYY-MM-DD` | Target milestone completion date. |
| `activityLevel` | `string` | `'sedentary' \| 'light' \| 'moderate' \| 'very_active'` | TDEE physical activity multiplier ($1.2$ to $1.725$). |
| `goal` | `string` | `'lose_fat' \| 'build_muscle' \| 'maintain' \| 'improve_health'` | Primary metabolic objective. |
| `dietaryPreference` | `string` | `'all' \| 'vegetarian' \| 'vegan' \| 'eggetarian' \| 'non_veg' \| 'keto' \| 'low_carb'` | Culinary restriction filter for meal recommendations. |
| `allergies` | `string[]` | e.g. `['peanuts', 'dairy', 'gluten']` | Ingredients excluded from suggestions. |
| `dislikedFoods` | `string[]` | Array of strings | Ingredients avoided by taste. |
| `dailyCalorieTarget` | `number` | $1000 \le \text{kcal} \le 6000$ | Calibrated daily energy budget (kcal). |
| `dailyProteinTarget` | `number` | Grams ($1.6\text{--}2.2\text{ g/kg}$) | Daily protein intake target. |
| `dailyCarbsTarget` | `number` | Grams | Daily carbohydrate intake target. |
| `dailyFatsTarget` | `number` | Grams | Daily healthy fat intake target. |
| `streakDays` | `number` | Non-negative integer | Consecutive days with active meal logs. |
| `lastActiveDate` | `string` | ISO Date `YYYY-MM-DD` | Last date user logged a meal or water. |

---

### 3.3 `MealLog` & `MealLogItem`
Represents an individual meal intake event (Breakfast, Lunch, Dinner, Snack).

```typescript
export interface MealLog {
  id: string;               // PK, e.g. "meal-bk-01", "meal-1730000000000"
  date: string;             // ISO Date "YYYY-MM-DD"
  time: string;             // Time of consumption "HH:mm"
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  items: MealLogItem[];     // Constituent food items
  totalNutrition: NutritionalInfo; // Aggregated plate macros
  photoUrl?: string;        // Attached snapshot or preset URL
  notes?: string;           // Optional user note or AI classification observation
  eventId?: string;         // Optional FK linking meal to a CalendarEvent
  aiAnalyzed?: boolean;     // True if captured/verified via AI Scanner
}

export interface MealLogItem {
  foodItem: FoodItem;       // Base reference food metadata
  quantity: number;         // Multiplier of servingSize (e.g. 1.0, 1.5, 0.5)
  calculatedNutrition: NutritionalInfo; // Exact scaled nutrition values
}
```

---

### 3.4 `FoodItem` & `NutritionalInfo`
Nutrient breakdowns enforcing the Atwater equation: $\text{Calories} \approx (4 \times \text{Protein}) + (4 \times \text{Carbs}) + (9 \times \text{Fats})$.

```typescript
export interface NutritionalInfo {
  calories: number;       // Energy (kcal)
  protein: number;        // Protein (g)
  carbs: number;          // Total Carbohydrates (g)
  fats: number;           // Total Dietary Fats (g)
  fiber?: number;         // Dietary Fiber (g) — undefined if unavailable
  sodium?: number;        // Sodium (mg) — undefined if unavailable
  sugar?: number;         // Sugar (g)
  potassium?: number;     // Potassium (mg)
  calcium?: number;       // Calcium (mg)
  iron?: number;          // Iron (mg)
  vitaminA?: number;      // Vitamin A (mcg)
  vitaminC?: number;      // Vitamin C (mg)
}

export interface FoodItem extends NutritionalInfo {
  id: string;             // PK, e.g. "f-apple-fresh", "f-dal-tadka"
  name: string;           // e.g. "Fresh Red Apple", "Dal Tadka"
  category: 'grain' | 'protein' | 'dairy' | 'vegetable' | 'fruit' | 'snack' | 'beverage' | 'festive' | 'curry' | 'composite';
  servingSize: number;    // Reference portion weight (usually 100 or specific serving in grams)
  servingUnit: string;    // 'g', 'cup', 'slice', 'piece', 'bowl', 'tbsp', 'serving'
  cuisine?: string;       // 'Indian', 'Mediterranean', 'Western', 'Asian', etc.
  confidence?: number;    // Classifier certainty probability (0.0 to 1.0)
}
```

---

### 3.5 `GeneratedRoutinePlan`
Stores the complete biometrically calculated workout split, timed meal protocol, and daily habit checklist generated by the Routine Engine (`src/lib/routineEngine.ts`).

```typescript
export interface GeneratedRoutinePlan {
  id: string;               // PK, e.g. "routine-1730000000000"
  createdAt: string;        // ISO Timestamp
  userName: string;
  age: number;
  gender: 'female' | 'male' | 'other';
  currentWeightKg: number;
  heightCm: number;
  targetWeightKg: number;
  goal: 'lose_fat' | 'build_muscle' | 'maintain' | 'improve_health';
  pace: 'sustainable' | 'moderate' | 'accelerated';
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'very_active';
  dietaryPreference: string;
  allergies: string[];
  workoutLocation: 'gym' | 'home_dumbbells' | 'bodyweight';

  // Calculated Metrics
  bmi: number;
  bmiCategory: string;
  bmr: number;
  tdee: number;
  dailyCalorieTarget: number;
  dailyProteinTarget: number;
  dailyCarbsTarget: number;
  dailyFatsTarget: number;
  dailyFiberTarget: number;
  dailyWaterTargetLiters: number;
  dailyWaterTargetCups: number;
  projectedWeeksToGoal: number;
  targetCompletionDate: string;

  // Schedules
  meals: RoutineMealItem[];                // 6-7 timed daily meal slots
  weeklySplit: DailyWorkoutRoutine[];      // 7-day workout schedule with sets/reps/rest/cues
  dailyChecklist: RoutineHabitChecklistItem[]; // Hydration, workout & meal adherence checklist
  dietaryGuidelines: string[];
  hydrationGuidelines: { time: string; amount: string; purpose: string }[];
}
```

---

### 3.6 `CalendarEvent` & 3-Phase Guidance
Cultural festival and lifestyle event data models managing pre-event, during-event, and post-event balance.

```typescript
export interface CalendarEvent {
  id: string;               // PK, e.g. "ev-navratri-2026", "ev-diwali-2026"
  title: string;            // e.g. "Navratri Garba & Fasting/Feasting"
  type: 'festival' | 'celebration' | 'wedding' | 'party' | 'birthday' | 'vacation' | 'restaurant_outing' | 'cheat_meal' | 'special_occasion';
  date: string;             // Start Date "YYYY-MM-DD"
  endDate?: string;         // Optional End Date for multi-day festivals
  description: string;
  badgeColor?: string;
  preEventPlan: PreEventGuidance;       // Satiety anchoring & hydration prep
  duringEventGuidance: DuringEventGuidance; // Mindful enjoyment & guilt-free reminders
  recoveryPlan: RecoveryPlan;           // Potassium restoration, walking & hydration
  loggedMealIds?: string[]; // FKs of meals logged during this event
  impactReport?: EventImpactReport;
  isCustom?: boolean;
}
```

---

## 4. Existing Database Operations & Lifecycle

| Operation | Function (`src/lib/storage.ts` & `src/lib/serverDatabase.ts`) | Action |
|---|---|---|
| **Create Account** | `registerNewUser(name, email, password, profile)` | Saves to client store, persists to disk `nutritrack-backend.json`, initializes default meals and reminders. |
| **Authenticate** | `loginUser(email, password)` | Validates credentials against server accounts, loads user state into `active_account`. |
| **Switch Account** | `setActiveAccount(accountId)` | Switches active context instantly and fires `nutritrack_profile_updated`. |
| **Add Meal** | `addMealLog(meal)` | Appends to active account's `meals` array, recalculates streak if date is today, triggers `syncActiveAccountToBackend()`. |
| **Delete Meal** | `deleteMealLog(mealId)` | Filters out meal by ID, updates storage, and dispatches sync. |
| **Log Water** | `saveStoredWater({ date, cups, targetCups })` | Increments or decrements today's water cups counter ($1\text{ cup} = 250\text{ ml}$). |
| **Log Weight** | `saveStoredWeightLogs(logs)` | Appends date, weight in kg, and calculated Quetelet BMI ($W / H^2$). |
| **Save Routine Plan** | `saveStoredRoutinePlan(plan)` | Writes generated routine plan and optionally updates profile calorie and macro targets. |
| **Backend Sync** | `syncUserData(userId, payload)` | Server POST route reconciling client changes with server disk storage. |
