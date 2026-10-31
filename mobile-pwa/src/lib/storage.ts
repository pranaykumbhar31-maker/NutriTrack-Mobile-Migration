import {
  CalendarEvent,
  MealLog,
  SmartReminder,
  UserProfile,
  WaterLog,
  WeightLog,
  ExerciseRecommendation,
  MealRecommendation,
  UserAccount,
  GeneratedRoutinePlan,
} from './types';
import { DEFAULT_CALENDAR_EVENTS } from './festivalEngine';
export { DEFAULT_CALENDAR_EVENTS };
import { VERIFIED_FOOD_DATABASE } from './foodDatabase';

const STORAGE_KEYS = {
  ACCOUNTS: 'nutritrack_accounts_v2',
  ACTIVE_USER_ID: 'nutritrack_active_user_id_v2',
  ROUTINE_PLAN: 'nutritrack_routine_plan_v2',
};

// Initial Profile matching reference screenshot (Maya)
export const DEFAULT_USER_PROFILE: UserProfile = {
  id: 'usr-maya-01',
  name: 'Maya',
  age: 26,
  gender: 'female',
  heightCm: 165,
  weightKg: 58,
  targetWeightKg: 56,
  targetDate: '2026-11-30',
  activityLevel: 'moderate',
  goal: 'lose_fat',
  dietaryPreference: 'vegetarian',
  allergies: ['peanuts'],
  dislikedFoods: ['bitter gourd'],
  dailyCalorieTarget: 2100,
  dailyProteinTarget: 110,
  dailyCarbsTarget: 240,
  dailyFatsTarget: 60,
  streakDays: 4,
  lastActiveDate: new Date().toISOString().split('T')[0],
};

// Pre-seeded meals totaling exactly 1,552 kcal and 82g protein as in the reference screenshot
export const DEFAULT_INITIAL_MEALS: MealLog[] = [
  {
    id: 'meal-bk-01',
    date: new Date().toISOString().split('T')[0],
    time: '08:30',
    mealType: 'breakfast',
    items: [
      {
        foodItem: VERIFIED_FOOD_DATABASE.find((f) => f.id === 'f-avocado-poached-egg-plate') || VERIFIED_FOOD_DATABASE[0],
        quantity: 1,
        calculatedNutrition: {
          calories: 385,
          protein: 17.5,
          carbs: 32.0,
          fats: 21.0,
          fiber: 8.5,
          sodium: 320,
        },
      },
      {
        foodItem: VERIFIED_FOOD_DATABASE.find((f) => f.id === 'f-berries-mixed') || VERIFIED_FOOD_DATABASE[0],
        quantity: 1,
        calculatedNutrition: {
          calories: 45,
          protein: 0.8,
          carbs: 10.5,
          fats: 0.3,
          fiber: 2.5,
        },
      },
    ],
    totalNutrition: {
      calories: 430,
      protein: 18.3,
      carbs: 42.5,
      fats: 21.3,
      fiber: 11.0,
      sodium: 320,
    },
    photoUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&auto=format&fit=crop&q=80',
    notes: 'Breakfast with artisan sourdough, poached egg and fresh berries',
    aiAnalyzed: true,
  },
  {
    id: 'meal-ln-01',
    date: new Date().toISOString().split('T')[0],
    time: '13:15',
    mealType: 'lunch',
    items: [
      {
        foodItem: VERIFIED_FOOD_DATABASE.find((f) => f.id === 'f-mediterranean-power-bowl') || VERIFIED_FOOD_DATABASE[0],
        quantity: 1,
        calculatedNutrition: {
          calories: 440,
          protein: 16.5,
          carbs: 58.0,
          fats: 16.0,
          fiber: 11.2,
          sodium: 340,
        },
      },
      {
        foodItem: VERIFIED_FOOD_DATABASE.find((f) => f.id === 'f-paneer-raw') || VERIFIED_FOOD_DATABASE[0],
        quantity: 0.7,
        calculatedNutrition: {
          calories: 185,
          protein: 12.8,
          carbs: 2.4,
          fats: 14.5,
          calcium: 336,
        },
      },
    ],
    totalNutrition: {
      calories: 625,
      protein: 29.3,
      carbs: 60.4,
      fats: 30.5,
      fiber: 12.0,
      sodium: 360,
    },
    photoUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop&q=80',
    notes: 'Mediterranean Rainbow Bowl with grilled paneer cubes',
    aiAnalyzed: true,
  },
  {
    id: 'meal-sn-01',
    date: new Date().toISOString().split('T')[0],
    time: '16:45',
    mealType: 'snack',
    items: [
      {
        foodItem: VERIFIED_FOOD_DATABASE.find((f) => f.id === 'f-greek-yogurt') || VERIFIED_FOOD_DATABASE[0],
        quantity: 1.5,
        calculatedNutrition: {
          calories: 135,
          protein: 22.5,
          carbs: 9.0,
          fats: 0.0,
          calcium: 225,
        },
      },
      {
        foodItem: VERIFIED_FOOD_DATABASE.find((f) => f.id === 'f-oats-porridge') || VERIFIED_FOOD_DATABASE[0],
        quantity: 1.6,
        calculatedNutrition: {
          calories: 362,
          protein: 11.9,
          carbs: 60.1,
          fats: 6.2,
          fiber: 7.5,
        },
      },
    ],
    totalNutrition: {
      calories: 497,
      protein: 34.4,
      carbs: 69.1,
      fats: 6.2,
      fiber: 8.0,
      sodium: 90,
    },
    photoUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80',
    notes: 'Post-workout Greek yogurt and oats crunch',
  },
];

