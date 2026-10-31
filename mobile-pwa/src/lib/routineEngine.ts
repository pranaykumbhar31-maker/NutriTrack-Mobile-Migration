import {
  GeneratedRoutinePlan,
  DailyWorkoutRoutine,
  RoutineMealItem,
  RoutineExerciseItem,
  RoutineHabitChecklistItem,
} from './types';
import { calculateBMR, calculateBMI } from './nutritionEngine';

export interface RoutineGeneratorInput {
  name: string;
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
}

/**
 * Intelligent Routine & Goal Generator Engine
 * Clinically calculates BMR (Mifflin-St Jeor), TDEE, Calorie Deficit/Surplus,
 * Macronutrients, Timed Daily Diet Chart, and 7-Day Workout Routine.
 */
export function generatePersonalizedRoutine(input: RoutineGeneratorInput): GeneratedRoutinePlan {
  const {
    name,
    age,
    gender,
    currentWeightKg,
    heightCm,
    targetWeightKg,
    goal,
    pace,
    activityLevel,
    dietaryPreference,
    allergies,
    workoutLocation,
  } = input;

  // 1. Core Biometric Calculations
  const bmiData = calculateBMI(currentWeightKg, heightCm);
  const bmr = calculateBMR({ weightKg: currentWeightKg, heightCm, age, gender });

  const activityMultipliers: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    very_active: 1.725,
  };
  const tdee = Math.round(bmr * (activityMultipliers[activityLevel] || 1.375));

  // 2. Goal & Pace Caloric Adjustment
  let calorieAdjustment = 0;
  let weeklyPaceKg = 0.5;

  if (pace === 'sustainable') weeklyPaceKg = 0.35;
  else if (pace === 'moderate') weeklyPaceKg = 0.55;
  else if (pace === 'accelerated') weeklyPaceKg = 0.85;

  if (goal === 'lose_fat') {
    const deficit = Math.round((weeklyPaceKg * 7700) / 7); // 7,700 kcal per kg of body fat
    calorieAdjustment = -Math.min(750, Math.max(350, deficit));
  } else if (goal === 'build_muscle') {
    // Lean surplus for muscle protein synthesis
    calorieAdjustment = pace === 'accelerated' ? 380 : 250;
  } else {
    // Maintenance / General Health
    calorieAdjustment = 0;
  }

  const safeFloor = gender === 'female' ? 1250 : 1500;
  const dailyCalorieTarget = Math.max(safeFloor, Math.round(tdee + calorieAdjustment));

  // 3. Macronutrient Distribution
  // Protein: High protein to protect muscle mass during fat loss, or stimulate growth
  let proteinMultiplier = 1.8;
  if (goal === 'build_muscle') proteinMultiplier = 2.1;
  else if (goal === 'lose_fat') proteinMultiplier = 2.0;

  const dailyProteinTarget = Math.round(currentWeightKg * proteinMultiplier);
  const proteinCalories = dailyProteinTarget * 4;

  // Fats: 25-28% of total calories
  const fatsCalories = dailyCalorieTarget * 0.27;
  const dailyFatsTarget = Math.round(fatsCalories / 9);

  // Carbs: Remaining calories
  const carbsCalories = Math.max(0, dailyCalorieTarget - (proteinCalories + fatsCalories));
  const dailyCarbsTarget = Math.round(carbsCalories / 4);

  // Fiber: 14g per 1000 kcal
  const dailyFiberTarget = Math.round((dailyCalorieTarget / 1000) * 14);

  // Hydration: 35ml per kg of bodyweight + exercise allowance
  const baseWaterLiters = Math.round(((currentWeightKg * 0.035) + 0.5) * 10) / 10;
  const dailyWaterTargetLiters = Math.max(2.2, Math.min(4.0, baseWaterLiters));
  const dailyWaterTargetCups = Math.round(dailyWaterTargetLiters * 4);

  // 4. Projected Timeline to Reach Goal
  const weightDiffKg = Math.abs(currentWeightKg - targetWeightKg);
  let projectedWeeks = Math.max(1, Math.round(weightDiffKg / (weeklyPaceKg || 0.5)));
  if (goal === 'maintain' || weightDiffKg === 0) projectedWeeks = 12;

  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + projectedWeeks * 7);
  const targetCompletionDate = targetDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  // 5. Generate Personalized Meal & Diet Routine Chart
  const isVeg = dietaryPreference === 'vegetarian' || dietaryPreference === 'vegan';
  const isVegan = dietaryPreference === 'vegan';
  const isKeto = dietaryPreference === 'keto';
  const hasDairyAllergy = allergies.some((a) => a.toLowerCase().includes('dairy') || a.toLowerCase().includes('lactose'));
  const hasGlutenAllergy = allergies.some((a) => a.toLowerCase().includes('gluten'));
  const hasEggAllergy = allergies.some((a) => a.toLowerCase().includes('egg'));

  const meals: RoutineMealItem[] = [
    {
      id: 'm-spark',
      timeOfDay: '07:00 AM',
      mealSlot: 'Early Morning',
      title: 'Metabolic & Hydration Kickstart',
      description: 'Warm filtered water with fresh squeezed lemon, 1 tbsp organic chia seeds, and a pinch of Himalayan pink salt.',
      portion: '1 large glass (350ml)',
      calories: 45,
      protein: 1.5,
      carbs: 4.0,
      fats: 2.5,
      fiber: 3.5,
      benefits: 'Gently hydrates cellular tissues, stimulates digestive enzymes, and provides soluble fiber for gut motility.',
      alternatives: ['Warm ginger tulsi tea with 1 tsp soaked basil seeds', 'Pure electrolyte coconut water (150ml)'],
    },
    {
      id: 'm-breakfast',
      timeOfDay: '08:30 AM',
      mealSlot: 'Breakfast',
      title: isVegan
        ? 'Tofu Scramble with Avocado & Sprouted Toast'
        : isVeg || hasEggAllergy
        ? 'Paneer Vegetable Bhurji with Whole Wheat Toast'
        : 'Farm Fresh 3-Egg Veggie Omelet with Sourdough',
      description: isVegan
        ? 'Organic turmeric scrambled firm tofu with baby spinach, bell peppers, half sliced avocado, and gluten-friendly grain toast.'
        : isVeg || hasEggAllergy
        ? 'Spiced shredded fresh cottage cheese (paneer) sautéed with onions, tomatoes, baby spinach, paired with toasted artisanal bread.'
        : '2 whole pasture-raised eggs + 1 egg white folded with baby spinach, mushrooms, and cherry tomatoes, served with whole grain sourdough.',
      portion: isVegan ? '1 plate (280g)' : isVeg ? '1 plate (250g)' : '2 eggs + 1 slice toast (220g)',
      calories: Math.round(dailyCalorieTarget * 0.25),
      protein: Math.round(dailyProteinTarget * 0.28),
      carbs: isKeto ? 8 : Math.round(dailyCarbsTarget * 0.22),
      fats: Math.round(dailyFatsTarget * 0.25),
      fiber: 6.0,
      benefits: 'High bio-available protein suppresses morning ghrelin (hunger hormone) and keeps blood sugar stable throughout the morning.',
      alternatives: [
        'Thick Greek Yogurt Parfait with crushed almonds & berries',
        'High-protein cooked rolled oats with chia seeds, scoop of plant protein & cinnamon',
      ],
    },
    {
      id: 'm-snack-1',
      timeOfDay: '11:30 AM',
      mealSlot: 'Mid-Morning Snack',
      title: 'Cellular Antioxidant & Brain Fuel',
      description: hasDairyAllergy || isVegan
        ? 'Handful of raw Californian walnuts, pumpkin seeds, and a crisp green apple.'
        : 'Plain Greek yogurt (0% fat) topped with raw crushed almonds and a handful of fresh blueberries.',
      portion: '1 small bowl (130g)',
      calories: Math.round(dailyCalorieTarget * 0.12),
      protein: Math.round(dailyProteinTarget * 0.12),
      carbs: Math.round(dailyCarbsTarget * 0.12),
      fats: Math.round(dailyFatsTarget * 0.14),
      fiber: 4.0,
      benefits: 'Provides slow-burning omega-3 healthy fats and polyphenol antioxidants to sustain mental clarity before lunch.',
      alternatives: ['Roasted spiced chickpeas (makhana / chana)', 'Matcha green tea with 10 roasted almonds'],
    },
    {
      id: 'm-lunch',
      timeOfDay: '01:30 PM',
      mealSlot: 'Lunch',
      title: isVegan
        ? 'Mediterranean Quinoa Power Bowl with Chickpeas & Tahini'
        : isVeg
        ? 'Yellow Dal Tadka with Steamed Brown Rice & Palak Paneer'
        : 'Herb Grilled Chicken Breast with Quinoa & Steamed Greens',
      description: isVegan
        ? 'Cooked fluffy quinoa, spiced garbanzo chickpeas, cucumber, cherry tomatoes, kalamata olives, and a light lemon-tahini dressing.'
        : isVeg
        ? 'Comforting cumin-turmeric yellow lentil soup (dal), steamed brown basmati rice, paired with fresh spinach paneer.'
        : 'Lean seared chicken breast (or baked salmon), steamed brown basmati rice or quinoa, and a generous portion of sautéed greens.',
      portion: '1 large bowl (380g)',
      calories: Math.round(dailyCalorieTarget * 0.32),
      protein: Math.round(dailyProteinTarget * 0.35),
      carbs: isKeto ? 12 : Math.round(dailyCarbsTarget * 0.35),
      fats: Math.round(dailyFatsTarget * 0.30),
      fiber: 9.0,
      benefits: 'Anchor meal combining complete amino acids, complex low-glycemic carbohydrates, and essential micronutrients.',
      alternatives: [
        'Paneer Tikka with 2 Whole Wheat Rotis and Cucumber Raita',
        'Tofu & Broccoli Soba Noodle Bowl with Sesame Soy Glaze',
      ],
    },
    {
      id: 'm-snack-2',
      timeOfDay: '05:00 PM',
      mealSlot: 'Evening Fuel',
      title: 'Pre-Workout Energizer & Hydration',
      description: '1 organic ripe banana with 1 tbsp natural roasted peanut butter (or almond butter) and a tall glass of cool water.',
      portion: '1 snack serving (120g)',
      calories: Math.round(dailyCalorieTarget * 0.10),
      protein: Math.round(dailyProteinTarget * 0.08),
      carbs: Math.round(dailyCarbsTarget * 0.15),
      fats: Math.round(dailyFatsTarget * 0.10),
      fiber: 3.5,
      benefits: 'Fast-acting, gentle potassium and natural carbohydrates fuel muscle glycogen for your afternoon or evening workout.',
      alternatives: ['Black coffee / green tea + 2 rice cakes with almond butter', 'Roasted makhana (foxnuts) with turmeric and black pepper'],
    },
    {
      id: 'm-dinner',
      timeOfDay: '08:00 PM',
      mealSlot: 'Dinner',
      title: isVegan
        ? 'Hearty Spiced Lentil & Roasted Vegetable Stew'
        : isVeg
        ? 'Grilled Tofu/Paneer Bowl with Steamed Quinoa & Asparagus'
        : 'Wild Baked Salmon or Grilled Chicken with Roasted Veggies',
      description: isVegan
        ? 'Rich yellow and red lentils simmered with ginger, garlic, tomatoes, baby zucchini, and served with a side of steamed greens.'
        : isVeg
        ? 'Marinated paneer or firm tofu cubes pan-seared with bell peppers, onions, steamed quinoa, and tender asparagus florets.'
        : 'Oven-roasted wild salmon fillet seasoned with dill and lemon, paired with steamed asparagus, broccoli, and a small sweet potato.',
      portion: '1 plate (320g)',
      calories: Math.round(dailyCalorieTarget * 0.20),
      protein: Math.round(dailyProteinTarget * 0.20),
      carbs: isKeto ? 6 : Math.round(dailyCarbsTarget * 0.15),
      fats: Math.round(dailyFatsTarget * 0.20),
      fiber: 7.0,
      benefits: 'Light, nutrient-dense, and easy on nighttime digestion. High magnesium and tryptophan support natural sleep quality.',
      alternatives: [
        'Warm Mixed Vegetable Soup with Boiled Chickpea Garnish',
        'Zucchini Noodle Bowl with Garlic Tomato Basil Coulis & Crumbled Tofu',
      ],
    },
    {
      id: 'm-bedtime',
      timeOfDay: '09:45 PM',
      mealSlot: 'Bedtime Routine',
      title: 'Restorative Sleep & Recovery Elixir',
      description: 'Warm chamomile or golden turmeric almond milk infused with crushed cardamom, a pinch of black pepper, and cinnamon.',
      portion: '1 warm mug (220ml)',
      calories: 35,
      protein: 1.0,
      carbs: 2.5,
      fats: 2.0,
      fiber: 0.5,
      benefits: 'Curcumin and apigenin flavonoids soothe nervous system inflammation and facilitate deep REM sleep.',
      alternatives: ['Warm peppermint herbal infusion', 'Magnesium glycinate water'],
    },
  ];

  // 6. Generate 7-Day Structured Workout Split
  const isGym = workoutLocation === 'gym';
  const isHome = workoutLocation === 'home_dumbbells';

  const weeklySplit: DailyWorkoutRoutine[] = [
    {
      dayNumber: 1,
      dayName: 'Monday',
      focusTitle: isGym ? 'Upper Body Push: Chest, Shoulders & Triceps' : isHome ? 'Dumbbell Upper Push & Core' : 'Bodyweight Upper Body & Core Strength',
      category: 'strength',
      durationMinutes: 45,
      estimatedBurnKcal: 320,
      intensity: 'Moderate',
      warmup: ['Arm circles & shoulder dislocates (2 mins)', 'Cat-cow spine articulation (2 mins)', 'Light push-ups on knees or wall (10 reps)'],
      exercises: isGym
        ? [
            { id: 'ex-1', name: 'Barbell or Dumbbell Bench Press', sets: 4, repsOrDuration: '8 - 10 reps', restSeconds: 75, targetMuscles: 'Chest, Front Delts', proFormTip: 'Keep shoulder blades retracted and lower the bar under control to mid-chest.' },
            { id: 'ex-2', name: 'Seated Dumbbell Overhead Shoulder Press', sets: 3, repsOrDuration: '10 - 12 reps', restSeconds: 60, targetMuscles: 'Shoulders, Upper Chest', proFormTip: 'Avoid overarching your lower back; brace your abdominal core tightly.' },
            { id: 'ex-3', name: 'Incline Dumbbell Chest Fly / Press', sets: 3, repsOrDuration: '12 reps', restSeconds: 60, targetMuscles: 'Upper Pectorals', proFormTip: 'Feel the deep stretch across your chest fibers before pressing upward.' },
            { id: 'ex-4', name: 'Cable Tricep Pushdown / Rope Extension', sets: 3, repsOrDuration: '12 - 15 reps', restSeconds: 45, targetMuscles: 'Triceps', proFormTip: 'Pin elbows to your ribcage and lock out triceps at the bottom.' },
            { id: 'ex-5', name: 'Hanging Knee Raises or Plank Hold', sets: 3, repsOrDuration: '45 seconds', restSeconds: 45, targetMuscles: 'Core, Abdominals', proFormTip: 'Curl pelvis upward to engage deep lower abdominals rather than hip flexors.' },
          ]
        : isHome
        ? [
            { id: 'ex-1', name: 'Dumbbell Floor Press or Incline Push-ups', sets: 4, repsOrDuration: '10 - 12 reps', restSeconds: 60, targetMuscles: 'Chest, Triceps', proFormTip: 'Touch elbows lightly to the floor to protect shoulder joints.' },
            { id: 'ex-2', name: 'Standing Dumbbell Overhead Press', sets: 3, repsOrDuration: '10 - 12 reps', restSeconds: 60, targetMuscles: 'Shoulders, Core', proFormTip: 'Squeeze glutes and abs to create a solid foundation.' },
            { id: 'ex-3', name: 'Dumbbell Lateral Shoulder Raises', sets: 3, repsOrDuration: '12 - 15 reps', restSeconds: 45, targetMuscles: 'Side Deltoids', proFormTip: 'Lead with your elbows and maintain a slight forward hinge.' },
            { id: 'ex-4', name: 'Overhead Dumbbell Tricep Extension', sets: 3, repsOrDuration: '12 reps', restSeconds: 45, targetMuscles: 'Triceps', proFormTip: 'Keep elbows pointing forward throughout the range of motion.' },
            { id: 'ex-5', name: 'Forearm Plank with Shoulder Taps', sets: 3, repsOrDuration: '45 seconds', restSeconds: 45, targetMuscles: 'Full Core', proFormTip: 'Resist hip rotation as your hand touches the opposite shoulder.' },
          ]
        : [
            { id: 'ex-1', name: 'Strict Floor Push-ups (or Elevated)', sets: 4, repsOrDuration: '10 - 15 reps', restSeconds: 60, targetMuscles: 'Chest, Arms', proFormTip: 'Maintain a rigid straight plank line from head to heels.' },
            { id: 'ex-2', name: 'Pike Push-ups (Shoulder Focus)', sets: 3, repsOrDuration: '8 - 10 reps', restSeconds: 60, targetMuscles: 'Shoulders, Upper Back', proFormTip: 'Elevate hips high and lower forehead toward the floor.' },
            { id: 'ex-3', name: 'Chair or Bench Tricep Dips', sets: 3, repsOrDuration: '12 - 15 reps', restSeconds: 45, targetMuscles: 'Triceps', proFormTip: 'Keep your back close to the bench to avoid shoulder impingement.' },
            { id: 'ex-4', name: 'Bear Crawl Hold with Knee Taps', sets: 3, repsOrDuration: '40 seconds', restSeconds: 45, targetMuscles: 'Core, Stability', proFormTip: 'Hover knees just 2 inches off the floor.' },
          ],
      cooldown: ['Chest door-frame stretch (1 min)', 'Cross-body shoulder stretch (1 min)', 'Deep diaphragmatic breathing (2 mins)'],
    },
    {
      dayNumber: 2,
      dayName: 'Tuesday',
      focusTitle: 'Lower Body Strength & Posterior Chain Power',
      category: 'strength',
      durationMinutes: 45,
      estimatedBurnKcal: 380,
      intensity: 'High',
      warmup: ['Bodyweight air squats (15 reps)', 'Leg swings forward & lateral (1 min each)', 'Glute bridges (12 reps)'],
      exercises: isGym
        ? [
            { id: 'ex-2-1', name: 'Barbell Back Squat or Leg Press', sets: 4, repsOrDuration: '8 - 10 reps', restSeconds: 90, targetMuscles: 'Quadriceps, Glutes', proFormTip: 'Push knees outward in line with your toes and drive through your heels.' },
            { id: 'ex-2-2', name: 'Romanian Deadlifts (RDL)', sets: 4, repsOrDuration: '10 reps', restSeconds: 75, targetMuscles: 'Hamstrings, Glutes', proFormTip: 'Hinge back at the hips with a flat spine until you feel a deep hamstring stretch.' },
            { id: 'ex-2-3', name: 'Walking Dumbbell Lunges', sets: 3, repsOrDuration: '10 reps per leg', restSeconds: 60, targetMuscles: 'Quads, Balance', proFormTip: 'Step forward smoothly with a 90-degree knee bend on both legs.' },
            { id: 'ex-2-4', name: 'Standing or Seated Calf Raises', sets: 3, repsOrDuration: '15 reps', restSeconds: 45, targetMuscles: 'Calves', proFormTip: 'Hold a 1-second peak contraction at the top of each rep.' },
          ]
        : [
            { id: 'ex-2-1', name: 'Goblet Squats (with Dumbbell or Kettlebell)', sets: 4, repsOrDuration: '12 reps', restSeconds: 60, targetMuscles: 'Quads, Glutes', proFormTip: 'Hold weight tight to chest and drop into a deep, controlled squat.' },
            { id: 'ex-2-2', name: 'Dumbbell Romanian Deadlifts', sets: 3, repsOrDuration: '12 reps', restSeconds: 60, targetMuscles: 'Hamstrings', proFormTip: 'Keep dumbbells brushing along your thighs throughout the hinge.' },
            { id: 'ex-2-3', name: 'Bulgarian Split Squats (Rear Foot Elevated)', sets: 3, repsOrDuration: '8 - 10 reps per leg', restSeconds: 60, targetMuscles: 'Glutes, Quads', proFormTip: 'Elevate rear foot on sofa or chair; keep front shin nearly vertical.' },
            { id: 'ex-2-4', name: 'Single-Leg Glute Bridges', sets: 3, repsOrDuration: '12 reps per leg', restSeconds: 45, targetMuscles: 'Gluteus Maximus', proFormTip: 'Drive through heel and squeeze glute at the very top.' },
          ],
      cooldown: ['Standing quad stretch (1 min per leg)', 'Seated hamstring stretch (1 min)', 'Pigeon pose hip opener (1 min per side)'],
    },
    {
      dayNumber: 3,
      dayName: 'Wednesday',
      focusTitle: 'Active Recovery, Mobility & Low-Impact Zone 2 Cardio',
      category: 'recovery',
      durationMinutes: 35,
      estimatedBurnKcal: 210,
      intensity: 'Low',
      warmup: ['Gentle neck & spinal rolls (2 mins)', 'World’s greatest stretch (5 reps each side)'],
      exercises: [
        { id: 'ex-3-1', name: 'Brisk Outdoor Walk or Incline Treadmill (Zone 2)', sets: 1, repsOrDuration: '25 minutes', restSeconds: 0, targetMuscles: 'Cardiovascular, Metabolism', proFormTip: 'Maintain a pace where you can comfortably speak in full sentences.' },
        { id: 'ex-3-2', name: 'Thoracic Spine Foam Rolling or Open Books', sets: 2, repsOrDuration: '10 reps per side', restSeconds: 30, targetMuscles: 'Mid-Back Mobility', proFormTip: 'Exhale deeply as you rotate your chest open.' },
        { id: 'ex-3-3', name: 'Deep Hip 90/90 Mobility Stretch', sets: 2, repsOrDuration: '1 minute per side', restSeconds: 30, targetMuscles: 'Hip Rotators', proFormTip: 'Sit tall and breathe slowly into tight hip capsules.' },
        { id: 'ex-3-4', name: 'Child’s Pose to Cobra Flow', sets: 2, repsOrDuration: '8 gentle cycles', restSeconds: 30, targetMuscles: 'Full Spine & Lats', proFormTip: 'Flow smoothly with your inhalation and exhalation.' },
      ],
      cooldown: ['Legs up the wall relaxation (3 mins)', 'Slow box breathing (4 sec in, 4 hold, 4 out, 4 hold)'],
    },
    {
      dayNumber: 4,
      dayName: 'Thursday',
      focusTitle: isGym ? 'Upper Body Pull: Back, Rear Delts & Biceps' : 'Back, Posture & Arm Sculpting',
      category: 'strength',
      durationMinutes: 45,
      estimatedBurnKcal: 310,
      intensity: 'Moderate',
      warmup: ['Scapular retractions & wall slides (2 mins)', 'Band pull-aparts (15 reps)'],
      exercises: isGym
        ? [
            { id: 'ex-4-1', name: 'Lat Pulldowns or Assisted Pull-Ups', sets: 4, repsOrDuration: '10 reps', restSeconds: 75, targetMuscles: 'Latissimus Dorsi', proFormTip: 'Pull through your elbows down toward your hips; avoid swinging back.' },
            { id: 'ex-4-2', name: 'Seated Cable Row or Barbell Row', sets: 3, repsOrDuration: '10 - 12 reps', restSeconds: 60, targetMuscles: 'Rhomboids, Mid-Back', proFormTip: 'Squeeze shoulder blades together for 1 full second at full contraction.' },
            { id: 'ex-4-3', name: 'Face Pulls with Cable Rope', sets: 3, repsOrDuration: '15 reps', restSeconds: 45, targetMuscles: 'Rear Delts, Rotator Cuff', proFormTip: 'Pull rope directly toward eye level while spreading wrists apart.' },
            { id: 'ex-4-4', name: 'Dumbbell Hammer Curls', sets: 3, repsOrDuration: '12 reps', restSeconds: 45, targetMuscles: 'Biceps, Forearms', proFormTip: 'Keep palms facing inward throughout the curl.' },
          ]
        : [
            { id: 'ex-4-1', name: 'Dumbbell Bent-Over Row', sets: 4, repsOrDuration: '12 reps', restSeconds: 60, targetMuscles: 'Lats, Upper Back', proFormTip: 'Hinge forward 45 degrees, pull elbows back toward your pockets.' },
            { id: 'ex-4-2', name: 'Single-Arm Dumbbell Row on Bench/Chair', sets: 3, repsOrDuration: '10 reps per side', restSeconds: 45, targetMuscles: 'Unilateral Back', proFormTip: 'Keep your torso parallel to the ground without twisting your spine.' },
            { id: 'ex-4-3', name: 'Prone Y-T-W Floor Raises', sets: 3, repsOrDuration: '8 cycles', restSeconds: 45, targetMuscles: 'Scapular Stabilizers', proFormTip: 'Lie on your stomach and lift arms into Y, T, and W shapes using back muscles.' },
            { id: 'ex-4-4', name: 'Standing Dumbbell Bicep Curls', sets: 3, repsOrDuration: '12 reps', restSeconds: 45, targetMuscles: 'Biceps', proFormTip: 'Avoid momentum; lower weights with a smooth 3-second negative.' },
          ],
      cooldown: ['Lat stretch on doorframe (1 min)', 'Cross-chest arm stretch (1 min)', 'Standing forward fold (1 min)'],
    },
    {
      dayNumber: 5,
      dayName: 'Friday',
      focusTitle: 'Full Body Metabolic Conditioning & Core Ignition',
      category: 'hybrid',
      durationMinutes: 40,
      estimatedBurnKcal: 390,
      intensity: 'High',
      warmup: ['Jumping jacks or step jacks (1 min)', 'Inchworms with push-up (5 reps)', 'High knees (30 secs)'],
      exercises: [
        { id: 'ex-5-1', name: 'Dumbbell or Kettlebell Thrusters (Squat to Press)', sets: 4, repsOrDuration: '10 reps', restSeconds: 60, targetMuscles: 'Quads, Shoulders, Heart Rate', proFormTip: 'Use explosive leg drive out of the squat to launch the weights overhead.' },
        { id: 'ex-5-2', name: 'Renegade Rows to Push-up', sets: 3, repsOrDuration: '8 reps total', restSeconds: 60, targetMuscles: 'Back, Core, Chest', proFormTip: 'Widen feet stance to keep hips square to the ground.' },
        { id: 'ex-5-3', name: 'Alternating Reverse Lunges with Bicep Curl', sets: 3, repsOrDuration: '12 reps total', restSeconds: 45, targetMuscles: 'Lower Body, Arms', proFormTip: 'Perform the curl smoothly as your knee touches the low point of the lunge.' },
        { id: 'ex-5-4', name: 'Mountain Climbers into Plank Hold', sets: 3, repsOrDuration: '45 seconds continuous', restSeconds: 45, targetMuscles: 'Core, Cardiovascular', proFormTip: 'Drive knees toward chest like running on your hands without bouncing hips.' },
      ],
      cooldown: ['Cat-cow stretch (1 min)', 'Seated spinal twist (1 min each side)', 'Deep child pose (2 mins)'],
    },
    {
      dayNumber: 6,
      dayName: 'Saturday',
      focusTitle: 'Outdoor Cardio, Weekend Hike or Functional Circuit',
      category: 'cardio',
      durationMinutes: 45,
      estimatedBurnKcal: 350,
      intensity: 'Moderate',
      warmup: ['Ankle circles & calf stretches (2 mins)', 'Light jog or dynamic leg swings (3 mins)'],
      exercises: [
        { id: 'ex-6-1', name: 'Outdoor Jogging, Cycling, or Swimming', sets: 1, repsOrDuration: '30 - 35 minutes', restSeconds: 0, targetMuscles: 'Heart, Lungs, Legs', proFormTip: 'Enjoy nature! Steady aerobic output burns stored triglycerides.' },
        { id: 'ex-6-2', name: 'Bodyweight Hanging Knee Tucks or Hollow Hold', sets: 3, repsOrDuration: '30 seconds', restSeconds: 45, targetMuscles: 'Core, Hip Flexors', proFormTip: 'Flatten lower back firmly into the ground during hollow holds.' },
        { id: 'ex-6-3', name: 'Side Plank Hip Dips', sets: 3, repsOrDuration: '10 reps per side', restSeconds: 45, targetMuscles: 'Obliques, Lateral Stability', proFormTip: 'Keep elbow directly below shoulder and lift hips high.' },
      ],
      cooldown: ['Full body yoga flow / Surya Namaskar (5 mins)', 'Cold water hydration splash'],
    },
    {
      dayNumber: 7,
      dayName: 'Sunday',
      focusTitle: 'Full Rest, Nervous System Reset & Weekly Preparation',
      category: 'rest',
      durationMinutes: 20,
      estimatedBurnKcal: 90,
      intensity: 'Low',
      warmup: ['Easy deep belly breathing'],
      exercises: [
        { id: 'ex-7-1', name: 'Gentle Walk with Family / Nature Walk', sets: 1, repsOrDuration: '20 minutes', restSeconds: 0, targetMuscles: 'Parasympathetic Recovery', proFormTip: 'Leave phone on silent; reset circadian rhythm with daylight.' },
        { id: 'ex-7-2', name: 'Full Body Foam Rolling & Gentle Mobility', sets: 1, repsOrDuration: '10 minutes', restSeconds: 0, targetMuscles: 'Fascia & Muscle Tissue', proFormTip: 'Breathe into trigger points to release muscular tension.' },
      ],
      cooldown: ['Epsom salt warm bath or shower', 'Sleep 8 hours for complete protein synthesis & hormonal reset'],
    },
  ];

  // 7. Daily Adherence Checklist
  const dailyChecklist: RoutineHabitChecklistItem[] = [
    { id: 'chk-1', label: 'Morning Hydration Kickstart (350ml water + lemon/chia)', timeHint: '07:00 AM', category: 'hydration', completed: false },
    { id: 'chk-2', label: 'Balanced High-Protein Breakfast consumed & logged', timeHint: '08:30 AM', category: 'nutrition', completed: false },
    { id: 'chk-3', label: 'Drank 1.5 Liters of water milestone', timeHint: '01:00 PM', category: 'hydration', completed: false },
    { id: 'chk-4', label: 'Completed scheduled daily workout or active recovery session', timeHint: '05:30 PM', category: 'fitness', completed: false },
    { id: 'chk-5', label: 'Nutritious dinner finished at least 2 hours before bed', timeHint: '08:00 PM', category: 'nutrition', completed: false },
    { id: 'chk-6', label: 'Met full daily water goal & logged final meals', timeHint: '09:30 PM', category: 'hydration', completed: false },
    { id: 'chk-7', label: 'Targeting 7.5 - 8 hours of restorative deep sleep', timeHint: '10:30 PM', category: 'recovery', completed: false },
  ];

  const hydrationGuidelines = [
    { time: 'Upon Waking (07:00 AM)', amount: '350 - 500 ml', purpose: 'Restores fluid balance lost during 7-8 hours of nighttime respiration.' },
    { time: 'Mid-Morning (10:30 AM)', amount: '400 ml', purpose: 'Sustains optimal cognitive processing and blood volume.' },
    { time: 'Pre & During Workout (05:00 PM)', amount: '500 ml', purpose: 'Replenishes electrolytes and maintains cellular osmotic pressure.' },
    { time: 'Post-Workout & Evening (07:30 PM)', amount: '400 ml', purpose: 'Flushes metabolic waste and lactic acid.' },
    { time: 'Before Bed (09:45 PM)', amount: '200 ml (Warm)', purpose: 'Hydrates without interrupting deep sleep cycles.' },
  ];

  const dietaryGuidelines = [
    'Strict Atwater Energy Balance: Follow the calorie target consistently to ensure progress.',
    'Protein Prioritization: Consume at least 25g - 35g protein per main meal to trigger muscle protein synthesis.',
    'Hydration Standard: Drink your calculated water allowance daily; thirst is often mistaken for hunger.',
    'Eat the Rainbow: Incorporate at least 2 colorful vegetables with lunch and dinner for phytonutrients and gut microbiome diversity.',
    '80/20 Sustainable Rule: 80% whole nutrient-dense foods, 20% mindful lifestyle flexibility without guilt.',
  ];

  return {
    id: `routine-${Date.now()}`,
    createdAt: new Date().toISOString(),
    userName: name || 'Athlete',
    age,
    gender,
    currentWeightKg,
    heightCm,
    targetWeightKg,
    goal,
    pace,
    activityLevel,
    dietaryPreference,
    allergies,
    workoutLocation,

    bmi: bmiData.bmi,
    bmiCategory: bmiData.category,
    bmr,
    tdee,
    dailyCalorieTarget,
    dailyProteinTarget,
    dailyCarbsTarget,
    dailyFatsTarget,
    dailyFiberTarget,
    dailyWaterTargetLiters,
    dailyWaterTargetCups,
    projectedWeeksToGoal: projectedWeeks,
    targetCompletionDate,

    meals,
    hydrationGuidelines,
    dietaryGuidelines,

    weeklySplit,
    weeklyCardioTargetMinutes: goal === 'lose_fat' ? 150 : 90,
    dailyStepsTarget: goal === 'lose_fat' ? 10000 : 8000,

    dailyChecklist,
  };
}
