import React, { useState } from 'react';
import { Calendar as CalendarIcon, Sparkles, AlertCircle, Check, Info, ShieldCheck } from 'lucide-react';
import { DEFAULT_CALENDAR_EVENTS } from '../lib/festivalEngine';
import { CalendarEvent } from '../lib/types';

export const CalendarView: React.FC = () => {
  const [events] = useState<CalendarEvent[]>(DEFAULT_CALENDAR_EVENTS);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent>(DEFAULT_CALENDAR_EVENTS[0]);

  return (
    <div className="flex flex-col gap-4 pb-24">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950/90 to-slate-900 border border-emerald-500/30 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-1">
          <CalendarIcon className="text-emerald-400" size={18} />
          <h2 className="text-base font-extrabold text-white">Cultural & Festival Calendar</h2>
        </div>
        <p className="text-xs text-slate-300">
          Smart fasting adaptations, holiday calorie buffering & compliant traditional meal plans.
        </p>
      </div>

      {/* Festival Event Horizontal Slider */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {events.map((evt) => (
          <button
            key={evt.id}
            onClick={() => setSelectedEvent(evt)}
            className={`p-3 rounded-2xl text-left shrink-0 w-44 transition-all border ${
              selectedEvent.id === evt.id
                ? 'bg-emerald-950/60 border-emerald-500 text-white shadow-md'
                : 'bg-slate-800/80 border-slate-700/60 text-slate-300 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                {evt.type}
              </span>
              <span className="text-[10px] text-slate-400">{evt.date}</span>
            </div>
            <h4 className="text-xs font-bold text-white truncate">{evt.title}</h4>
            <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{evt.description}</p>
          </button>
        ))}
      </div>

      {/* Selected Event Detail Card */}
      {selectedEvent && (
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-4 flex flex-col gap-3 shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                Event Focus
              </span>
              <h3 className="text-base font-extrabold text-white">{selectedEvent.title}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{selectedEvent.description}</p>
            </div>
          </div>

          {/* Pre-Event & Fasting Preparation Strategy */}
          <div className="bg-slate-900/60 border border-slate-700/50 rounded-xl p-3 flex flex-col gap-2">
            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wide flex items-center gap-1.5">
              <ShieldCheck size={14} />
              <span>Nutrition & Fasting Strategy</span>
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              {selectedEvent.preEventPlan.preparationSummary}
            </p>

            <div className="flex flex-col gap-1 pt-1">
              <span className="text-[11px] font-semibold text-slate-400">Smart Nutritional Swaps:</span>
              {selectedEvent.preEventPlan.smartSwaps.map((swap, idx) => (
                <div
                  key={idx}
                  className="p-2 rounded-lg bg-slate-800/60 border border-slate-700/40 text-[11px] flex flex-col gap-0.5"
                >
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-rose-400 line-through">{swap.original}</span>
                    <span className="text-emerald-400">➔ {swap.healthierAlternative}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">{swap.reason}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Mindful Enjoyment Guidance */}
          <div className="bg-slate-900/60 border border-slate-700/50 rounded-xl p-3 flex flex-col gap-1.5">
            <h4 className="text-xs font-bold text-sky-400 uppercase tracking-wide flex items-center gap-1.5">
              <Info size={14} />
              <span>Mindful Guidance During Event</span>
            </h4>
            <ul className="flex flex-col gap-1 text-[11px] text-slate-300">
              {selectedEvent.duringEventGuidance.mindfulReminders.map((rem, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-sky-400 mt-0.5">•</span>
                  <span>{rem}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Non-Punitive Recovery Plan */}
          <div className="bg-slate-900/60 border border-slate-700/50 rounded-xl p-3 flex flex-col gap-1.5">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wide">
              Post-Event Balance & Regeneration
            </h4>
            <div className="text-[11px] text-slate-300">
              <span className="font-bold text-white">
                {selectedEvent.recoveryPlan.nextMealSuggestion.title}:
              </span>{' '}
              {selectedEvent.recoveryPlan.nextMealSuggestion.description}
            </div>
            <p className="text-[10px] text-slate-400 italic mt-0.5">
              "{selectedEvent.recoveryPlan.mentalNote}"
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