export const DEFAULT_WEIGHT_LOGS: WeightLog[] = [
  { id: 'w-1', date: '2026-09-01', weightKg: 59.2, bmi: 22.8 },
  { id: 'w-2', date: '2026-09-04', weightKg: 58.8, bmi: 22.7 },
  { id: 'w-3', date: '2026-09-07', weightKg: 58.4, bmi: 22.5 },
  { id: 'w-4', date: '2026-09-10', weightKg: 58.0, bmi: 22.4, notes: 'Target on track' },
];

export const DEFAULT_REMINDERS: SmartReminder[] = [
  {
    id: 'rem-bk',
    type: 'breakfast',
    title: 'Nourishing Breakfast',
    time: '08:30',
    enabled: true,
    message: 'Time to log your morning fuel and balance your protein!',
  },
  {
    id: 'rem-ln',
    type: 'lunch',
    title: 'Midday Meal Log',
    time: '13:00',
    enabled: true,
    message: 'Take a mindful pause for lunch. What colorful foods are on your plate?',
  },
  {
    id: 'rem-dn',
    type: 'dinner',
    title: 'Dinner Check-In',
    time: '19:45',
    enabled: true,
    message: 'Log your dinner to close out your daily energy balance.',
  },
  {
    id: 'rem-water',
    type: 'water',
    title: 'Hydration Refresh',
    time: '11:00',
    enabled: true,
    message: 'Drink a glass of water. Aiming for 8 cups today!',
  },
  {
    id: 'rem-fest',
    type: 'festival_prep',
    title: 'Festival Preparation Reminder',
    time: '10:00',
    enabled: true,
    message: 'Navratri & Diwali festive season is approaching! Check your pre-event balance plan.',
  },
];

export const DEFAULT_EXERCISES: ExerciseRecommendation[] = [
  {
    id: 'ex-1',
    title: 'Post-Dinner Glucose Balance Walk',
    category: 'post_meal_neat',
    durationMinutes: 25,
    caloriesBurned: 110,
    intensity: 'light',
    rationale: 'Lowers post-prandial blood sugar spikes by 25% and supports digestive comfort.',
    completed: true,
  },
  {
    id: 'ex-2',
    title: 'Full Body Functional Dumbbell Circuit',
    category: 'strength',
    durationMinutes: 35,
    caloriesBurned: 220,
    intensity: 'moderate',
    rationale: 'Stimulates muscle protein synthesis and supports metabolic lean mass.',
    completed: false,
  },
  {
    id: 'ex-3',
    title: 'Gentle Evening Yoga & Breathwork',
    category: 'mobility',
    durationMinutes: 20,
    caloriesBurned: 65,
    intensity: 'light',
    rationale: 'Lowers evening cortisol and optimizes deep regenerative sleep.',
    completed: false,
  },
];

