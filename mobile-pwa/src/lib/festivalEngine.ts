import {
  CalendarEvent,
  EventImpactReport,
  EventType,
  MealLog,
  NutritionalInfo,
  PreEventGuidance,
  DuringEventGuidance,
  RecoveryPlan,
  UserProfile,
} from './types';

/**
 * Generates tailored pre-event preparation guidance
 */
export function generatePreEventGuidance(eventType: EventType, eventTitle: string): PreEventGuidance {
  const isSweetHeavy = /ganesh|diwali|eid|birthday|cake|celebration/i.test(eventTitle);

  return {
    preparationSummary: `Prepare for ${eventTitle} with thoughtful balance. Enjoying cultural celebrations and special meals is a normal part of a healthy, vibrant life.`,
    earlierDayMeals: [
      'Breakfast: High-protein & fiber base (e.g., Vegetable Omelet with Avocado, or Greek Yogurt with Chia Seeds and Berries) to stabilize blood glucose.',
      'Lunch: Light, whole-food greens and lean protein (e.g., Grilled Tofu/Chicken Salad with Cucumbers, Lemon dressing, and Quinoa).',
      'Hydration: Drink 1.5 - 2 Liters of water before arriving to ensure optimal metabolic fluid balance.',
    ],
    hydrationTargetLiters: 2.5,
    smartSwaps: isSweetHeavy
      ? [
          {
            original: 'Deep-fried sweets (Jalebi / Gulab Jamun / Fried Modak)',
            healthierAlternative: 'Steamed Ukadiche Modak / Besan Ladoo / Kheer with nuts',
            reason: 'Delivers authentic festive flavors with steamed rice flour or roasted gram flour, significantly reducing oxidized cooking oils.',
          },
          {
            original: 'Sugary mocktails & sodas',
            healthierAlternative: 'Spiced Buttermilk (Chaas) / Mint Lime Infusion / Coconut Water',
            reason: 'Replenishes electrolytes and supports digestive ease throughout the gathering.',
          },
        ]
      : [
          {
            original: 'Cream-heavy appetizers & fried starters',
            healthierAlternative: 'Tandoori paneer/chicken skewers, roasted vegetable platters',
            reason: 'Provides lean protein and micronutrients while leaving room for the festive entree.',
          },
          {
            original: 'Multiple sweetened cocktails',
            healthierAlternative: 'Sparkling water with fresh lime and aromatic herbs',
            reason: 'Keeps you refreshed and hydrated without dehydration or sugar spikes.',
          },
        ],
    portionStrategy:
      'Practice mindful visual portioning: fill half your plate with salads or colorful preparations first, then add the festive delicacies you truly love. Eat slowly and savor every bite.',
  };
}

/**
 * Generates during-event guidance
 */
export function generateDuringEventGuidance(eventTitle: string, targetCalories: number): DuringEventGuidance {
  return {
    mindfulReminders: [
      'Take a 30-second pause before going for seconds to check your natural satiety level.',
      'Savor the textures and festive aromas without rushing or feeling guilty.',
      'Focus on connection, laughter, and the spirit of the occasion — food is only one part of the celebration.',
      'Keep a glass of water nearby to sip between treats.',
    ],
    approximateTargetAllowance: Math.round(targetCalories * 0.45), // ~45% allocated to the event feast
    enjoymentFocus: `Celebrate ${eventTitle} with presence and joy. A single festive meal does not undo your progress.`,
  };
}

/**
 * Generates scientifically sound, non-punitive post-event recovery plan
 */
export function generateRecoveryPlan(eventTitle: string, surplusCalories: number): RecoveryPlan {
  return {
    nextMealSuggestion: {
      title: 'Light Potassium-Rich Balance Bowl',
      description: 'A soothing, nutrient-dense bowl designed to support digestion and gentle electrolyte balance.',
      targetNutrients: 'High dietary fiber, plant potassium (to balance sodium), lean protein, zero refined sugars.',
      recipeIdea:
        'Warm vegetable dal soup with steamed zucchini, spinach, a pinch of roasted cumin, and 1 boiled egg or tofu cubes.',
    },
    nextDayPlan: [
      'Wake up: 1 tall glass of warm water with sliced lemon or cucumber.',
      'Breakfast: Return to your standard nutrient-dense breakfast (e.g. Oatmeal with flaxseeds or soft scrambled eggs with greens).',
      'Lunch: Generous colorful salad with legumes or grilled chicken/fish, whole grain toast.',
      'Dinner: Light steamed or roasted vegetables with lentil soup or paneer.',
      'Mindset: Do NOT skip any meals! Consistent regular meal timing tells your body it is safe and stable.',
    ],
    activitySuggestion: {
      type: 'Relaxing 25-minute scenic outdoor walk or gentle yoga flow',
      durationMinutes: 25,
      intensity: 'light',
      purpose:
        'Supports natural post-prandial glucose clearance, boosts serotonin, and gently aids gut motility without physical stress.',
    },
    hydrationGuidance:
      'Aim for 2.5 - 3.0 Liters of water today. Higher festive sodium and carbohydrate intake naturally bonds with water in your glycogen stores — staying hydrated helps flush excess sodium gently.',
    mentalNote:
      'Important reminder: One celebratory feast or festive day is just a data point in a lifelong journey. Your body knows how to find balance — simply return to your normal nourishing routine today.',
  };
}

/**
 * Analyzes foods consumed during an event and generates the Event Impact Insights Report
 */
