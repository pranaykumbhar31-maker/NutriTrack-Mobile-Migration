import React from 'react';

interface EnergyGaugeProps {
  currentCalories: number;
  targetCalories: number;
}

export const EnergyGauge: React.FC<EnergyGaugeProps> = ({ currentCalories, targetCalories }) => {
  const percentage = Math.min(150, Math.round((currentCalories / (targetCalories || 2000)) * 100));
  const remaining = Math.max(0, targetCalories - currentCalories);
  const isOver = currentCalories > targetCalories;

  // SVG parameters
  const size = 180;
  const strokeWidth = 14;
  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;

  // Arc length (260 degrees arc for a speedo/health gauge look)
  const arcLength = circumference * (260 / 360);
  const strokeDashoffset = arcLength - (arcLength * Math.min(100, percentage)) / 100;

  // Dynamic status color
  let strokeColor = '#10b981'; // Emerald 500
  let badgeColor = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
  let statusText = `${percentage}% of daily goal`;

  if (isOver) {
    strokeColor = '#f43f5e'; // Rose 500
    badgeColor = 'bg-rose-500/20 text-rose-400 border-rose-500/30';
    statusText = `${currentCalories - targetCalories} kcal surplus`;
  } else if (percentage > 90) {
    strokeColor = '#f59e0b'; // Amber 500
    badgeColor = 'bg-amber-500/20 text-amber-400 border-amber-500/30';
  }

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="relative w-[180px] h-[180px] flex items-center justify-center">
        <svg
          width={size}
          height={size}
          className="transform -rotate-[130deg]"
          viewBox={`0 0 ${size} ${size}`}
        >
          {/* Background track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke="#1e293b"
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
          />
          {/* Animated active progress */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Center values */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-extrabold text-white tracking-tight">
            {currentCalories.toLocaleString()}
          </span>
          <span className="text-xs text-slate-400 font-medium -mt-1">
            of {targetCalories.toLocaleString()} kcal
          </span>
          <span className="text-[11px] text-emerald-400 mt-1 font-semibold">
            {isOver ? 'Surplus' : `${remaining} left`}
          </span>
        </div>
      </div>

      <div className={`mt-2 px-3 py-1 rounded-full text-xs font-semibold border ${badgeColor}`}>
        {statusText}
      </div>
    </div>
  );
};
