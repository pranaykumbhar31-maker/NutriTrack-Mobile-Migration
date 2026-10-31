# NutriTrack AI — Comprehensive API Documentation

This document specifies all REST API endpoints provided by the NutriTrack backend architecture. It includes both the **Next.js Server Route Handlers** (which act as the primary API layer for client applications) and the **FastAPI Standalone Scanner Service**.

---

## 1. Mobile Application Integration Architecture

```
+-----------------------------------------------------------------------------------+
|                        React Native & Expo Mobile App                             |
+-----------------------------------------------------------------------------------+
       |                                       |                                |
       | POST /api/scan-food                   | POST /api/assistant            | POST /api/auth/*
       | GET /api/scan-food/search             | GET/POST /api/user/sync        |
       v                                       v                                v
+-----------------------------------------------------------------------------------+
|                   Next.js Server API Gateway (/api/*)                             |
|  - Holds SCANNER_API_KEY and GROQ_API_KEY securely server-side                    |
|  - Validates request payload types & enforces bounded uploads                     |
|  - Provides resilient fallbacks when external services are unavailable           |
+-----------------------------------------------------------------------------------+
       |                                                                |
       v (Internal Network / Server-to-Server)                          v
+----------------------------------------+     +------------------------------------+
|  FastAPI Python Scanner (Port 8001)    |     |  Groq Cloud LLM API                |
|  - POST /predict (OpenCLIP Vision)     |     |  llama-3.3-70b-versatile           |
|  - POST /nutrition (Atwater Scaling)   |     +------------------------------------+
|  - GET /foods/search, /servings        |
+----------------------------------------+
```

> [!IMPORTANT]
> **Mobile Reuse Directive**: The React Native / Expo mobile application should communicate directly with the **Next.js `/api/*` endpoints**. Do not expose the internal Python scanner port directly to public mobile clients. Calling the Next.js API routes keeps secrets (`SCANNER_API_KEY`, `GROQ_API_KEY`) secure and guarantees offline fallback capabilities.

---

## 2. API Endpoints Specification

### 2.1 Food Scanner Proxy — `POST /api/scan-food`
Processes either an image scan (via raw base64 data URL) or a manual portion re-calculation for a chosen food ID.

- **URL**: `/api/scan-food`
- **Method**: `POST`
- **Authentication**: None (Public client to server; server attaches secret `X-API-Key` to Python scanner).
- **Headers**: `Content-Type: application/json`

#### Request Body A: Image Analysis
```json
{
  "imageBase64": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."
}
```

#### Request Body B: Manual Portion Re-calculation
```json
{
  "foodId": "f-apple-fresh",
  "grams": 182
}
```

#### Success Response (`200 OK` — Food Accepted):
```json
{
  "success": true,
  "isFood": true,
  "scanStatus": "accepted",
  "plateTitle": "Fresh Red Apple",
  "identifiedItems": [
    {
      "id": "item-f-apple-fresh",
      "foodId": "f-apple-fresh",
      "name": "Fresh Red Apple",
      "servingSize": 182,
      "servingUnit": "g",
      "quantity": 1,
      "caloriesPerUnit": 95,
      "proteinPerUnit": 0.5,
      "carbsPerUnit": 25.1,
      "fatsPerUnit": 0.3,
      "fiberPerUnit": 4.4,
      "sodiumPerUnit": null,
      "nutrition": {
        "calories": 95,
        "protein": 0.5,
        "carbs": 25.1,
        "fats": 0.3,
        "fiber": 4.4,
        "sugar": 19,
        "sodium": null,
        "potassium": 195,
        "calcium": null,
        "iron": null
      },
      "confidence": 0.9978,
      "healthTag": "Reference value"
    }
  ],
  "totalEstimatedNutrition": {
    "calories": 95,
    "protein": 0.5,
    "carbs": 25.1,
    "fats": 0.3,
    "fiber": 4.4,
    "sugar": 19,
    "potassium": 195
  },
  "candidates": [
    {
      "label": "apple",
      "display": "Apple",
      "food_id": "f-apple-fresh",
      "match_quality": "generic",
      "probability": 0.9978
    }
  ],
  "portionRequired": false,
  "needsConfirmation": false,
  "nutritionFlags": ["reference_values_not_independently_verified"],
  "aiObservation": "Generic reference values for 182 g of Fresh Red Apple. Adjust the portion to match what you ate.",
  "provider": "nutritrack_scanner"
}
```

