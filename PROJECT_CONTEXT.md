# NutriTrack AI — Complete Project Context & Architecture

## 1. Project Overview & Objectives

**NutriTrack AI** is an intelligent, privacy-first personal nutrition tracking, computerized meal analysis, and lifestyle optimization platform. Designed around the core philosophy **"AI Nutrition, Made Human"**, the system bridges everyday dietary goals with real-world human behavior—including dining out, cultural festivals, weddings, fasting periods, and social celebrations—without punitive restriction or guilt.

### Core Objectives:
1. **Frictionless Nutrition Intake**: Eliminate the tedious, manual ingredient-by-ingredient logging bottleneck using multimodal computer vision and automated reference database lookups.
2. **Clinical Scientific Integrity**: Enforce strict thermodynamic and biochemical principles (Atwater General Energy Factors: $4\text{ kcal/g}$ Protein, $4\text{ kcal/g}$ Carbohydrates, $9\text{ kcal/g}$ Fats; Mifflin-St Jeor Total Daily Energy Expenditure equations).
3. **Automated Goal & Routine Synthesis**: Transform abstract weight and fitness goals into an actionable 7-day workout routine and a timed 6-meal daily schedule tailored to user biometrics.
4. **Guilt-Free Cultural & Festival Balance**: Provide structured 3-phase protocols (Pre-Event Preparation, During-Event Mindful Enjoyment, and Post-Event Scientific Recovery) for holidays, celebrations, and fasting periods.
5. **Resilient Local-First Architecture**: Provide instantaneous offline responsiveness with reactive state management, paired with automatic synchronization to server-side JSON and Supabase PostgreSQL backends.

---

## 2. Problem Statement & Proposed Solution

### The Flaws of Traditional Trackers:
- **High Data-Entry Friction**: Conventional apps require weighing ingredients, searching hundreds of ambiguous user-submitted database entries, and manually computing macro percentages. 80%+ of users abandon tracking within two weeks.
- **Punitive Lab Mindset**: Traditional apps operate in a sterile vacuum. Eating a treat or attending a family festival triggers harsh red charts, negative alerts, and feelings of failure, driving binge-and-restrict cycles.
- **Vision Hallucinations**: Generic AI wrappers frequently hallucinate wild macronutrient figures (e.g., claiming a single apple has 30g of protein or 600 calories) or accept non-food photos (laptops, pets, documents).
- **Abstract Numbers Without Direction**: Users are given a calorie ceiling (e.g. "1,850 kcal") but are left stranded on *what* to cook, *when* to eat, and *how* to train.

### The NutriTrack AI Solution:
1. **Multimodal Dual-Gate AI Vision**: Employs a zero-shot neural vision model (OpenCLIP ViT-B-32) that first verifies whether an image is edible food via a strict classification gate, rejects non-food objects with actionable explanations, and categorizes food across verified taxonomy classes.
2. **Verified Atwater Calibration**: Replaces arbitrary numbers with verified reference data (USDA FoodData Central / IFCT) where calories strictly adhere to $(4 \times P) + (4 \times C) + (9 \times F)$. Missing micronutrients remain honestly marked as `"n/a"` instead of fabricated.
3. **Algorithmic Routine Engine**: Uses clinical anthropometric formulas (Mifflin-St Jeor BMR, activity multipliers from 1.2 to 1.9, Quetelet BMI) to output a complete daily meal timetable and weekly workout split.
4. **3-Phase Festive Lifecycle Intelligence**: Automatically schedules holiday periods with pre-event satiety anchoring (protein and fiber), guilt-free enjoyment during the event, and gentle post-event electrolyte rebalancing (potassium, hydration, light walking).

---

## 3. Target Users

1. **Fitness Enthusiasts & Athletes**: Individuals targeting body recomposition, muscle hypertrophy, or progressive fat loss who require accurate macro splits and structured workout routines.
2. **Busy Professionals**: Individuals who want fast, camera-based meal logging and practical meal suggestions without spending 20 minutes manually entering ingredients.
3. **Individuals Celebrating Cultural Traditions**: Users celebrating festivals (Navratri, Diwali, Eid, Christmas, Thanksgiving, Weddings) who want to enjoy family feasts without sabotaging health goals.
4. **Beginners & Lifestyle Trackers**: Users who need gentle, empathetic coaching with ethical guardrails against extreme restriction, starvation, or eating anxiety.

---

## 4. Complete Feature List

