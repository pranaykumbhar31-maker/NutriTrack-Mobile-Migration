import React, { useState, useEffect } from 'react';
import {
  Dumbbell,
  Sparkles,
  Utensils,
  CheckCircle2,
  Calendar,
  Clock,
  Flame,
  ChevronDown,
  ChevronUp,
  RefreshCw,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { generatePersonalizedRoutine, RoutineGeneratorInput } from '../lib/routineEngine';
import { GeneratedRoutinePlan, DailyWorkoutRoutine, RoutineMealItem } from '../lib/types';
import { getUserProfile, getRoutinePlan, saveRoutinePlan } from '../lib/storage';

export const RoutineView: React.FC = () => {
  const profile = getUserProfile();
  const [plan, setPlan] = useState<GeneratedRoutinePlan | null>(getRoutinePlan());
  const [showConfig, setShowConfig] = useState(!plan);
  const [activeDayIndex, setActiveDayIndex] = useState(0);

  // Form input state
  const [formData, setFormData] = useState<RoutineGeneratorInput>({
    name: profile.name || 'Maya',
    age: profile.age || 26,
    gender: profile.gender || 'female',
    currentWeightKg: profile.weightKg || 58,
    heightCm: profile.heightCm || 165,
    targetWeightKg: profile.targetWeightKg || 55,
    goal: profile.goal || 'lose_fat',
    pace: 'moderate',
    activityLevel: profile.activityLevel || 'moderate',
    dietaryPreference: profile.dietaryPreference || 'vegetarian',
    allergies: profile.allergies || ['peanuts'],
    workoutLocation: 'gym',
  });

  const handleGenerate = () => {
    const generated = generatePersonalizedRoutine(formData);
    setPlan(generated);
    saveRoutinePlan(generated);
    setShowConfig(false);

    if ('vibrate' in navigator) {
      navigator.vibrate([20, 40, 20]);
    }

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const handleToggleChecklist = (id: string) => {
    if (!plan) return;
    const updated = {
      ...plan,
      dailyChecklist: plan.dailyChecklist.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      ),
    };
    setPlan(updated);
    saveRoutinePlan(updated);
    if ('vibrate' in navigator) navigator.vibrate(10);
  };

  return (
    <div className="flex flex-col gap-4 pb-24">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950/90 to-slate-900 border border-emerald-500/30 rounded-2xl p-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Dumbbell className="text-emerald-400" size={18} />
            <h2 className="text-base font-extrabold text-white">Routine & Diet Generator</h2>
          </div>
          <p className="text-xs text-slate-300">
            Clinical Mifflin-St Jeor calculations, 7-day workout split & timed meal chart.
          </p>
        </div>
        <button
          onClick={() => setShowConfig(!showConfig)}
          className="p-2 bg-slate-800 hover:bg-slate-700 active:scale-95 text-emerald-400 rounded-xl border border-slate-700/60"
        >
          {showConfig ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>

      {/* Generator Configuration Drawer */}
      {showConfig && (
        <div className="bg-slate-800/90 border border-slate-700/70 rounded-2xl p-4 flex flex-col gap-3 shadow-lg">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Biometrics & Fitness Preferences
          </h3>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] text-slate-400">Current Weight (kg)</label>
              <input
                type="number"
                value={formData.currentWeightKg}
                onChange={(e) =>
                  setFormData({ ...formData, currentWeightKg: parseFloat(e.target.value) || 0 })
                }
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs text-white mt-1"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400">Target Weight (kg)</label>
              <input
                type="number"
                value={formData.targetWeightKg}
                onChange={(e) =>
                  setFormData({ ...formData, targetWeightKg: parseFloat(e.target.value) || 0 })
                }
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs text-white mt-1"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400">Height (cm)</label>
              <input
                type="number"
                value={formData.heightCm}
                onChange={(e) =>
                  setFormData({ ...formData, heightCm: parseFloat(e.target.value) || 0 })
                }
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs text-white mt-1"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400">Age</label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) =>
                  setFormData({ ...formData, age: parseInt(e.target.value, 10) || 0 })
                }
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs text-white mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] text-slate-400">Primary Goal</label>
              <select
                value={formData.goal}
                onChange={(e) => setFormData({ ...formData, goal: e.target.value as any })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs text-white mt-1"
              >
                <option value="lose_fat">Fat Loss & Toning</option>
                <option value="build_muscle">Lean Muscle Gain</option>
                <option value="maintain">Weight Maintenance</option>
                <option value="improve_health">General Fitness</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] text-slate-400">Pace</label>
              <select
                value={formData.pace}
                onChange={(e) => setFormData({ ...formData, pace: e.target.value as any })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs text-white mt-1"
              >
                <option value="sustainable">Sustainable (~0.35 kg/wk)</option>
                <option value="moderate">Moderate (~0.55 kg/wk)</option>
                <option value="accelerated">Accelerated (~0.85 kg/wk)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] text-slate-400">Diet Preference</label>
              <select
                value={formData.dietaryPreference}
                onChange={(e) => setFormData({ ...formData, dietaryPreference: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs text-white mt-1"
              >
                <option value="vegetarian">Vegetarian</option>
                <option value="vegan">Vegan</option>
                <option value="eggetarian">Eggetarian</option>
                <option value="non_veg">Non-Vegetarian</option>
                <option value="balanced">Balanced / Mediterranean</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] text-slate-400">Workout Location</label>
              <select
                value={formData.workoutLocation}
                onChange={(e) =>
                  setFormData({ ...formData, workoutLocation: e.target.value as any })
                }
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs text-white mt-1"
              >
                <option value="gym">Full Gym Access</option>
                <option value="home_dumbbells">Home Dumbbells</option>
                <option value="bodyweight">Bodyweight / Calisthenics</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md shadow-emerald-900/40 transition-all mt-1"
          >
            <Sparkles size={16} />
            <span>Generate Personalized Routine</span>
          </button>
        </div>
      )}

      {/* Generated Plan View */}
      {plan ? (
        <div className="flex flex-col gap-4">
          {/* Clinical Biometric Metrics Summary */}
          <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-300">Target Projections</span>
              <span className="text-[11px] font-semibold text-emerald-400">
                Target Date: {plan.targetCompletionDate}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-700/40">
                <span className="text-[10px] text-slate-400">Daily Calories</span>
                <div className="text-base font-extrabold text-white mt-0.5">
                  {plan.dailyCalorieTarget}
                </div>
                <span className="text-[10px] text-emerald-400 font-semibold">kcal/day</span>
              </div>
              <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-700/40">
                <span className="text-[10px] text-slate-400">Daily Protein</span>
                <div className="text-base font-extrabold text-emerald-400 mt-0.5">
                  {plan.dailyProteinTarget}g
                </div>
                <span className="text-[10px] text-slate-400">High Muscle Protect</span>
              </div>
              <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-700/40">
                <span className="text-[10px] text-slate-400">Time to Goal</span>
                <div className="text-base font-extrabold text-sky-400 mt-0.5">
                  {plan.projectedWeeksToGoal} wks
                </div>
                <span className="text-[10px] text-slate-400">{formData.pace} pace</span>
              </div>
            </div>
          </div>

          {/* 7-Day Workout Routine Tabs */}
          <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Dumbbell size={15} className="text-emerald-400" />
                <span>7-Day Workout Routine</span>
              </h3>
              <span className="text-[10px] text-slate-400">{formData.workoutLocation}</span>
            </div>

            {/* Day Selector Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {plan.weeklySplit.map((day, idx) => (
                <button
                  key={day.dayNumber}
                  onClick={() => setActiveDayIndex(idx)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                    activeDayIndex === idx
                      ? 'bg-emerald-500 text-white shadow-md'
                      : 'bg-slate-900/60 text-slate-400 hover:text-white'
                  }`}
                >
                  {day.dayName.slice(0, 3)}
                </button>
              ))}
            </div>

            {/* Selected Day Workout Details */}
            {plan.weeklySplit[activeDayIndex] && (
              <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-700/40 flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      {plan.weeklySplit[activeDayIndex].dayName}: {plan.weeklySplit[activeDayIndex].focusTitle}
                    </h4>
                    <span className="text-[11px] text-emerald-400 font-semibold">
                      {plan.weeklySplit[activeDayIndex].durationMinutes} mins • ~
                      {plan.weeklySplit[activeDayIndex].estimatedBurnKcal} kcal burn
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    {plan.weeklySplit[activeDayIndex].intensity}
                  </span>
                </div>

                <div className="flex flex-col gap-2 mt-1">
                  {plan.weeklySplit[activeDayIndex].exercises.map((ex, exIdx) => (
                    <div
                      key={ex.id || exIdx}
                      className="p-2.5 rounded-lg bg-slate-800/70 border border-slate-700/50 flex flex-col gap-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{ex.name}</span>
                        <span className="text-xs font-extrabold text-emerald-400">
                          {ex.sets} sets × {ex.repsOrDuration}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span>Target: {ex.targetMuscles}</span>
                        <span>Rest: {ex.restSeconds}s</span>
                      </div>
                      {ex.proFormTip && (
                        <p className="text-[10px] text-slate-300 italic bg-slate-900/40 p-1.5 rounded mt-0.5">
                          💡 Tip: {ex.proFormTip}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Timed 6-Meal Daily Diet Plan */}
          <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Utensils size={15} className="text-emerald-400" />
                <span>Timed Daily Diet Plan ({plan.meals.length} Meals)</span>
              </h3>
              <span className="text-[10px] text-emerald-400 font-semibold capitalize">
                {formData.dietaryPreference}
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {plan.meals.map((meal) => (
                <div
                  key={meal.id}
                  className="bg-slate-900/60 border border-slate-700/50 rounded-xl p-3 flex flex-col gap-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Clock size={12} className="text-emerald-400" />
                      <span className="text-xs font-extrabold text-white">{meal.mealSlot}</span>
                      <span className="text-[10px] text-slate-400">({meal.timeOfDay})</span>
                    </div>
                    <span className="text-xs font-bold text-emerald-400">{meal.calories} kcal</span>
                  </div>

                  <h5 className="text-xs font-bold text-slate-200">{meal.title}</h5>
                  <p className="text-[11px] text-slate-400">{meal.description}</p>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                    <span>Portion: {meal.portion}</span>
                    <span>•</span>
                    <span>P: {meal.protein}g</span>
                    <span>•</span>
                    <span>C: {meal.carbs}g</span>
                    <span>•</span>
                    <span>F: {meal.fats}g</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Daily Habit Checklist */}
          <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-4 flex flex-col gap-2.5">
            <h3 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 size={15} className="text-emerald-400" />
              <span>Daily Adherence Checklist</span>
            </h3>

            <div className="flex flex-col gap-1.5">
              {plan.dailyChecklist.map((habit) => (
                <button
                  key={habit.id}
                  onClick={() => handleToggleChecklist(habit.id)}
                  className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                    habit.completed
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                      : 'bg-slate-900/60 border-slate-700/50 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center border ${
                        habit.completed
                          ? 'bg-emerald-500 border-emerald-400 text-white'
                          : 'border-slate-500'
                      }`}
                    >
                      {habit.completed && <CheckCircle2 size={12} />}
                    </div>
                    <span className={`text-xs font-semibold ${habit.completed ? 'line-through opacity-80' : ''}`}>
                      {habit.label}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">{habit.timeHint}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-800/40 border border-slate-700/40 rounded-2xl p-6 text-center text-slate-400">
          <p className="text-xs">No routine plan active yet.</p>
          <p className="text-[11px] text-slate-500 mt-1">Tap above to generate your customized diet and workout charts.</p>
        </div>
      )}
    </div>
  );
};