#### Rejection Response (`200 OK` — Non-Food Item Detected):
```json
{
  "success": false,
  "isFood": false,
  "scanStatus": "rejected_non_food",
  "rejectionReason": "This doesn't look like food. Please photograph an edible meal, ingredient or drink.",
  "plateTitle": "Non-Food Image Detected",
  "identifiedItems": [],
  "totalEstimatedNutrition": { "calories": 0, "protein": 0, "carbs": 0, "fats": 0 },
  "healthScore": 0,
  "aiObservation": "This doesn't look like food. Please photograph an edible meal, ingredient or drink.",
  "candidates": [],
  "needsConfirmation": false,
  "portionRequired": false
}
```

#### Error Response (`422 Unprocessable Entity` — Invalid Image Format):
```json
{
  "success": false,
  "isFood": false,
  "scanStatus": "invalid_image",
  "rejectionReason": "Invalid image format. Please upload a valid JPEG, PNG, or WebP photo."
}
```

---

### 2.2 Food Search & Servings Proxy — `GET /api/scan-food/search`
Proxies food queries and serving options to the scanner service or falls back to the local database.

- **URL**: `/api/scan-food/search`
- **Method**: `GET`
- **Query Parameters**:
  - `q` (string, max 80 chars): Search keyword (e.g. `apple`, `dal`, `dosa`).
  - `foodId` or `id` (string): Unique food reference identifier.

#### Example A: Search by Query
`GET /api/scan-food/search?q=apple`
```json
{
  "results": [
    {
      "id": "f-apple-fresh",
      "name": "Fresh Red Apple",
      "score": 0.95,
      "kind": "generic_reference"
    }
  ]
}
```

#### Example B: Servings for Food ID
`GET /api/scan-food/search?foodId=f-apple-fresh`
```json
{
  "food_id": "f-apple-fresh",
  "options": [
    {
      "label": "1 medium apple (182g)",
      "grams": 182,
      "weight_basis": "explicit_in_unit_g"
    },
    {
      "label": "100 g",
      "grams": 100
    }
  ]
}
```

---

### 2.3 Conversational Nutrition Coach — `POST /api/assistant`
Streams or generates personalized, empathetic nutrition coaching messages grounded in the user's remaining calories and active festive context.

- **URL**: `/api/assistant`
- **Method**: `POST`
- **Headers**: `Content-Type: application/json`

#### Request Body:
```json
{
  "message": "I had sweets at a party, what should I eat for dinner?",
  "history": [
    { "role": "user", "content": "Hello!" },
    { "role": "assistant", "content": "Hi Maya! How can I support your nutrition today?" }
  ],
  "userProfile": {
    "name": "Maya",
    "age": 26,
    "gender": "female",
    "weightKg": 58,
    "targetWeightKg": 56,
    "goal": "lose_fat",
    "dietaryPreference": "vegetarian",
    "allergies": ["peanuts"],
    "dailyCalorieTarget": 2100,
    "dailyProteinTarget": 110
  },
  "todayConsumed": {
    "calories": 1550,
    "protein": 82,
    "carbs": 185,
    "fats": 48
  },
  "upcomingEventName": "Navratri Festive Celebrations"
}
```

#### Response (`200 OK`):
```json
{
  "success": true,
  "reply": "Take a deep breath — **one single celebration never defines your overall progress!** 🌿\n\nHere is your scientific, non-punitive balance plan:\n\n1. **Do not skip meals or starve yourself**: Skipping meals leads to blood sugar crashes.\n2. **Balance your dinner**: You have **550 kcal** and **28g protein** remaining. Choose a light, nutrient-dense meal like warm spiced Dal Tadka or Grilled Paneer with baby spinach.\n3. **Hydrate generously**: Drink 2-3 tall glasses of water to naturally balance sodium.\n4. **Gentle movement**: A 20-30 minute relaxing evening walk supports digestion.\n\nCelebrate fully and return to your routine tomorrow!"
}
```

---

