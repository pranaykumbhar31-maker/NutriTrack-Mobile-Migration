export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export type EventType =
  | 'festival'
  | 'celebration'
  | 'wedding'
  | 'party'
  | 'birthday'
  | 'vacation'
  | 'restaurant_outing'
  | 'cheat_meal'
  | 'special_occasion';

export interface NutritionalInfo {
  calories: number;       // kcal
  protein: number;        // g
  carbs: number;          // g
  fats: number;           // g
  fiber?: number;         // g
  sodium?: number;        // mg
  sugar?: number;         // g
  potassium?: number;     // mg
  calcium?: number;       // mg
  iron?: number;          // mg
  vitaminA?: number;      // mcg
  vitaminC?: number;      // mg
}

export interface FoodItem extends NutritionalInfo {
  id: string;
  name: string;
  category: 'grain' | 'protein' | 'dairy' | 'vegetable' | 'fruit' | 'snack' | 'beverage' | 'festive' | 'curry' | 'composite';
  servingSize: number;
  servingUnit: string;    // 'g', 'cup', 'slice', 'piece', 'bowl', 'tbsp', 'serving'
  cuisine?: string;       // 'Indian', 'Mediterranean', 'Western', 'Asian', etc.
  confidence?: number;    // 0-1 for AI detected items
}

export interface MealLogItem {
  foodItem: FoodItem;
  quantity: number;       // Multiplier of servingSize
  calculatedNutrition: NutritionalInfo;
}

export interface MealLog {
  id: string;
  date: string;           // YYYY-MM-DD
  time: string;           // HH:mm
  mealType: MealType;
  items: MealLogItem[];
  totalNutrition: NutritionalInfo;
  photoUrl?: string;
  notes?: string;
  eventId?: string;       // Linked festival or celebration
  aiAnalyzed?: boolean;
}

export interface PreEventGuidance {
  preparationSummary: string;
  earlierDayMeals: string[];
  hydrationTargetLiters: number;
  smartSwaps: { original: string; healthierAlternative: string; reason: string }[];
  portionStrategy: string;
}

export interface DuringEventGuidance {
  mindfulReminders: string[];
  approximateTargetAllowance: number; // kcal
  enjoymentFocus: string;
}

export interface RecoveryPlan {
  nextMealSuggestion: {
    title: string;
    description: string;
    targetNutrients: string; // e.g. "High fiber, lean protein, rich potassium"
    recipeIdea: string;
  };
  nextDayPlan: string[];
  activitySuggestion: {
    type: string;
    durationMinutes: number;
    intensity: 'light' | 'moderate';
    purpose: string; // e.g., "gentle metabolic circulation & blood glucose balance"
  };
  hydrationGuidance: string;
  mentalNote: string; // Non-punitive reinforcement
}

export interface EventImpactReport {
  eventId: string;
  eventName: string;
  date: string;
  foodsConsumed: string[];
  estimatedNutrition: NutritionalInfo;
  comparedWithNormal: {
    calorieDiffPercent: number; // e.g. +35%
    status: 'above' | 'near' | 'below';
    details: string;
  };
  potentialPatterns: ('high_sugar' | 'high_fat' | 'high_calorie' | 'high_sodium' | 'balanced' | 'carb_heavy')[];
  recommendedNextStep: string;
  recoveryBalancePlan: RecoveryPlan;
  safeMessaging: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  type: EventType;
  date: string;           // YYYY-MM-DD
  endDate?: string;       // Optional for multi-day festivals
  description: string;
  badgeColor?: string;
  preEventPlan: PreEventGuidance;
  duringEventGuidance: DuringEventGuidance;
  recoveryPlan: RecoveryPlan;
  loggedMealIds?: string[];
  impactReport?: EventImpactReport;
  isCustom?: boolean;
}

export interface WeightLog {
  id: string;
  date: string;           // YYYY-MM-DD
  weightKg: number;
  bmi: number;
  notes?: string;
}