| Feature | Route / Module | Internal Mechanism & Purpose |
|---|---|---|
| **Landing & Hero View** | `/` & `/home` | Product introduction, value propositions, interactive meal preview cards, quick action links. |
| **Personalized Goal & Routine Generator** | `/routine` | Biometric intake (Age, Gender, Weight, Height, Target Weight, Goal, Activity Level, Dietary Preference, Allergies, Workout Location). Produces TDEE, BMR, 7-day workout routine, 6-meal daily diet schedule, habit checklist, 1-click dashboard sync, and printable export. |
| **Interactive Daily Dashboard** | `/dashboard` | Real-time Energy Left SVG donut progress gauge, macro split bars (Protein, Carbs, Fats), interactive water tracker, dynamic BMI tracker, meal slot cards (Breakfast, Lunch, Dinner, Snacks), and active festival alerts. |
| **Multimodal AI Food Scanner** | `/scanner` | Live camera snapshot or photo upload. Proxies to Python OpenCLIP vision pipeline. Detects edible meals, rejects non-food items, presents candidate match chips, provides serving & gram portion controls, and syncs directly to daily log. |
| **Manual Meal Logger** | Dashboard Modal / `/scanner` | Instant search modal querying 500+ ingredients and verified reference dishes with serving size scaling and custom macro overrides. |
| **Festival & Cultural Diet Calendar** | `/calendar` | Interactive calendar tracking cultural and personal events (Navratri, Diwali, Ramadan, Weddings). Offers 3-phase nutritional guidance and generates Event Impact Reports. |
| **Targeted Recommendations** | `/recommendations` | Dynamically filters meal and exercise suggestions based on the user's remaining calories and protein deficit for the day. Includes 1-click exercise completion. |
| **Health Analytics & Trajectory** | `/analytics` | Historical 7-day adherence charts, weight milestone trajectory, BMI tracking, and festival impact recovery breakdown. |
| **Profile & Biometrics Management** | `/profile` | Comprehensive biometric settings, dietary preference toggles, allergy checklists, calorie target calibration, and local data export/import. |
| **Multi-Account Switching & Auth** | `/login` & Navbar Switcher | Seamless switching between family members/demo profiles (`Maya`, `Alex`) with credential validation, server-side registration, and profile isolation. |
| **Conversational AI Nutrition Coach** | Global Drawer (`ConversationalAssistant.tsx`) | Empathetic floating assistant bubble powered by Groq LLM (`llama-3.3-70b-versatile`) with clinical ethical guardrails (zero starvation, non-punitive rebalancing) and contextual awareness of today's consumed macros. |
| **Smart Reminders Drawer** | Global Drawer (`ReminderDrawer.tsx`) | Scheduled toggleable notifications for meal timings, hydration milestones, daily workouts, and festival preparation alerts. |

---

## 5. Application Workflow & Architecture

```
+---------------------------------------------------------------------------------------+
|                                     NutriTrack AI                                     |
+---------------------------------------------------------------------------------------+
|                                  CLIENT LAYER (UI)                                    |
|   Next.js 16 App Router | React 19 | Tailwind CSS v4 | Lucide Icons | Canvas Confetti |
|   Pages: / (Home), /dashboard, /scanner, /routine, /calendar, /analytics, /profile   |
|   Components: Navbar, EnergyGauge, MacroSplitBar, AssistantDrawer, ReminderDrawer     |
+---------------------------------------------------------------------------------------+
                                           |
                                           v
+---------------------------------------------------------------------------------------+
|                                  LOGIC & ENGINE LAYER                                 |
|   - routineEngine.ts: Mifflin-St Jeor TDEE, BMR, 7-Day Workout, Timed Meal Generator  |
|   - nutritionEngine.ts: Macro Calorie Aggregation, Atwater Verification, BMI Formulas |
|   - festivalEngine.ts: 3-Phase Lifecycle Guidance & Event Impact Analysis             |
|   - foodDatabase.ts: Verified reference database of 150+ regional & global foods      |
|   - storage.ts: Reactive client-side LocalStorage store with custom event dispatchers |
+---------------------------------------------------------------------------------------+
                                           |
                                           v
+---------------------------------------------------------------------------------------+
|                                  SERVER / API LAYER                                   |
|   Next.js Server Route Handlers:                                                      |
|   - /api/scan-food: Secure proxy to Python Scanner with fallback reference lookups    |
|   - /api/scan-food/search: Server proxy for query search & food serving options       |
|   - /api/assistant: Contextual coach route with Groq LLM & clinical fallbacks         |
|   - /api/auth/login, /api/auth/register, /api/auth/users: Server credential auth      |
|   - /api/user/sync: Bi-directional synchronization endpoint                           |
+---------------------------------------------------------------------------------------+
                      |                                            |
                      v                                            v
+-----------------------------------------+   +-----------------------------------------+
|     STANDALONE SCANNER SERVICE          |   |            DATA PERSISTENCE             |
|  FastAPI (Python 3.13) on Port 8001     |   |  - Server Disk: nutritrack-backend.json |
|  - OpenCLIP ViT-B-32 Zero-Shot Backend  |   |  - Client: LocalStorage (Offline-First) |
|  - Image Quality & Laplacian Blur Gate  |   |  - Cloud: Supabase PostgreSQL Client    |
|  - Reference DB (46 Normalized Foods)   |   |                                         |
+-----------------------------------------+   +-----------------------------------------+
```