export const RECOMMENDED_MEALS_SEED: MealRecommendation[] = [
  {
    id: 'rec-1',
    title: 'Lemon Herb Grilled Tofu & Warm Quinoa Salad',
    mealType: 'dinner',
    calories: 380,
    protein: 24,
    carbs: 38,
    fats: 14,
    fiber: 8,
    prepTimeMinutes: 20,
    ingredients: ['Firm Tofu 150g', 'Cooked Quinoa 100g', 'Baby Spinach', 'Cherry Tomatoes', 'Extra Virgin Olive Oil', 'Lemon Juice'],
    tags: ['High Protein', 'Vegetarian', 'Gluten Free'],
    reason: 'Fits your remaining 548 kcal and delivers 24g of clean plant protein to hit your daily goal.',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'rec-2',
    title: 'Creamy Avocado Edamame Protein Bowl',
    mealType: 'dinner',
    calories: 420,
    protein: 26,
    carbs: 32,
    fats: 18,
    fiber: 10,
    prepTimeMinutes: 15,
    ingredients: ['Edamame beans', 'Hass Avocado', 'Cucumber ribbons', 'Roasted sesame seeds', 'Brown Rice base'],
    tags: ['Heart Healthy', 'High Fiber', 'Vegan'],
    reason: 'High in potassium and healthy fats, ideal for balancing tomorrow\'s festive occasion.',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'rec-3',
    title: 'Warm Spiced Dal Tadka with Steamed Brown Rice',
    mealType: 'dinner',
    calories: 340,
    protein: 16,
    carbs: 56,
    fats: 6,
    fiber: 9,
    prepTimeMinutes: 25,
    ingredients: ['Yellow lentils', 'Cumin & turmeric', 'Baby spinach', 'Brown rice', 'Ghee 1 tsp'],
    tags: ['Comfort Food', 'High Fiber', 'Ayurvedic Digest'],
    reason: 'Easily digestible and soothing before festive celebrations.',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80',
  },
];

// Pre-seeded Demo Accounts
const DEFAULT_ACCOUNTS: UserAccount[] = [
  {
    id: 'usr-maya-01',
    email: 'maya@nutritrack.ai',
    name: 'Maya',
    password: 'password123',
    createdAt: '2026-05-20',
    profile: DEFAULT_USER_PROFILE,
    meals: DEFAULT_INITIAL_MEALS,
    weightLogs: DEFAULT_WEIGHT_LOGS,
    water: { date: new Date().toISOString().split('T')[0], cups: 5, targetCups: 8 },
    events: DEFAULT_CALENDAR_EVENTS,
    reminders: DEFAULT_REMINDERS,
    exercises: DEFAULT_EXERCISES,
  },
  {
    id: 'usr-alex-02',
    email: 'alex@nutritrack.ai',
    name: 'Alex',
    password: 'password123',
    createdAt: '2026-06-01',
    profile: {
      id: 'usr-alex-02',
      name: 'Alex',
      age: 25,
      gender: 'male',
      heightCm: 180,
      weightKg: 75,
      targetWeightKg: 78,
      targetDate: '2026-12-15',
      activityLevel: 'very_active',
      goal: 'build_muscle',
      dietaryPreference: 'non_veg',
      allergies: [],
      dislikedFoods: [],
      dailyCalorieTarget: 2750,
      dailyProteinTarget: 155,
      dailyCarbsTarget: 330,
      dailyFatsTarget: 75,
      streakDays: 6,
      lastActiveDate: new Date().toISOString().split('T')[0],
    },
    meals: [
      {
        id: 'meal-alex-bk',
        date: new Date().toISOString().split('T')[0],
        time: '08:00',
        mealType: 'breakfast',
        items: [
          {
            foodItem: VERIFIED_FOOD_DATABASE.find((f) => f.id === 'f-egg-boiled') || VERIFIED_FOOD_DATABASE[0],
            quantity: 3,
            calculatedNutrition: { calories: 234, protein: 19.5, carbs: 1.8, fats: 15.9 },
          },
          {
            foodItem: VERIFIED_FOOD_DATABASE.find((f) => f.id === 'f-oats-porridge') || VERIFIED_FOOD_DATABASE[0],
            quantity: 1.5,
            calculatedNutrition: { calories: 330, protein: 11.2, carbs: 57.0, fats: 6.3 },
          },
        ],
        totalNutrition: { calories: 564, protein: 30.7, carbs: 58.8, fats: 22.2 },
      },
      {
        id: 'meal-alex-ln',
        date: new Date().toISOString().split('T')[0],
        time: '13:00',
        mealType: 'lunch',
        items: [
          {
            foodItem: VERIFIED_FOOD_DATABASE.find((f) => f.id === 'f-chicken-breast') || VERIFIED_FOOD_DATABASE[0],
            quantity: 2,
            calculatedNutrition: { calories: 330, protein: 62.0, carbs: 0.0, fats: 7.2 },
          },
          {
            foodItem: VERIFIED_FOOD_DATABASE.find((f) => f.id === 'f-brown-rice') || VERIFIED_FOOD_DATABASE[0],
            quantity: 1.5,
            calculatedNutrition: { calories: 247, protein: 5.2, carbs: 52.5, fats: 1.9 },
          },
        ],
        totalNutrition: { calories: 577, protein: 67.2, carbs: 52.5, fats: 9.1 },
      },
    ],
    weightLogs: [
      { id: 'w-al-1', date: '2026-09-01', weightKg: 74.2, bmi: 22.9 },
      { id: 'w-al-2', date: '2026-09-05', weightKg: 74.6, bmi: 23.0 },
      { id: 'w-al-3', date: '2026-09-10', weightKg: 75.0, bmi: 23.1, notes: 'Hypertrophy target' },
    ],
    water: { date: new Date().toISOString().split('T')[0], cups: 7, targetCups: 8 },
    events: DEFAULT_CALENDAR_EVENTS,
    reminders: DEFAULT_REMINDERS,
    exercises: DEFAULT_EXERCISES,
  },
];

