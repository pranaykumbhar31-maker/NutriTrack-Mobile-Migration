import React, { useState } from 'react';
import { X, Bell, Clock, Check, BellRing } from 'lucide-react';
import { getReminders, saveReminders } from '../lib/storage';
import { SmartReminder } from '../lib/types';

interface ReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReminderModal: React.FC<ReminderModalProps> = ({ isOpen, onClose }) => {
  const [reminders, setReminders] = useState<SmartReminder[]>(getReminders());
  const [permissionStatus, setPermissionStatus] = useState<string>(
    typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'
  );

  if (!isOpen) return null;

  const handleToggle = (id: string) => {
    const updated = reminders.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r));
    setReminders(updated);
    saveReminders(updated);
    if ('vibrate' in navigator) navigator.vibrate(10);
  };

  const handleRequestPermission = async () => {
    if (typeof Notification !== 'undefined') {
      const res = await Notification.requestPermission();
      setPermissionStatus(res);
      if (res === 'granted') {
        new Notification('NutriTrack Reminders Enabled', {
          body: 'You will now receive timely meal and hydration reminders.',
          icon: '/icons/icon-192.png',
        });
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border-t border-slate-700 rounded-t-3xl max-h-[80dvh] flex flex-col shadow-2xl overflow-hidden pb-safe">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
              <Bell size={18} />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white">Smart Reminders</h3>
              <span className="text-[10px] text-slate-400">Meal timing & hydration alerts</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl active:scale-95"
          >
            <X size={20} />
          </button>
        </div>

        {/* System Permission Prompt */}
        {permissionStatus !== 'granted' && (
          <div className="p-3 bg-amber-500/10 border-b border-amber-500/20 flex items-center justify-between gap-2 px-4">
            <span className="text-xs text-amber-300">Enable browser notifications for reminders</span>
            <button
              onClick={handleRequestPermission}
              className="px-3 py-1 bg-amber-500 text-slate-900 font-bold text-xs rounded-lg active:scale-95"
            >
              Enable
            </button>
          </div>
        )}

        {/* Reminders List */}
        <div className="p-4 flex flex-col gap-2.5 overflow-y-auto">
          {reminders.map((rem) => (
            <div
              key={rem.id}
              className="p-3 bg-slate-800/80 border border-slate-700/60 rounded-xl flex items-center justify-between gap-3 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-700/60 rounded-lg text-slate-300">
                  <Clock size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{rem.title}</h4>
                  <span className="text-[11px] text-emerald-400 font-semibold">{rem.time}</span>
                  <p className="text-[10px] text-slate-400">{rem.message}</p>
                </div>
              </div>

              {/* Toggle Switch */}
              <button
                onClick={() => handleToggle(rem.id)}
                className={`w-11 h-6 rounded-full transition-colors p-1 flex items-center ${
                  rem.enabled ? 'bg-emerald-500 justify-end' : 'bg-slate-700 justify-start'
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-md" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