export interface WaterLog {
  date: string;           // YYYY-MM-DD
  cups: number;           // Target 8 cups (250ml each = 2L)
  targetCups: number;
}

export interface ExerciseRecommendation {
  id: string;
  title: string;
  category: 'cardio' | 'strength' | 'mobility' | 'post_meal_neat' | 'yoga';
  durationMinutes: number;
  caloriesBurned: number;
  intensity: 'light' | 'moderate' | 'high';
  rationale: string;
  completed?: boolean;
}

export interface MealRecommendation {
  id: string;
  title: string;
  mealType: MealType;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  prepTimeMinutes: number;
  ingredients: string[];
  tags: string[];
  reason: string;
  image?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  age: number;
  gender: 'female' | 'male' | 'other';
  heightCm: number;
  weightKg: number;
  targetWeightKg: number;
  targetDate: string;
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'very_active';
  goal: 'lose_fat' | 'build_muscle' | 'maintain' | 'improve_health';
  dietaryPreference: 'all' | 'vegetarian' | 'vegan' | 'eggetarian' | 'non_veg' | 'keto' | 'low_carb';
  allergies: string[];    // ['nuts', 'dairy', 'gluten', 'shellfish', 'soy', 'eggs']
  dislikedFoods: string[];
  dailyCalorieTarget: number;
  dailyProteinTarget: number;
  dailyCarbsTarget: number;
  dailyFatsTarget: number;
  streakDays: number;
  lastActiveDate: string;
}

export interface SmartReminder {
  id: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'water' | 'exercise' | 'weight' | 'festival_prep' | 'post_event';
  title: string;
  time: string;           // "08:30"
  enabled: boolean;
  message: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  actionSuggestions?: string[];
}

export interface RoutineExerciseItem {
  id: string;
  name: string;
  sets: number;
  repsOrDuration: string;
  restSeconds: number;
  targetMuscles: string;
  proFormTip: string;
}

export interface DailyWorkoutRoutine {
  dayNumber: number;
  dayName: string;
  focusTitle: string;
  category: 'strength' | 'cardio' | 'hiit' | 'recovery' | 'hybrid' | 'rest';
  durationMinutes: number;
  estimatedBurnKcal: number;
  intensity: 'Low' | 'Moderate' | 'High';
  warmup: string[];
  exercises: RoutineExerciseItem[];
  cooldown: string[];
}

export interface RoutineMealItem {
  id: string;
  timeOfDay: string;
  mealSlot: 'Early Morning' | 'Breakfast' | 'Mid-Morning Snack' | 'Lunch' | 'Evening Fuel' | 'Dinner' | 'Bedtime Routine';
  title: string;
  description: string;
  portion: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  benefits: string;
  alternatives: string[];
}

export interface RoutineHabitChecklistItem {
  id: string;
  label: string;
  timeHint: string;
  category: 'hydration' | 'nutrition' | 'fitness' | 'recovery';
  completed: boolean;
}

export interface GeneratedRoutinePlan {
  id: string;
  createdAt: string;
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

  // Calculated Metrics & Targets
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

  // Diet & Meal Routine
  meals: RoutineMealItem[];
  hydrationGuidelines: { time: string; amount: string; purpose: string }[];
  dietaryGuidelines: string[];

  // 7-Day Workout Routine
  weeklySplit: DailyWorkoutRoutine[];
  weeklyCardioTargetMinutes: number;
  dailyStepsTarget: number;

  // Daily Adherence Checklist
  dailyChecklist: RoutineHabitChecklistItem[];
}

export interface UserAccount {
  id: string;
  email: string;
  name: string;
  password?: string;
  avatarUrl?: string;
  createdAt: string;
  profile: UserProfile;
  meals: MealLog[];
  weightLogs: WeightLog[];
  water: WaterLog;
  events: CalendarEvent[];
  reminders: SmartReminder[];
  exercises: ExerciseRecommendation[];
  routinePlan?: GeneratedRoutinePlan;
}