const isBrowser = typeof window !== 'undefined';

// --- Multi-User Account Management & Backend Persistence Sync ---

export function syncActiveAccountToBackend(): void {
  if (!isBrowser) return;
  try {
    const acc = getActiveAccount();
    if (!acc || acc.id === 'guest') return;
    fetch('/api/user/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: acc.id,
        payload: {
          profile: acc.profile,
          meals: acc.meals,
          weightLogs: acc.weightLogs,
          water: acc.water,
          events: acc.events,
          reminders: acc.reminders,
        },
      }),
    }).catch((err) => console.warn('Background backend sync failed:', err));
  } catch (err) {
    console.warn('Sync error:', err);
  }
}

export async function fetchBackendAccounts(): Promise<UserAccount[]> {
  if (!isBrowser) return DEFAULT_ACCOUNTS;
  try {
    const res = await fetch('/api/auth/users');
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.users)) {
        const local = getAllAccounts();
        const localMap = new Map(local.map((a) => [a.id, a]));
        data.users.forEach((remoteUser: any) => {
          if (!localMap.has(remoteUser.id)) {
            localMap.set(remoteUser.id, {
              id: remoteUser.id,
              name: remoteUser.name,
              email: remoteUser.email,
              createdAt: remoteUser.createdAt,
              profile: remoteUser.profile,
              meals: [],
              weightLogs: [],
              water: { date: new Date().toISOString().split('T')[0], cups: 0, targetCups: 8 },
              events: DEFAULT_CALENDAR_EVENTS,
              reminders: DEFAULT_REMINDERS,
              exercises: DEFAULT_EXERCISES,
            });
          }
        });
        const merged = Array.from(localMap.values());
        saveAllAccounts(merged);
        return merged;
      }
    }
  } catch (e) {
    console.warn('Backend accounts fetch failed:', e);
  }
  return getAllAccounts();
}

export function getAllAccounts(): UserAccount[] {
  if (!isBrowser) return DEFAULT_ACCOUNTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(DEFAULT_ACCOUNTS));
      return DEFAULT_ACCOUNTS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_ACCOUNTS;
  }
}

export function saveAllAccounts(accounts: UserAccount[]): void {
  if (!isBrowser) return;
  localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
}