export function generateEventImpactReport(
  event: CalendarEvent,
  eventMeals: MealLog[],
  userProfile: UserProfile
): EventImpactReport {
  // Aggregate nutrition of all meals logged under this event
  const totalNutrition: NutritionalInfo = eventMeals.reduce(
    (acc, meal) => ({
      calories: acc.calories + (meal.totalNutrition.calories || 0),
      protein: acc.protein + (meal.totalNutrition.protein || 0),
      carbs: acc.carbs + (meal.totalNutrition.carbs || 0),
      fats: acc.fats + (meal.totalNutrition.fats || 0),
      sodium: (acc.sodium || 0) + (meal.totalNutrition.sodium || 0),
      sugar: (acc.sugar || 0) + (meal.totalNutrition.sugar || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fats: 0, sodium: 0, sugar: 0 }
  );

  // Extract food names
  const foodsConsumed: string[] = [];
  eventMeals.forEach((m) => {
    m.items.forEach((item) => {
      foodsConsumed.push(`${item.foodItem.name} (${item.quantity} ${item.foodItem.servingUnit})`);
    });
  });

  // Calculate comparison with typical daily allocation (~600-800 kcal typical single meal)
  const typicalMealTarget = Math.round(userProfile.dailyCalorieTarget * 0.38);
  const calorieDiffPercent =
    typicalMealTarget > 0
      ? Math.round(((totalNutrition.calories - typicalMealTarget) / typicalMealTarget) * 100)
      : 0;

  let status: 'above' | 'near' | 'below' = 'near';
  let statusDetails = 'Within standard celebration range';
  if (calorieDiffPercent > 18) {
    status = 'above';
    statusDetails = `${calorieDiffPercent}% above normal single meal baseline (very standard for festive events)`;
  } else if (calorieDiffPercent < -15) {
    status = 'below';
    statusDetails = `${Math.abs(calorieDiffPercent)}% below typical baseline`;
  }

  // Detect patterns
  const patterns: ('high_sugar' | 'high_fat' | 'high_calorie' | 'high_sodium' | 'balanced' | 'carb_heavy')[] = [];
  if ((totalNutrition.sugar || 0) > 30) patterns.push('high_sugar');
  if (totalNutrition.fats > 30) patterns.push('high_fat');
  if (totalNutrition.calories > typicalMealTarget * 1.3) patterns.push('high_calorie');
  if ((totalNutrition.sodium || 0) > 800) patterns.push('high_sodium');
  if (totalNutrition.carbs > 65) patterns.push('carb_heavy');
  if (patterns.length === 0) patterns.push('balanced');

  const recoveryPlan = generateRecoveryPlan(event.title, Math.max(0, totalNutrition.calories - typicalMealTarget));

  return {
    eventId: event.id,
    eventName: event.title,
    date: event.date,
    foodsConsumed: foodsConsumed.length > 0 ? foodsConsumed : ['Festive feast items recorded'],
    estimatedNutrition: totalNutrition,
    comparedWithNormal: {
      calorieDiffPercent,
      status,
      details: statusDetails,
    },
    potentialPatterns: patterns,
    recommendedNextStep:
      'Choose a lighter, nutrient-dense meal for your next eating window. Drink plenty of fresh water and enjoy a calm 20-minute evening walk.',
    recoveryBalancePlan: recoveryPlan,
    safeMessaging:
      'Celebrations and festivals do not define your long-term health trajectory. We do not recommend skipping meals or extreme restriction. Consistency over weeks is what drives real transformation.',
  };
}

/**
 * Built-in Calendar Events (e.g. Ganesh Chaturthi, Diwali, Birthdays, etc.)
 */
export const DEFAULT_CALENDAR_EVENTS: CalendarEvent[] = [
  {
    id: 'evt-navratri-garba',
    title: 'Navratri Festive Garba & Feasting',
    type: 'festival',
    date: '2026-10-10',
    description: 'Festive nine nights celebration with traditional Garba dance, fasting delicacies, and community feasts.',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    preEventPlan: generatePreEventGuidance('festival', 'Navratri Festive Garba'),
    duringEventGuidance: generateDuringEventGuidance('Navratri Festive Garba', 2100),
    recoveryPlan: generateRecoveryPlan('Navratri Festive Garba', 450),
  },
  {
    id: 'evt-weekend-dining',
    title: 'Weekend Social Dinner Outing',
    type: 'restaurant_outing',
    date: '2026-10-14',
    description: 'Dinner with friends at artisan Mediterranean bistro.',
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-300',
    preEventPlan: generatePreEventGuidance('restaurant_outing', 'Mediterranean Bistro Dinner'),
    duringEventGuidance: generateDuringEventGuidance('Mediterranean Bistro Dinner', 2100),
    recoveryPlan: generateRecoveryPlan('Mediterranean Bistro Dinner', 350),
  },
  {
    id: 'evt-diwali-grand',
    title: 'Diwali Celebration & Sweets Party',
    type: 'festival',
    date: '2026-10-28',
    description: 'Festival of lights with family dinners, festive sweets, dry fruits, and gifts.',
    badgeColor: 'bg-orange-100 text-orange-800 border-orange-300',
    preEventPlan: generatePreEventGuidance('festival', 'Diwali Celebration'),
    duringEventGuidance: generateDuringEventGuidance('Diwali Celebration', 2100),
    recoveryPlan: generateRecoveryPlan('Diwali Celebration', 600),
  },
];