### 2.4 User Authentication — `POST /api/auth/login`
Authenticates a user by email and optional password against the backend server store.

- **URL**: `/api/auth/login`
- **Method**: `POST`
- **Request Body**:
```json
{
  "email": "maya@nutritrack.ai",
  "password": "password123"
}
```

#### Response (`200 OK`):
```json
{
  "success": true,
  "account": {
    "id": "usr-maya-01",
    "email": "maya@nutritrack.ai",
    "name": "Maya",
    "createdAt": "2026-05-20",
    "profile": {
      "id": "usr-maya-01",
      "name": "Maya",
      "age": 26,
      "gender": "female",
      "heightCm": 165,
      "weightKg": 58,
      "targetWeightKg": 56,
      "dailyCalorieTarget": 2100,
      "dailyProteinTarget": 110,
      "dailyCarbsTarget": 240,
      "dailyFatsTarget": 60,
      "streakDays": 4
    },
    "meals": [],
    "water": { "date": "2026-10-31", "cups": 5, "targetCups": 8 }
  }
}
```

---

### 2.5 User Registration — `POST /api/auth/register`
Registers a new user account with default seed routines, calendar events, and reminders.

- **URL**: `/api/auth/register`
- **Method**: `POST`
- **Request Body**:
```json
{
  "name": "Jordan Smith",
  "email": "jordan@example.com",
  "password": "securepassword",
  "profile": {
    "age": 29,
    "gender": "male",
    "heightCm": 178,
    "weightKg": 82,
    "targetWeightKg": 77,
    "goal": "lose_fat",
    "activityLevel": "moderate",
    "dietaryPreference": "non_veg",
    "allergies": []
  }
}
```

#### Response (`200 OK`):
```json
{
  "success": true,
  "account": {
    "id": "usr-1730370000000",
    "email": "jordan@example.com",
    "name": "Jordan Smith",
    "createdAt": "2026-10-31"
  }
}
```

---

### 2.6 List Available Users — `GET /api/auth/users`
Lists all available user personas for multi-profile switching.

- **URL**: `/api/auth/users`
- **Method**: `GET`
- **Response (`200 OK`):**
```json
{
  "success": true,
  "users": [
    {
      "id": "usr-maya-01",
      "name": "Maya",
      "email": "maya@nutritrack.ai",
      "createdAt": "2026-05-20",
      "mealsCount": 3
    },
    {
      "id": "usr-alex-02",
      "name": "Alex",
      "email": "alex@nutritrack.ai",
      "createdAt": "2026-06-01",
      "mealsCount": 0
    }
  ]
}
```

---

### 2.7 Activity Data Sync — `POST /api/user/sync`
Synchronizes updated client state (meals, weight, water, profile) to the server database.

- **URL**: `/api/user/sync`
- **Method**: `POST`
- **Request Body**:
```json
{
  "userId": "usr-maya-01",
  "payload": {
    "profile": { "weightKg": 57.8, "streakDays": 5 },
    "water": { "date": "2026-10-31", "cups": 6, "targetCups": 8 },
    "meals": [ ... ]
  }
}
```

#### Response (`200 OK`):
```json
{
  "success": true,
  "account": {
    "id": "usr-maya-01",
    "name": "Maya"
  }
}
```

---

## 3. Standalone Scanner Service API (Port 8001)

These endpoints run on FastAPI within `nutritrack-scanner/` and are called internally by `/api/scan-food`.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Returns service status, whether model weights are loaded (`model_loaded: true`), reference food count, and calibration flags. |
| `POST` | `/predict` | Expects multipart form field `image` (max 8MB). Executes Laplacian blur/quality check, OpenCLIP gate prompt, and food classifier. Returns candidates and match probabilities. |
| `POST` | `/nutrition` | Accepts `{"items": [{"food_id": "f-apple-fresh", "grams": 182}]}`. Computes exact Atwater nutrients scaled from 100g reference values. Unavailable nutrients remain `null`. |
| `GET` | `/foods/search?q={query}` | Ranked substring and token fuzzy matching across the 46 reference foods. |
| `GET` | `/foods/{id}/servings` | Returns available portion weights (e.g. `100 g`, `1 medium apple (182g)`). |