export function getActiveAccountId(): string {
  if (!isBrowser) return 'usr-maya-01';
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVE_USER_ID);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_USER_ID, 'usr-maya-01');
      return 'usr-maya-01';
    }
    return raw;
  } catch {
    return 'usr-maya-01';
  }
}

export function getActiveAccount(): UserAccount {
  const accounts = getAllAccounts();
  const activeId = getActiveAccountId();
  return accounts.find((a) => a.id === activeId) || accounts[0] || DEFAULT_ACCOUNTS[0];
}

export function setActiveAccount(accountId: string): void {
  if (!isBrowser) return;
  localStorage.setItem(STORAGE_KEYS.ACTIVE_USER_ID, accountId);
  notifyAllUpdated();
}

export function notifyAllUpdated(): void {
  if (!isBrowser) return;
  window.dispatchEvent(new Event('nutritrack_auth_changed'));
  window.dispatchEvent(new Event('nutritrack_profile_updated'));
  window.dispatchEvent(new Event('nutritrack_meals_updated'));
  window.dispatchEvent(new Event('nutritrack_water_updated'));
  window.dispatchEvent(new Event('nutritrack_events_updated'));
  window.dispatchEvent(new Event('nutritrack_weight_updated'));
  window.dispatchEvent(new Event('nutritrack_reminders_updated'));
}

export function updateActiveAccount(updater: (account: UserAccount) => UserAccount): void {
  if (!isBrowser) return;
  const accounts = getAllAccounts();
  const activeId = getActiveAccountId();
  const updatedAccounts = accounts.map((acc) => (acc.id === activeId ? updater(acc) : acc));
  saveAllAccounts(updatedAccounts);
}

// User Registration with both local persistence and backend database save
export function registerNewUser(
  email: string,
  name: string,
  password: string,
  profileData: Partial<UserProfile>
): { success: boolean; account?: UserAccount; error?: string } {
  const accounts = getAllAccounts();
  const existing = accounts.find((a) => a.email.toLowerCase() === email.toLowerCase().trim());
  if (existing) {
    return { success: false, error: 'An account with this email already exists.' };
  }

  const newId = `usr-${Date.now()}`;
  const fullProfile: UserProfile = {
    id: newId,
    name: name.trim() || 'Wellness Explorer',
    age: profileData.age || 25,
    gender: profileData.gender || 'other',
    heightCm: profileData.heightCm || 170,
    weightKg: profileData.weightKg || 65,
    targetWeightKg: profileData.targetWeightKg || 62,
    targetDate: profileData.targetDate || '2026-12-31',
    activityLevel: profileData.activityLevel || 'moderate',
    goal: profileData.goal || 'improve_health',
    dietaryPreference: profileData.dietaryPreference || 'all',
    allergies: profileData.allergies || [],
    dislikedFoods: [],
    dailyCalorieTarget: profileData.dailyCalorieTarget || 2000,
    dailyProteinTarget: profileData.dailyProteinTarget || 100,
    dailyCarbsTarget: profileData.dailyCarbsTarget || 220,
    dailyFatsTarget: profileData.dailyFatsTarget || 55,
    streakDays: 1,
    lastActiveDate: new Date().toISOString().split('T')[0],
  };

  const newAccount: UserAccount = {
    id: newId,
    email: email.trim().toLowerCase(),
    name: name.trim(),
    password,
    createdAt: new Date().toISOString().split('T')[0],
    profile: fullProfile,
    meals: [],
    weightLogs: [{ id: `w-${Date.now()}`, date: new Date().toISOString().split('T')[0], weightKg: fullProfile.weightKg, bmi: 22.5 }],
    water: { date: new Date().toISOString().split('T')[0], cups: 0, targetCups: 8 },
    events: DEFAULT_CALENDAR_EVENTS,
    reminders: DEFAULT_REMINDERS,
    exercises: DEFAULT_EXERCISES,
  };

  const updated = [...accounts, newAccount];
  saveAllAccounts(updated);
  setActiveAccount(newId);

  // Note profile to backend database asynchronously
  fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: newAccount.email,
      name: newAccount.name,
      password: newAccount.password,
      profile: newAccount.profile,
    }),
  }).catch((err) => console.warn('Backend registration failed:', err));

  return { success: true, account: newAccount };
}

