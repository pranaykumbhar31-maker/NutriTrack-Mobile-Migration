import React from 'react';
import { Droplets, Plus } from 'lucide-react';

interface WaterTrackerProps {
  cups: number;
  targetCups: number;
  onAddCup: (amount: number) => void;
}

export const WaterTracker: React.FC<WaterTrackerProps> = ({ cups, targetCups, onAddCup }) => {
  const handleAdd = (amount: number) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(15);
    }
    onAddCup(amount);
  };

  const liters = ((cups * 250) / 1000).toFixed(1);
  const targetLiters = ((targetCups * 250) / 1000).toFixed(1);
  const percentage = Math.min(100, Math.round((cups / targetCups) * 100));

  return (
    <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-sky-500/20 text-sky-400 rounded-xl">
            <Droplets size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Daily Hydration</h3>
            <p className="text-xs text-slate-400">
              {liters}L of {targetLiters}L target ({cups} / {targetCups} glasses)
            </p>
          </div>
        </div>
        <span className="text-xs font-bold text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded-full border border-sky-500/20">
          {percentage}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-slate-700/60 h-2.5 rounded-full overflow-hidden">
        <div
          className="bg-sky-500 h-full rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Quick Add Buttons */}
      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={() => handleAdd(1)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-700/60 hover:bg-slate-700 active:scale-95 text-slate-200 text-xs font-semibold rounded-xl transition-all border border-slate-600/40"
        >
          <Plus size={14} className="text-sky-400" />
          <span>+250 ml (1 glass)</span>
        </button>
        <button
          onClick={() => handleAdd(2)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-sky-600/30 hover:bg-sky-600/40 active:scale-95 text-sky-300 text-xs font-semibold rounded-xl transition-all border border-sky-500/30"
        >
          <Plus size={14} className="text-sky-400" />
          <span>+500 ml (Bottle)</span>
        </button>
      </div>
    </div>
  );
};
