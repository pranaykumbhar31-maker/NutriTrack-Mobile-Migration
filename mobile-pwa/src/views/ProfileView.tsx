import React, { useState } from 'react';
import { User, Scale, Award, Heart, Shield, Save, CheckCircle2 } from 'lucide-react';
import { getUserProfile, saveUserProfile } from '../lib/storage';
import { calculateBMI, calculateTargets } from '../lib/nutritionEngine';
import { UserProfile } from '../lib/types';

export const ProfileView: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile>(getUserProfile());
  const [isSaved, setIsSaved] = useState(false);

  const bmiData = calculateBMI(profile.weightKg || 58, profile.heightCm || 165);
  const targets = calculateTargets(profile);

  const handleSave = () => {
    saveUserProfile(profile);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
    if ('vibrate' in navigator) navigator.vibrate(20);
  };

  return (
    <div className="flex flex-col gap-4 pb-24">
      {/* Header Profile Card */}
      <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-4 flex items-center gap-3.5 shadow-sm">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center text-white font-extrabold text-xl shadow-md">
          {profile.name ? profile.name[0] : 'M'}
        </div>
        <div className="flex-1">
          <h2 className="text-base font-extrabold text-white">{profile.name || 'Maya'}</h2>
          <span className="text-xs text-slate-400">Personal Biometrics & Goals</span>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
              {profile.activityLevel?.replace('_', ' ').toUpperCase()}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-500/20 text-sky-400">
              {profile.goal?.replace('_', ' ').toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* BMI & Ideal Weight Gauge Card */}
      <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-4 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300">Body Mass Index (BMI)</span>
          <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${bmiData.color}`}>
            {bmiData.category}
          </span>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-white">{bmiData.bmi}</span>
          <span className="text-xs text-slate-400">kg/m²</span>
        </div>

        {/* Visual BMI Bar */}
        <div className="w-full h-2.5 bg-slate-700/60 rounded-full overflow-hidden flex">
          <div className="w-[18.5%] bg-amber-400/60 h-full" title="Underweight" />
          <div className="w-[30%] bg-emerald-500 h-full" title="Normal" />
          <div className="w-[25%] bg-amber-500 h-full" title="Overweight" />
          <div className="w-[26.5%] bg-rose-500 h-full" title="Obese" />
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
          <span>Healthy weight range for {profile.heightCm} cm:</span>
          <span className="font-bold text-emerald-400">
            {bmiData.healthyWeightRange.min} - {bmiData.healthyWeightRange.max} kg
          </span>
        </div>
      </div>

      {/* Clinical Target Expenditure */}
      <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-4">
        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 block">
          Calculated Daily Energy Needs
        </span>
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-700/40">
            <span className="text-[10px] text-slate-400">BMR (Basal Rate)</span>
            <div className="text-base font-extrabold text-white">{targets.bmr} kcal</div>
            <span className="text-[10px] text-slate-400">Mifflin-St Jeor</span>
          </div>
          <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-700/40">
            <span className="text-[10px] text-slate-400">TDEE (Total Burn)</span>
            <div className="text-base font-extrabold text-emerald-400">{targets.tdee} kcal</div>
            <span className="text-[10px] text-slate-400">With Activity</span>
          </div>
        </div>
      </div>

      {/* Biometric Edit Inputs */}
      <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-4 flex flex-col gap-3">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider">
          Update Biometrics
        </h3>

        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className="text-[11px] text-slate-400">Current Weight (kg)</label>
            <input
              type="number"
              value={profile.weightKg}
              onChange={(e) => setProfile({ ...profile, weightKg: parseFloat(e.target.value) || 0 })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs text-white mt-1"
            />
          </div>
          <div>
            <label className="text-[11px] text-slate-400">Target Weight (kg)</label>
            <input
              type="number"
              value={profile.targetWeightKg}
              onChange={(e) =>
                setProfile({ ...profile, targetWeightKg: parseFloat(e.target.value) || 0 })
              }
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs text-white mt-1"
            />
          </div>
          <div>
            <label className="text-[11px] text-slate-400">Height (cm)</label>
            <input
              type="number"
              value={profile.heightCm}
              onChange={(e) => setProfile({ ...profile, heightCm: parseFloat(e.target.value) || 0 })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs text-white mt-1"
            />
          </div>
          <div>
            <label className="text-[11px] text-slate-400">Age (years)</label>
            <input
              type="number"
              value={profile.age}
              onChange={(e) => setProfile({ ...profile, age: parseInt(e.target.value, 10) || 0 })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs text-white mt-1"
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md shadow-emerald-900/40 transition-all mt-1"
        >
          {isSaved ? <CheckCircle2 size={16} /> : <Save size={16} />}
          <span>{isSaved ? 'Biometrics Saved!' : 'Save Biometrics'}</span>
        </button>
      </div>
    </div>
  );
};