// User Sign In with fallback to server database if not found locally
export function loginUser(email: string, password?: string): { success: boolean; account?: UserAccount; error?: string } {
  const accounts = getAllAccounts();
  const cleanEmail = email.toLowerCase().trim();
  const match = accounts.find((a) => a.email.toLowerCase() === cleanEmail);

  if (match) {
    if (password && match.password && match.password !== password) {
      return { success: false, error: 'Incorrect password.' };
    }
    setActiveAccount(match.id);
    syncActiveAccountToBackend();
    return { success: true, account: match };
  }

  // If not in local storage, attempt server check in background / async
  loginUserFromServer(email, password).catch((err) => console.warn('Server login error:', err));
  return { success: false, error: 'No account found with this email. Please check credentials or sign up.' };
}

// Async Login from Backend
export async function loginUserFromServer(
  email: string,
  password?: string
): Promise<{ success: boolean; account?: UserAccount; error?: string }> {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (data.success && data.account) {
      const accounts = getAllAccounts();
      const existing = accounts.find((a) => a.id === data.account.id);
      if (!existing) {
        accounts.push(data.account);
        saveAllAccounts(accounts);
      }
      setActiveAccount(data.account.id);
      return { success: true, account: data.account };
    }
    return { success: false, error: data.error || 'Server login failed' };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error';
    return { success: false, error: msg };
  }
}

// User Log Out
export function logoutUser(): void {
  setActiveAccount('guest');
}

// --- Isolated Per-Profile Data Accessors ---

export function getStoredProfile(): UserProfile {
  if (!isBrowser) return DEFAULT_USER_PROFILE;
  const account = getActiveAccount();
  return account.profile || DEFAULT_USER_PROFILE;
}

export function saveStoredProfile(profile: UserProfile): void {
  updateActiveAccount((acc) => ({ ...acc, profile, name: profile.name }));
  notifyAllUpdated();
  syncActiveAccountToBackend();
}

export function getStoredMeals(): MealLog[] {
  if (!isBrowser) return DEFAULT_INITIAL_MEALS;
  const account = getActiveAccount();
  return account.meals || [];
}

export function saveStoredMeals(meals: MealLog[]): void {
  updateActiveAccount((acc) => ({ ...acc, meals }));
  notifyAllUpdated();
  syncActiveAccountToBackend();
}

export function addMealLog(meal: MealLog): void {
  const current = getStoredMeals();
  const updated = [meal, ...current];
  saveStoredMeals(updated);
}

export function deleteMealLog(mealId: string): void {
  const current = getStoredMeals();
  const updated = current.filter((m) => m.id !== mealId);
  saveStoredMeals(updated);
}

export function getStoredEvents(): CalendarEvent[] {
  if (!isBrowser) return DEFAULT_CALENDAR_EVENTS;
  const account = getActiveAccount();
  const rawEvents = account.events && account.events.length > 0 ? account.events : DEFAULT_CALENDAR_EVENTS;
  // Automatically remove expired Ganesh Chaturthi event
  const filtered = rawEvents.filter((e) => e.id !== 'evt-ganesh-chaturthi' && !e.title.toLowerCase().includes('ganesh'));
  return filtered.length > 0 ? filtered : DEFAULT_CALENDAR_EVENTS;
}

export function saveStoredEvents(events: CalendarEvent[]): void {
  updateActiveAccount((acc) => ({ ...acc, events }));
  notifyAllUpdated();
  syncActiveAccountToBackend();
}

export function addCalendarEvent(event: CalendarEvent): void {
  const current = getStoredEvents();
  const updated = [...current, event];
  saveStoredEvents(updated);
}

export function updateCalendarEvent(updatedEvent: CalendarEvent): void {
  const current = getStoredEvents();
  const updated = current.map((e) => (e.id === updatedEvent.id ? updatedEvent : e));
  saveStoredEvents(updated);
}

export function getStoredWeightLogs(): WeightLog[] {
  if (!isBrowser) return DEFAULT_WEIGHT_LOGS;
  const account = getActiveAccount();
  return account.weightLogs && account.weightLogs.length > 0 ? account.weightLogs : DEFAULT_WEIGHT_LOGS;
}

