import React from 'react';
import { LayoutDashboard, Dumbbell, Scan, Calendar, User } from 'lucide-react';

export type NavTab = 'dashboard' | 'routine' | 'scanner' | 'calendar' | 'profile';

interface BottomNavBarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeTab, onSelectTab }) => {
  const handleSelect = (tab: NavTab) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(12);
    }
    onSelectTab(tab);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 pb-safe glass-nav">
      <div className="max-w-md mx-auto px-4 py-2 flex items-center justify-between">
        {/* Dashboard */}
        <button
          onClick={() => handleSelect('dashboard')}
          className={`flex-1 flex flex-col items-center gap-1 py-1 transition-all ${
            activeTab === 'dashboard' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <LayoutDashboard size={20} className={activeTab === 'dashboard' ? 'stroke-[2.5]' : 'stroke-2'} />
          <span className="text-[10px]">Dashboard</span>
        </button>

        {/* Routines */}
        <button
          onClick={() => handleSelect('routine')}
          className={`flex-1 flex flex-col items-center gap-1 py-1 transition-all ${
            activeTab === 'routine' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Dumbbell size={20} className={activeTab === 'routine' ? 'stroke-[2.5]' : 'stroke-2'} />
          <span className="text-[10px]">Routines</span>
        </button>

        {/* Center Scanner FAB */}
        <div className="flex-1 flex justify-center -mt-5">
          <button
            onClick={() => handleSelect('scanner')}
            className={`w-14 h-14 rounded-full flex flex-col items-center justify-center shadow-lg transition-transform active:scale-90 ${
              activeTab === 'scanner'
                ? 'bg-emerald-500 text-white ring-4 ring-emerald-500/30 shadow-emerald-500/50'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/60'
            }`}
            aria-label="Scan Food"
          >
            <Scan size={24} className="stroke-[2.5]" />
          </button>
        </div>

        {/* Calendar */}
        <button
          onClick={() => handleSelect('calendar')}
          className={`flex-1 flex flex-col items-center gap-1 py-1 transition-all ${
            activeTab === 'calendar' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calendar size={20} className={activeTab === 'calendar' ? 'stroke-[2.5]' : 'stroke-2'} />
          <span className="text-[10px]">Calendar</span>
        </button>

        {/* Profile */}
        <button
          onClick={() => handleSelect('profile')}
          className={`flex-1 flex flex-col items-center gap-1 py-1 transition-all ${
            activeTab === 'profile' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <User size={20} className={activeTab === 'profile' ? 'stroke-[2.5]' : 'stroke-2'} />
          <span className="text-[10px]">Profile</span>
        </button>
      </div>
    </nav>
  );
};
