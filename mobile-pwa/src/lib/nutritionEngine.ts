import { UserProfile, NutritionalInfo, MealLog } from './types';

/**
 * Calculates Basal Metabolic Rate (BMR) using the clinically validated Mifflin-St Jeor Equation
 */
export function calculateBMR(profile: Pick<UserProfile, 'weightKg' | 'heightCm' | 'age' | 'gender'>): number {
  const { weightKg, heightCm, age, gender } = profile;
  // Mifflin-St Jeor:
  // Men: (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) + 5
  // Women: (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) - 161
  let bmr = 10 * weightKg + 6.25 * heightCm - 5 * age;
  if (gender === 'female') {
    bmr -= 161;
  } else {
    bmr += 5;
  }
  return Math.round(bmr);
}

/**
 * Calculates Total Daily Energy Expenditure (TDEE) and target calories based on goal
 */
export function calculateTargets(profile: UserProfile): {
  bmr: number;
  tdee: number;
  calorieTarget: number;
  proteinTarget: number;
  carbsTarget: number;
  fatsTarget: number;
} {
  const bmr = calculateBMR(profile);
  
  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    very_active: 1.725,
  };

  const tdee = Math.round(bmr * (activityMultipliers[profile.activityLevel] || 1.375));

  // Goal adjustment
  let calorieTarget = tdee;
  if (profile.goal === 'lose_fat') {
    calorieTarget = Math.round(tdee - 400); // Sustainable 350-500 kcal deficit
  } else if (profile.goal === 'build_muscle') {
    calorieTarget = Math.round(tdee + 250); // Lean surplus
  } else {
    calorieTarget = tdee;
  }

  // Ensure safe floor
  const safeFloor = profile.gender === 'female' ? 1300 : 1500;
  calorieTarget = Math.max(safeFloor, calorieTarget);

  // Macro distribution:
  // Protein: ~1.8g to 2.0g per kg of bodyweight
  const proteinTarget = Math.round(profile.weightKg * (profile.goal === 'build_muscle' ? 2.0 : 1.8));
  // Fats: ~25-28% of total calories (9 kcal/g)
  const fatsCalories = calorieTarget * 0.27;
  const fatsTarget = Math.round(fatsCalories / 9);
  // Carbs: Remainder of calories (4 kcal/g)
  const proteinCalories = proteinTarget * 4;
  const carbsCalories = Math.max(0, calorieTarget - (proteinCalories + fatsCalories));
  const carbsTarget = Math.round(carbsCalories / 4);

  return {
    bmr,
    tdee,
    calorieTarget,
    proteinTarget,
    carbsTarget,
    fatsTarget,
  };
}

/**
 * Calculates exact Body Mass Index (BMI) and categorization
 */
export function calculateBMI(weightKg: number, heightCm: number): {
  bmi: number;
  category: 'Underweight' | 'Normal' | 'Overweight' | 'Obese';
  color: string;
  healthyWeightRange: { min: number; max: number };
} {
  const heightM = heightCm / 100;
  const rawBMI = weightKg / (heightM * heightM);
  const bmi = Math.round(rawBMI * 10) / 10;

  let category: 'Underweight' | 'Normal' | 'Overweight' | 'Obese' = 'Normal';
  let color = 'text-emerald-600 bg-emerald-50 border-emerald-200';

  if (bmi < 18.5) {
    category = 'Underweight';
    color = 'text-amber-600 bg-amber-50 border-amber-200';
  } else if (bmi <= 24.9) {
    category = 'Normal';
    color = 'text-emerald-600 bg-emerald-50 border-emerald-200';
  } else if (bmi <= 29.9) {
    category = 'Overweight';
    color = 'text-amber-600 bg-amber-50 border-amber-200';
  } else {
    category = 'Obese';
    color = 'text-rose-600 bg-rose-50 border-rose-200';
  }

  const minWeight = Math.round(18.5 * heightM * heightM * 10) / 10;
  const maxWeight = Math.round(24.9 * heightM * heightM * 10) / 10;

  return {
    bmi,
    category,
    color,
    healthyWeightRange: { min: minWeight, max: maxWeight },
  };
}

/**
 * Aggregates daily nutrition consumption from logged meals
 */
export function aggregateDailyNutrition(meals: MealLog[]): NutritionalInfo {
  return meals.reduce<NutritionalInfo>(
    (acc, meal) => ({
      calories: Math.round(acc.calories + (meal.totalNutrition.calories || 0)),
      protein: Math.round((acc.protein + (meal.totalNutrition.protein || 0)) * 10) / 10,
      carbs: Math.round((acc.carbs + (meal.totalNutrition.carbs || 0)) * 10) / 10,
      fats: Math.round((acc.fats + (meal.totalNutrition.fats || 0)) * 10) / 10,
      fiber: Math.round(((acc.fiber || 0) + (meal.totalNutrition.fiber || 0)) * 10) / 10,
      sodium: Math.round((acc.sodium || 0) + (meal.totalNutrition.sodium || 0)),
      sugar: Math.round(((acc.sugar || 0) + (meal.totalNutrition.sugar || 0)) * 10) / 10,
      potassium: Math.round((acc.potassium || 0) + (meal.totalNutrition.potassium || 0)),
      calcium: Math.round((acc.calcium || 0) + (meal.totalNutrition.calcium || 0)),
      iron: Math.round(((acc.iron || 0) + (meal.totalNutrition.iron || 0)) * 10) / 10,
    }),
    {
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
      fiber: 0,
      sodium: 0,
      sugar: 0,
      potassium: 0,
      calcium: 0,
      iron: 0,
    }
  );
}

/**
 * Calculates nutrition score (0 - 100) based on balanced intake
 */
export function calculateNutritionScore(consumed: NutritionalInfo, targetCalories: number, targetProtein: number): {
  score: number;
  label: 'Exceptional' | 'Good' | 'Moderate' | 'Needs Attention';
} {
  if (consumed.calories === 0) return { score: 0, label: 'Needs Attention' };

  let points = 50; // Baseline

  // Calorie proximity (within ±15% = +25 pts)
  const calRatio = consumed.calories / targetCalories;
  if (calRatio >= 0.85 && calRatio <= 1.15) {
    points += 25;
  } else if (calRatio >= 0.7 && calRatio <= 1.3) {
    points += 15;
  } else {
    points += 5;
  }

  // Protein adequacy (>= 80% = +15 pts)
  const proRatio = consumed.protein / targetProtein;
  if (proRatio >= 0.8) {
    points += 15;
  } else if (proRatio >= 0.6) {
    points += 10;
  }

  // Fiber presence (>= 20g = +10 pts)
  if ((consumed.fiber || 0) >= 20) {
    points += 10;
  } else if ((consumed.fiber || 0) >= 12) {
    points += 5;
  }

  const score = Math.min(100, Math.max(20, points));

  let label: 'Exceptional' | 'Good' | 'Moderate' | 'Needs Attention' = 'Good';
  if (score >= 88) label = 'Exceptional';
  else if (score >= 70) label = 'Good';
  else if (score >= 50) label = 'Moderate';
  else label = 'Needs Attention';

  return { score, label };
}