export function saveStoredWeightLogs(logs: WeightLog[]): void {
  updateActiveAccount((acc) => ({ ...acc, weightLogs: logs }));
  notifyAllUpdated();
  syncActiveAccountToBackend();
}

export function getStoredWater(): WaterLog {
  const today = new Date().toISOString().split('T')[0];
  if (!isBrowser) return { date: today, cups: 5, targetCups: 8 };
  const account = getActiveAccount();
  const water = account.water || { date: today, cups: 0, targetCups: 8 };
  if (water.date !== today) {
    return { date: today, cups: 0, targetCups: 8 };
  }
  return water;
}

export function saveStoredWater(log: WaterLog): void {
  updateActiveAccount((acc) => ({ ...acc, water: log }));
  notifyAllUpdated();
  syncActiveAccountToBackend();
}

export function getStoredReminders(): SmartReminder[] {
  if (!isBrowser) return DEFAULT_REMINDERS;
  const account = getActiveAccount();
  return account.reminders && account.reminders.length > 0 ? account.reminders : DEFAULT_REMINDERS;
}

export function saveStoredReminders(reminders: SmartReminder[]): void {
  updateActiveAccount((acc) => ({ ...acc, reminders }));
  notifyAllUpdated();
  syncActiveAccountToBackend();
}

export function getStoredExercises(): ExerciseRecommendation[] {
  if (!isBrowser) return DEFAULT_EXERCISES;
  const account = getActiveAccount();
  return account.exercises && account.exercises.length > 0 ? account.exercises : DEFAULT_EXERCISES;
}

export function saveStoredExercises(exercises: ExerciseRecommendation[]): void {
  updateActiveAccount((acc) => ({ ...acc, exercises }));
  notifyAllUpdated();
  syncActiveAccountToBackend();
}

export function getStoredRoutinePlan(): GeneratedRoutinePlan | null {
  if (!isBrowser) return null;
  try {
    const account = getActiveAccount();
    if (account?.routinePlan) return account.routinePlan;
    const raw = localStorage.getItem(STORAGE_KEYS.ROUTINE_PLAN);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveStoredRoutinePlan(plan: GeneratedRoutinePlan): void {
  if (!isBrowser) return;
  try {
    localStorage.setItem(STORAGE_KEYS.ROUTINE_PLAN, JSON.stringify(plan));
    updateActiveAccount((acc) => ({
      ...acc,
      routinePlan: plan,
      profile: {
        ...acc.profile,
        name: plan.userName || acc.profile.name,
        age: plan.age || acc.profile.age,
        gender: plan.gender || acc.profile.gender,
        heightCm: plan.heightCm || acc.profile.heightCm,
        weightKg: plan.currentWeightKg || acc.profile.weightKg,
        targetWeightKg: plan.targetWeightKg || acc.profile.targetWeightKg,
        goal: plan.goal || acc.profile.goal,
        activityLevel: plan.activityLevel || acc.profile.activityLevel,
        dailyCalorieTarget: plan.dailyCalorieTarget,
        dailyProteinTarget: plan.dailyProteinTarget,
        dailyCarbsTarget: plan.dailyCarbsTarget,
        dailyFatsTarget: plan.dailyFatsTarget,
      },
      water: {
        ...acc.water,
        targetCups: plan.dailyWaterTargetCups,
      },
    }));
    notifyAllUpdated();
    syncActiveAccountToBackend();
    window.dispatchEvent(new Event('nutritrack_routine_updated'));
  } catch (e) {
    console.warn('Failed to save routine plan:', e);
  }
}


// --------------------------------------------------------------------------
// Mobile PWA Convenient Named Aliases
// --------------------------------------------------------------------------
export const getUserProfile = getStoredProfile;
export const saveUserProfile = saveStoredProfile;
export function getDailyMeals(date?: string): MealLog[] {
  const all = getStoredMeals();
  if (!date) return all;
  return all.filter((m) => m.date === date);
}
export const getWaterLog = getStoredWater;
export const saveWaterLog = saveStoredWater;
export const getReminders = getStoredReminders;
export const saveReminders = saveStoredReminders;
export const getRoutinePlan = getStoredRoutinePlan;
export const saveRoutinePlan = saveStoredRoutinePlan;
