import React from 'react';

interface MacroSplitBarProps {
  protein: number;
  targetProtein: number;
  carbs: number;
  targetCarbs: number;
  fats: number;
  targetFats: number;
}

export const MacroSplitBar: React.FC<MacroSplitBarProps> = ({
  protein,
  targetProtein,
  carbs,
  targetCarbs,
  fats,
  targetFats,
}) => {
  const macros = [
    {
      label: 'Protein',
      consumed: Math.round(protein),
      target: targetProtein,
      color: 'bg-emerald-500',
      text: 'text-emerald-400',
      barBg: 'bg-emerald-500/20',
    },
    {
      label: 'Carbs',
      consumed: Math.round(carbs),
      target: targetCarbs,
      color: 'bg-sky-500',
      text: 'text-sky-400',
      barBg: 'bg-sky-500/20',
    },
    {
      label: 'Fats',
      consumed: Math.round(fats),
      target: targetFats,
      color: 'bg-amber-500',
      text: 'text-amber-400',
      barBg: 'bg-amber-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-2 w-full">
      {macros.map((m) => {
        const pct = Math.min(100, Math.round((m.consumed / (m.target || 1)) * 100));
        return (
          <div key={m.label} className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-2.5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-semibold text-slate-300">{m.label}</span>
              <span className={`text-[10px] font-bold ${m.text}`}>{pct}%</span>
            </div>
            <div className="w-full bg-slate-700/50 h-2 rounded-full overflow-hidden my-1">
              <div
                className={`h-full ${m.color} transition-all duration-500 rounded-full`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="text-[11px] text-slate-400 text-center font-medium mt-0.5">
              <span className="font-bold text-white">{m.consumed}g</span> / {m.target}g
            </div>
          </div>
        );
      })}
    </div>
  );
};
