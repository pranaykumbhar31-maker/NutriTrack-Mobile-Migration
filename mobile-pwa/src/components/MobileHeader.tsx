import React, { useState, useEffect } from 'react';
import { Sparkles, Bell, Wifi, WifiOff } from 'lucide-react';

interface MobileHeaderProps {
  onOpenAssistant: () => void;
  onOpenReminders: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({ onOpenAssistant, onOpenReminders }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <header className="sticky top-0 z-30 pt-safe px-4 py-3 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center shadow-md shadow-emerald-900/40">
          <span className="text-white font-extrabold text-base">N</span>
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="text-base font-extrabold text-white tracking-tight">NutriTrack</h1>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              AI
            </span>
          </div>
          <div className="flex items-center gap-1 text-[10px]">
            {isOnline ? (
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <Wifi size={10} /> Online
              </span>
            ) : (
              <span className="flex items-center gap-1 text-amber-400 font-semibold animate-pulse">
                <WifiOff size={10} /> Offline Mode
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={onOpenAssistant}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-emerald-400 border border-slate-700/60 shadow-sm transition-all"
          aria-label="Open AI Assistant"
        >
          <Sparkles size={18} />
        </button>
        <button
          onClick={onOpenReminders}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 border border-slate-700/60 shadow-sm transition-all"
          aria-label="Open Reminders"
        >
          <Bell size={18} />
        </button>
      </div>
    </header>
  );
};
