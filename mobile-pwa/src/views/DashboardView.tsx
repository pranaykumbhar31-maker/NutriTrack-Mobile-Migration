import React, { useState, useEffect } from 'react';
import { Plus, Utensils, Trash2, Award, ChevronRight, Sparkles } from 'lucide-react';
import { EnergyGauge } from '../components/EnergyGauge';
import { MacroSplitBar } from '../components/MacroSplitBar';
import { WaterTracker } from '../components/WaterTracker';
import {
  getUserProfile,
  getDailyMeals,
  getWaterLog,
  saveWaterLog,
  deleteMealLog,
} from '../lib/storage';
import { aggregateDailyNutrition, calculateNutritionScore } from '../lib/nutritionEngine';
import { MealLog, UserProfile, WaterLog } from '../lib/types';

interface DashboardViewProps {
  onOpenManualLogger: () => void;
  onNavigateToRoutines: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenManualLogger,
  onNavigateToRoutines,
}) => {
  const [profile, setProfile] = useState<UserProfile>(getUserProfile());
  const [todayMeals, setTodayMeals] = useState<MealLog[]>([]);
  const [water, setWater] = useState<WaterLog>(getWaterLog());

  const loadData = () => {
    const prof = getUserProfile();
    const today = new Date().toISOString().split('T')[0];
    const meals = getDailyMeals(today);
    const w = getWaterLog();
    setProfile(prof);
    setTodayMeals(meals);
    setWater(w);
  };

  useEffect(() => {
    loadData();
    const handleStorageChange = () => loadData();
    window.addEventListener('nutri-storage-change', handleStorageChange);
    return () => window.removeEventListener('nutri-storage-change', handleStorageChange);
  }, []);

  const handleAddWater = (amount: number) => {
    const updatedCups = (water.cups || 0) + amount;
    const newLog: WaterLog = {
      date: new Date().toISOString().split('T')[0],
      cups: updatedCups,
      targetCups: water.targetCups || 8,
    };
    saveWaterLog(newLog);
    setWater(newLog);
  };

  const handleDeleteMeal = (mealId: string) => {
    deleteMealLog(mealId);
    loadData();
  };

  const consumed = aggregateDailyNutrition(todayMeals);
  const scoreResult = calculateNutritionScore(
    consumed,
    profile.dailyCalorieTarget || 2100,
    profile.dailyProteinTarget || 110
  );

  return (
    <div className="flex flex-col gap-4 pb-24">
      {/* Welcome & Streak Banner */}
      <div className="flex items-center justify-between bg-slate-800/80 border border-slate-700/60 rounded-2xl p-4 shadow-sm">
        <div>
          <span className="text-xs text-slate-400 font-medium">Hello,</span>
          <h2 className="text-lg font-extrabold text-white">{profile.name || 'Maya'}</h2>
          <span className="text-[11px] text-emerald-400 font-semibold">
            Goal: {profile.goal?.replace('_', ' ').toUpperCase() || 'LOSE FAT'}
          </span>
        </div>

        <div className="flex flex-col items-end">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400">
            <span className="text-xs">🔥</span>
            <span className="text-xs font-bold">{profile.streakDays || 4} Day Streak</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1">Keep the momentum going!</span>
        </div>
      </div>

      {/* Routine Quick Recommendation Teaser */}
      <button
        onClick={onNavigateToRoutines}
        className="flex items-center justify-between p-3.5 bg-gradient-to-r from-emerald-950/80 to-slate-900 border border-emerald-500/30 rounded-2xl text-left active:scale-98 transition-all shadow-md"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-500 text-white rounded-xl">
            <Sparkles size={16} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Daily Routine & Habit Plan</h4>
            <p className="text-[11px] text-emerald-300">View 7-day workout & timed meal chart</p>
          </div>
        </div>
        <ChevronRight size={18} className="text-emerald-400" />
      </button>

      {/* Central Radial Energy Gauge */}
      <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-2 shadow-md">
        <EnergyGauge
          currentCalories={consumed.calories}
          targetCalories={profile.dailyCalorieTarget || 2100}
        />
        <div className="px-3 pb-3">
          <MacroSplitBar
            protein={consumed.protein}
            targetProtein={profile.dailyProteinTarget || 110}
            carbs={consumed.carbs}
            targetCarbs={profile.dailyCarbsTarget || 240}
            fats={consumed.fats}
            targetFats={profile.dailyFatsTarget || 60}
          />
        </div>
      </div>

      {/* Adherence Score Badge */}
      <div className="flex items-center justify-between p-3.5 bg-slate-800/80 border border-slate-700/60 rounded-2xl">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
            <Award size={18} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Adherence Score</h4>
            <p className="text-[11px] text-slate-400">Nutritional balance rating</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-base font-extrabold text-emerald-400">{scoreResult.score}/100</span>
          <div className="text-[10px] font-semibold text-slate-300">{scoreResult.label}</div>
        </div>
      </div>

      {/* Water Tracker */}
      <WaterTracker
        cups={water.cups || 0}
        targetCups={water.targetCups || 8}
        onAddCup={handleAddWater}
      />

      {/* Logged Meals Stream */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-extrabold text-white flex items-center gap-1.5">
            <Utensils size={16} className="text-emerald-400" />
            <span>Today's Meal Diary ({todayMeals.length})</span>
          </h3>
          <button
            onClick={onOpenManualLogger}
            className="flex items-center gap-1 text-xs font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 active:scale-95 transition-all"
          >
            <Plus size={13} />
            <span>Log Meal</span>
          </button>
        </div>

        {todayMeals.length === 0 ? (
          <div className="bg-slate-800/40 border border-slate-700/40 rounded-2xl p-6 text-center text-slate-400">
            <p className="text-xs">No meals logged for today yet.</p>
            <p className="text-[11px] text-slate-500 mt-1">Tap the camera button below to scan your plate.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {todayMeals.map((meal) => (
              <div
                key={meal.id}
                className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-sm"
              >
                {meal.photoUrl && (
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-900 shrink-0 border border-slate-700">
                    <img src={meal.photoUrl} alt="Meal" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                      {meal.mealType}
                    </span>
                    <span className="text-[10px] text-slate-400">{meal.time}</span>
                  </div>
                  <h4 className="text-xs font-bold text-white truncate mt-1">
                    {meal.items.map((i) => i.foodItem.name).join(', ')}
                  </h4>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                    <span className="font-bold text-slate-200">{meal.totalNutrition.calories} kcal</span>
                    <span>•</span>
                    <span>P: {meal.totalNutrition.protein}g</span>
                    <span>•</span>
                    <span>C: {meal.totalNutrition.carbs}g</span>
                    <span>•</span>
                    <span>F: {meal.totalNutrition.fats}g</span>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteMeal(meal.id)}
                  className="p-2 text-slate-500 hover:text-rose-400 rounded-lg active:scale-95 transition-all"
                  aria-label="Delete meal"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