---

## 6. End-to-End User Journey

1. **Onboarding & Discovery**: User visits `/` or `/home`, reads the core philosophy, and clicks **"Create My Goal & Routine"**.
2. **Routine Generation (`/routine`)**:
   - User inputs biometrics: Name, Age, Gender, Weight, Height, Target Weight, Primary Goal, Weekly Pace, Activity Level, Dietary Preference, Allergies, and Workout Location.
   - The engine computes BMR, TDEE, calorie/macro targets, and generates a 7-day workout routine and 6-meal daily schedule.
   - User reviews the schedule and clicks **"Apply to Dashboard & Save Routine"**.
3. **Daily Tracking (`/dashboard`)**:
   - Dashboard automatically loads the newly calibrated daily calorie target and macro goals.
   - Energy Left donut gauge dynamically updates as meals and water are logged.
   - User tracks water cups with instant `+` and `-` buttons.
4. **Food Scanning (`/scanner`)**:
   - User snaps a photo of their meal or selects a meal preset.
   - Scanner validates image quality, executes OpenCLIP neural classification, and presents verified candidates.
   - User selects the matching candidate, adjusts portion grams or selects a standard serving (e.g., 182g apple), and clicks **"Confirm & Save Meal"**.
   - Confetti explodes, meal logs to Dashboard, and consumed energy increases.
5. **Cultural Adaptation (`/calendar`)**:
   - During festival periods (e.g. Navratri), user opens the Calendar page to review Pre-Event satiety strategies, 1-tap logs festive treats during gatherings without guilt, and accesses electrolyte recovery advice the next day.
6. **AI Nutrition Coach (`ConversationalAssistant`)**:
   - User opens the floating coach bubble to ask: *"I had sweets at a party, what should I eat for dinner?"*.
   - The assistant calculates remaining calories and protein deficit, reassuring the user and proposing two light, high-protein dinner options matching their dietary preference.

---

## 7. Third-Party Integrations & External Services

1. **Groq Cloud API**:
   - Model: `llama-3.3-70b-versatile`
   - Purpose: Conversational coaching in `/api/assistant`.
   - Security: API key read server-side via `process.env.GROQ_API_KEY`.
   - Fallback: Deterministic rule-based clinical response generator if key is missing or offline.
2. **OpenCLIP / Hugging Face**:
   - Model: `ViT-B-32 / laion2b_s34b_b79k`
   - Purpose: Zero-shot multimodal image embeddings for food gate and classifier in `nutritrack-scanner`.
3. **Supabase PostgreSQL (`@supabase/supabase-js`)**:
   - Purpose: Optional cloud database synchronization.
   - Security: Connected via `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
   - Fallback: Resilient local JSON storage and reactive browser store when Supabase is unconfigured.
4. **Vercel Edge Network**:
   - Hosting: Live deployment at `https://nutritrack-app-beryl-five.vercel.app`.

---

## 8. Existing Functionality & Implementation Status

- **Web Application (`nutritrack-app`)**: **100% Implemented & Verified**. All 19 Next.js App Router routes compile with zero TypeScript errors.
- **Standalone Food Scanner (`nutritrack-scanner`)**: **100% Implemented & Verified**. 36 unit and API tests pass; OpenCLIP ViT-B-32 zero-shot backend is active on port 8001.
- **Reference Nutrition Database**: **46 Verified Reference Foods** normalized per 100g with explicit gram weights, serving descriptions, and Atwater consistency flags.
