import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Upload,
  Sparkles,
  Check,
  AlertTriangle,
  Search,
  Scale,
  RefreshCw,
  Plus,
  Flame,
  Info,
  ChevronDown,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { scanFoodImage, recalculateServingNutrition, searchFoods } from '../lib/api';
import { addMealLog } from '../lib/storage';
import { MealLog, MealType, FoodItem } from '../lib/types';
import { MacroSplitBar } from '../components/MacroSplitBar';

interface DetectedItemState {
  id: string;
  foodId?: string;
  name: string;
  servingSize: number;
  servingUnit: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber?: number;
  sodium?: number;
  sugar?: number;
  potassium?: number;
  calcium?: number;
  iron?: number;
  confidence?: number;
}

interface ServingOption {
  label: string;
  grams: number;
}

interface CandidateItem {
  label: string;
  display: string;
  food_id: string;
  probability?: number;
}

interface ScannerViewProps {
  onMealSaved: () => void;
}

export const ScannerView: React.FC<ScannerViewProps> = ({ onMealSaved }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scanStatus, setScanStatus] = useState<string>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [detectedItem, setDetectedItem] = useState<DetectedItemState | null>(null);
  const [candidates, setCandidates] = useState<CandidateItem[]>([]);
  const [servingOptions, setServingOptions] = useState<ServingOption[]>([]);
  const [selectedGrams, setSelectedGrams] = useState<number>(100);
  const [customGramsInput, setCustomGramsInput] = useState<string>('100');
  const [mealType, setMealType] = useState<MealType>('lunch');

  // Manual search fallback state
  const [showManualSearch, setShowManualSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Set default meal type based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 11) setMealType('breakfast');
    else if (hour < 16) setMealType('lunch');
    else if (hour < 19) setMealType('snack');
    else setMealType('dinner');
  }, []);

  const handleImageFile = async (file: File) => {
    const objectUrl = URL.createObjectURL(file);
    setSelectedImage(objectUrl);
    setIsAnalyzing(true);
    setScanStatus('analyzing');
    setStatusMessage('Analyzing food with OpenCLIP model...');
    setDetectedItem(null);
    setCandidates([]);
    setShowManualSearch(false);

    try {
      const result = await scanFoodImage(file);
      setScanStatus(result.scanStatus || 'model_unavailable');
      setStatusMessage(result.message || '');

      if (result.candidates && Array.isArray(result.candidates)) {
        setCandidates(result.candidates);
      }

      if (result.scanStatus === 'accepted' && result.food) {
        const food = result.food;
        const grams = food.servingSize || 100;
        setSelectedGrams(grams);
        setCustomGramsInput(grams.toString());

        setDetectedItem({
          id: food.id || 'f-scanned',
          foodId: food.id,
          name: food.name || result.candidates?.[0]?.display || 'Identified Dish',
          servingSize: grams,
          servingUnit: food.servingUnit || 'g',
          calories: food.calories || 0,
          protein: food.protein || 0,
          carbs: food.carbs || 0,
          fats: food.fats || 0,
          fiber: food.fiber,
          sodium: food.sodium,
          sugar: food.sugar,
          potassium: food.potassium,
          calcium: food.calcium,
          iron: food.iron,
          confidence: result.candidates?.[0]?.probability,
        });

        // Set serving options
        if (result.servingOptions && Array.isArray(result.servingOptions)) {
          setServingOptions(result.servingOptions);
        } else {
          setServingOptions([
            { label: `1 standard portion (${grams}g)`, grams },
            { label: '100g portion', grams: 100 },
          ]);
        }
      } else if (
        result.scanStatus === 'model_unavailable' ||
        result.scanStatus === 'rejected_non_food' ||
        result.scanStatus === 'low_quality_image' ||
        result.scanStatus === 'offline'
      ) {
        setShowManualSearch(true);
      }
    } catch (err: any) {
      setScanStatus('model_unavailable');
      setStatusMessage('Scanner is currently offline. Please use manual search.');
      setShowManualSearch(true);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSelectCandidate = async (candidate: CandidateItem) => {
    if (!candidate.food_id) return;
    setIsAnalyzing(true);
    try {
      const resp = await recalculateServingNutrition(candidate.food_id, selectedGrams);
      if (resp && resp.food) {
        const food = resp.food;
        setDetectedItem({
          id: food.id,
          foodId: food.id,
          name: candidate.display,
          servingSize: selectedGrams,
          servingUnit: 'g',
          calories: food.calories,
          protein: food.protein,
          carbs: food.carbs,
          fats: food.fats,
          fiber: food.fiber,
          sodium: food.sodium,
          sugar: food.sugar,
          confidence: candidate.probability,
        });
        setScanStatus('accepted');
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGramsChange = async (newGrams: number) => {
    if (!detectedItem?.foodId || newGrams <= 0) return;
    setSelectedGrams(newGrams);
    setCustomGramsInput(newGrams.toString());

    const recalculated = await recalculateServingNutrition(detectedItem.foodId, newGrams);
    if (recalculated && recalculated.food) {
      const f = recalculated.food;
      setDetectedItem((prev) =>
        prev
          ? {
              ...prev,
              servingSize: newGrams,
              calories: f.calories,
              protein: f.protein,
              carbs: f.carbs,
              fats: f.fats,
              fiber: f.fiber,
              sodium: f.sodium,
            }
          : null
      );
    }
  };

  const handleManualSearch = async (q: string) => {
    setSearchQuery(q);
    if (q.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const results = await searchFoods(q);
      setSearchResults(results);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectManualFood = (item: any) => {
    const grams = item.serving_size || 100;
    const cals = Math.round(((item.calories_per_100g || 100) * grams) / 100);
    setSelectedGrams(grams);
    setCustomGramsInput(grams.toString());

    setDetectedItem({
      id: item.food_id || item.id,
      foodId: item.food_id || item.id,
      name: item.display || item.name,
      servingSize: grams,
      servingUnit: 'g',
      calories: cals,
      protein: Math.round(grams * 0.1 * 10) / 10,
      carbs: Math.round(grams * 0.2 * 10) / 10,
      fats: Math.round(grams * 0.05 * 10) / 10,
      confidence: 1.0,
    });
    setScanStatus('accepted');
    setShowManualSearch(false);
  };

  const handleSaveToDiary = () => {
    if (!detectedItem) return;

    const foodItem: FoodItem = {
      id: detectedItem.id,
      name: detectedItem.name,
      category: 'composite',
      servingSize: detectedItem.servingSize,
      servingUnit: detectedItem.servingUnit,
      calories: detectedItem.calories,
      protein: detectedItem.protein,
      carbs: detectedItem.carbs,
      fats: detectedItem.fats,
      fiber: detectedItem.fiber,
      sodium: detectedItem.sodium,
      confidence: detectedItem.confidence,
    };

    const newLog: MealLog = {
      id: `meal-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      mealType,
      items: [
        {
          foodItem,
          quantity: 1,
          calculatedNutrition: {
            calories: detectedItem.calories,
            protein: detectedItem.protein,
            carbs: detectedItem.carbs,
            fats: detectedItem.fats,
            fiber: detectedItem.fiber,
            sodium: detectedItem.sodium,
          },
        },
      ],
      totalNutrition: {
        calories: detectedItem.calories,
        protein: detectedItem.protein,
        carbs: detectedItem.carbs,
        fats: detectedItem.fats,
        fiber: detectedItem.fiber,
        sodium: detectedItem.sodium,
      },
      photoUrl: selectedImage || undefined,
      aiAnalyzed: true,
    };

    addMealLog(newLog);

    if ('vibrate' in navigator) {
      navigator.vibrate([30, 60, 30]);
    }

    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.7 },
    });

    onMealSaved();
  };

  return (
    <div className="flex flex-col gap-4 pb-24">
      {/* Hidden file inputs */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleImageFile(e.target.files[0])}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleImageFile(e.target.files[0])}
      />

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900/60 to-slate-800/80 border border-emerald-500/30 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="text-emerald-400" size={18} />
          <h2 className="text-base font-bold text-white">AI Food Vision Scanner</h2>
        </div>
        <p className="text-xs text-slate-300">
          Point your phone camera at your meal for instant food identification & Atwater nutrient calculations.
        </p>
      </div>

      {/* Image Preview & Capture Buttons */}
      <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-4 flex flex-col items-center gap-3">
        {selectedImage ? (
          <div className="relative w-full h-56 rounded-xl overflow-hidden bg-slate-900 border border-slate-700">
            <img src={selectedImage} alt="Food capture" className="w-full h-full object-cover" />
            {isAnalyzing && (
              <div className="absolute inset-0 bg-slate-900/75 backdrop-blur-sm flex flex-col items-center justify-center gap-2">
                <RefreshCw size={28} className="text-emerald-400 animate-spin" />
                <span className="text-xs font-semibold text-emerald-300">Analyzing dish features...</span>
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-44 border-2 border-dashed border-slate-700 rounded-xl flex flex-col items-center justify-center gap-2 text-slate-400 bg-slate-900/40">
            <Camera size={36} className="text-emerald-500/80" />
            <span className="text-xs text-slate-400 font-medium">Capture or upload photo of your plate</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2 w-full pt-1">
          <button
            onClick={() => cameraInputRef.current?.click()}
            className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md shadow-emerald-900/40 transition-all"
          >
            <Camera size={16} />
            <span>Open Camera</span>
          </button>
          <button
            onClick={() => galleryInputRef.current?.click()}
            className="flex-1 py-3 px-4 bg-slate-700 hover:bg-slate-600 active:scale-95 text-slate-200 font-bold text-xs rounded-xl flex items-center justify-center gap-2 border border-slate-600/50 transition-all"
          >
            <Upload size={16} />
            <span>Gallery</span>
          </button>
        </div>
      </div>

      {/* Status & Feedback Banners */}
      {scanStatus !== 'idle' && scanStatus !== 'analyzing' && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
            scanStatus === 'accepted'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : scanStatus === 'needs_confirmation'
              ? 'bg-sky-500/10 border-sky-500/30 text-sky-300'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
          }`}
        >
          <Info size={16} className="shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold capitalize">{scanStatus.replace(/_/g, ' ')}: </span>
            <span>{statusMessage || 'Food identification result processed.'}</span>
          </div>
        </div>
      )}

      {/* Candidate Chips (for needs_confirmation or ambiguous) */}
      {candidates.length > 0 && scanStatus !== 'accepted' && (
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-4 flex flex-col gap-2">
          <span className="text-xs font-bold text-slate-300">Select Closest Match:</span>
          <div className="flex flex-wrap gap-2">
            {candidates.map((c) => (
              <button
                key={c.label}
                onClick={() => handleSelectCandidate(c)}
                className="py-1.5 px-3 bg-slate-700/70 hover:bg-emerald-600/30 active:scale-95 border border-slate-600 hover:border-emerald-500/40 rounded-xl text-xs text-white font-medium flex items-center gap-1.5 transition-all"
              >
                <span>{c.display}</span>
                {c.probability && (
                  <span className="text-[10px] text-emerald-400 font-bold">
                    {(c.probability * 100).toFixed(0)}%
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Recognized Food & Nutrition Breakdown */}
      {detectedItem && (
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-4 flex flex-col gap-3 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                Recognized Food
              </span>
              <h3 className="text-base font-extrabold text-white">{detectedItem.name}</h3>
            </div>
            {detectedItem.confidence && (
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {(detectedItem.confidence * 100).toFixed(0)}% Match
              </span>
            )}
          </div>

          {/* Portion Sizer & Gram Selector */}
          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/50 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
              <span className="flex items-center gap-1">
                <Scale size={13} className="text-emerald-400" /> Portion Weight:
              </span>
              <span className="text-emerald-400 font-bold">{selectedGrams} grams</span>
            </div>

            <div className="flex items-center gap-2">
              {[50, 100, 150, 200].map((g) => (
                <button
                  key={g}
                  onClick={() => handleGramsChange(g)}
                  className={`flex-1 py-1 px-2 rounded-lg text-xs font-bold transition-all ${
                    selectedGrams === g
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {g}g
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="number"
                value={customGramsInput}
                onChange={(e) => {
                  setCustomGramsInput(e.target.value);
                  const parsed = parseInt(e.target.value, 10);
                  if (parsed > 0) handleGramsChange(parsed);
                }}
                className="w-24 bg-slate-800 border border-slate-600 rounded-lg px-2.5 py-1 text-xs text-white font-semibold text-center focus:outline-none focus:border-emerald-500"
                placeholder="Custom g"
              />
              <span className="text-[11px] text-slate-400">
                Portion cannot be estimated from a 2D photo. Enter exact grams.
              </span>
            </div>
          </div>

          {/* Calorie & Macro Highlights */}
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="p-2 bg-slate-900/50 rounded-xl border border-slate-700/40">
              <span className="text-xs text-slate-400">Calories</span>
              <div className="text-sm font-extrabold text-white mt-0.5">{detectedItem.calories}</div>
              <span className="text-[10px] text-emerald-400 font-semibold">kcal</span>
            </div>
            <div className="p-2 bg-slate-900/50 rounded-xl border border-slate-700/40">
              <span className="text-xs text-slate-400">Protein</span>
              <div className="text-sm font-extrabold text-emerald-400 mt-0.5">{detectedItem.protein}g</div>
            </div>
            <div className="p-2 bg-slate-900/50 rounded-xl border border-slate-700/40">
              <span className="text-xs text-slate-400">Carbs</span>
              <div className="text-sm font-extrabold text-sky-400 mt-0.5">{detectedItem.carbs}g</div>
            </div>
            <div className="p-2 bg-slate-900/50 rounded-xl border border-slate-700/40">
              <span className="text-xs text-slate-400">Fats</span>
              <div className="text-sm font-extrabold text-amber-400 mt-0.5">{detectedItem.fats}g</div>
            </div>
          </div>

          {/* Meal Slot Selector */}
          <div className="flex items-center gap-1.5 pt-1">
            <span className="text-xs font-semibold text-slate-300 mr-1">Meal:</span>
            {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map((slot) => (
              <button
                key={slot}
                onClick={() => setMealType(slot)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                  mealType === slot
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-700/60 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {slot}
              </button>
            ))}
          </div>

          {/* Commit Button */}
          <button
            onClick={handleSaveToDiary}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-white font-extrabold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/50 transition-all mt-1"
          >
            <Check size={18} />
            <span>Save to Daily Log</span>
          </button>
        </div>
      )}

      {/* Manual Search Fallback Toggle & UI */}
      {(showManualSearch || scanStatus === 'idle') && (
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200">Search Food Manually:</span>
            <span className="text-[10px] text-emerald-400 font-semibold">Works 100% Offline</span>
          </div>

          <div className="relative">
            <Search size={16} className="absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleManualSearch(e.target.value)}
              placeholder="e.g. Apple, Boiled Egg, Paneer, Rice..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {searchResults.length > 0 && (
            <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto">
              {searchResults.map((item) => (
                <button
                  key={item.food_id || item.id}
                  onClick={() => handleSelectManualFood(item)}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-700/60 active:scale-98 text-left transition-all border border-slate-700/40"
                >
                  <span className="text-xs font-bold text-white">{item.display || item.name}</span>
                  <span className="text-[11px] text-emerald-400 font-semibold">
                    {item.calories_per_100g || item.calories} kcal
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
