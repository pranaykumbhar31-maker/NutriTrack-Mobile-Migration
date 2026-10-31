import React, { useState } from 'react';
import { X, Search, Plus, Utensils, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { searchFoods } from '../lib/api';
import { addMealLog } from '../lib/storage';
import { MealLog, MealType, FoodItem } from '../lib/types';
import { VERIFIED_FOOD_DATABASE } from '../lib/foodDatabase';

interface ManualMealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMealAdded: () => void;
}

export const ManualMealModal: React.FC<ManualMealModalProps> = ({ isOpen, onClose, onMealAdded }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>(VERIFIED_FOOD_DATABASE.slice(0, 8));
  const [selectedFood, setSelectedFood] = useState<any | null>(null);
  const [mealType, setMealType] = useState<MealType>('lunch');
  const [quantity, setQuantity] = useState(1);

  if (!isOpen) return null;

  const handleSearch = async (val: string) => {
    setQuery(val);
    if (!val.trim()) {
      setResults(VERIFIED_FOOD_DATABASE.slice(0, 8));
      return;
    }
    const found = await searchFoods(val);
    setResults(found);
  };

  const handleCommit = () => {
    if (!selectedFood) return;

    const baseCals = selectedFood.calories || (selectedFood.calories_per_100g ? selectedFood.calories_per_100g : 150);
    const basePro = selectedFood.protein || 8;
    const baseCarb = selectedFood.carbs || 20;
    const baseFat = selectedFood.fats || 5;

    const foodItem: FoodItem = {
      id: selectedFood.id || selectedFood.food_id || `f-${Date.now()}`,
      name: selectedFood.name || selectedFood.display,
      category: 'composite',
      servingSize: selectedFood.servingSize || 100,
      servingUnit: selectedFood.servingUnit || 'g',
      calories: Math.round(baseCals * quantity),
      protein: Math.round(basePro * quantity * 10) / 10,
      carbs: Math.round(baseCarb * quantity * 10) / 10,
      fats: Math.round(baseFat * quantity * 10) / 10,
    };

    const newLog: MealLog = {
      id: `meal-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      mealType,
      items: [
        {
          foodItem,
          quantity,
          calculatedNutrition: {
            calories: foodItem.calories,
            protein: foodItem.protein,
            carbs: foodItem.carbs,
            fats: foodItem.fats,
          },
        },
      ],
      totalNutrition: {
        calories: foodItem.calories,
        protein: foodItem.protein,
        carbs: foodItem.carbs,
        fats: foodItem.fats,
      },
      aiAnalyzed: false,
    };

    addMealLog(newLog);

    if ('vibrate' in navigator) navigator.vibrate([20, 50, 20]);
    confetti({ particleCount: 70, spread: 50, origin: { y: 0.7 } });

    onMealAdded();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border-t border-slate-700 rounded-t-3xl max-h-[85dvh] flex flex-col shadow-2xl overflow-hidden pb-safe">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
              <Utensils size={18} />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white">Manual Meal Logger</h3>
              <span className="text-[10px] text-slate-400">Search 50+ verified staples offline</span>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-xl">
            <X size={20} />
          </button>
        </div>

        {/* Meal Type Selector */}
        <div className="px-4 py-2 border-b border-slate-800/60 flex items-center gap-1.5">
          {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map((slot) => (
            <button
              key={slot}
              onClick={() => setMealType(slot)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                mealType === slot
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {slot}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="p-3 border-b border-slate-800/80">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search dishes (e.g. Dosa, Chicken, Dal, Apple)..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Search Results List */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
          {results.map((food) => {
            const isSelected = selectedFood?.id === food.id || selectedFood?.food_id === food.food_id;
            return (
              <button
                key={food.id || food.food_id}
                onClick={() => setSelectedFood(food)}
                className={`p-3 rounded-xl border flex items-center justify-between text-left transition-all ${
                  isSelected
                    ? 'bg-emerald-950/60 border-emerald-500 text-white'
                    : 'bg-slate-800/80 border-slate-700/60 text-slate-300 hover:border-slate-600'
                }`}
              >
                <div>
                  <h4 className="text-xs font-bold text-white">{food.name || food.display}</h4>
                  <span className="text-[10px] text-slate-400">
                    {food.servingSize || food.serving_size || 100} {food.servingUnit || 'g'} standard portion
                  </span>
                </div>
                <span className="text-xs font-bold text-emerald-400">
                  {food.calories || food.calories_per_100g || 120} kcal
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Food Action Bar */}
        {selectedFood && (
          <div className="p-4 border-t border-slate-800 bg-slate-900 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white">{selectedFood.name || selectedFood.display}</span>
                <span className="text-[11px] text-emerald-400 block font-semibold">
                  Total: {Math.round((selectedFood.calories || selectedFood.calories_per_100g || 120) * quantity)} kcal
                </span>
              </div>

              {/* Quantity Stepper */}
              <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-xl p-1">
                <button
                  onClick={() => setQuantity(Math.max(0.5, quantity - 0.5))}
                  className="w-7 h-7 rounded-lg bg-slate-700 text-white font-bold flex items-center justify-center active:scale-95"
                >
                  -
                </button>
                <span className="text-xs font-bold text-white px-2">{quantity}x</span>
                <button
                  onClick={() => setQuantity(quantity + 0.5)}
                  className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center active:scale-95"
                >
                  +
                </button>
              </div>
            </div>

            <button
              onClick={handleCommit}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/40 transition-all"
            >
              <Check size={16} />
              <span>Log {quantity}x Serving to {mealType.toUpperCase()}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
