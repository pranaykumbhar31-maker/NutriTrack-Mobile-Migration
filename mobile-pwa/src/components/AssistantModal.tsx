import React, { useState } from 'react';
import { X, Sparkles, Send, Bot, User } from 'lucide-react';
import { sendAssistantMessage } from '../lib/api';
import { getUserProfile, getDailyMeals } from '../lib/storage';
import { aggregateDailyNutrition } from '../lib/nutritionEngine';

interface AssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
}

export const AssistantModal: React.FC<AssistantModalProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm-init',
      sender: 'assistant',
      text: "Hello! I am your NutriTrack Clinical AI Assistant. How can I help optimize your meals, cravings, or routines today?",
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);

  if (!isOpen) return null;

  const handleSend = async () => {
    const text = inputValue.trim();
    if (!text || isSending) return;

    const userMsg: Message = { id: `msg-${Date.now()}`, sender: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsSending(true);

    const profile = getUserProfile();
    const today = new Date().toISOString().split('T')[0];
    const todayMeals = getDailyMeals(today);
    const consumed = aggregateDailyNutrition(todayMeals);

    const context = {
      userGoal: profile.goal,
      calorieTarget: profile.dailyCalorieTarget,
      caloriesConsumed: consumed.calories,
      proteinConsumed: consumed.protein,
      recentMeals: todayMeals.slice(0, 3).map((m: any) => m.items.map((i: any) => i.foodItem?.name || 'Meal').join(', ')),
    };

    const replyText = await sendAssistantMessage(text, context);
    const assistantMsg: Message = { id: `msg-${Date.now() + 1}`, sender: 'assistant', text: replyText };
    setMessages((prev) => [...prev, assistantMsg]);
    setIsSending(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border-t border-slate-700 rounded-t-3xl h-[85dvh] flex flex-col shadow-2xl overflow-hidden pb-safe">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white">AI Nutritionist</h3>
              <span className="text-[10px] text-emerald-400 font-semibold">Active Intelligence</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl active:scale-95"
          >
            <X size={20} />
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 border-b border-slate-800/60 flex items-center gap-2 overflow-x-auto text-[11px]">
          {['High-protein dinner ideas', 'How to handle evening sweet cravings', 'Is my sodium intake safe today?'].map(
            (suggestion) => (
              <button
                key={suggestion}
                onClick={() => setInputValue(suggestion)}
                className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 whitespace-nowrap shrink-0 border border-slate-700/60"
              >
                {suggestion}
              </button>
            )
          )}
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-start gap-2.5 max-w-[85%] ${
                m.sender === 'user' ? 'self-end flex-row-reverse' : 'self-start'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                  m.sender === 'user'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 text-emerald-400 border border-slate-700'
                }`}
              >
                {m.sender === 'user' ? <User size={14} /> : <Bot size={14} />}
              </div>
              <div
                className={`p-3 rounded-2xl text-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-emerald-600 text-white rounded-tr-none shadow-md'
                    : 'bg-slate-800/90 text-slate-200 border border-slate-700/60 rounded-tl-none shadow-sm'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
          {isSending && (
            <div className="self-start flex items-center gap-2 text-xs text-emerald-400 italic bg-slate-800/50 px-3 py-2 rounded-xl">
              <Sparkles size={14} className="animate-spin" />
              <span>Nutritionist is analyzing...</span>
            </div>
          )}
        </div>

        {/* Message Input Box */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/90 flex items-center gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about calories, macros, or foods..."
            className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isSending}
            className="p-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-white rounded-xl active:scale-95 transition-all shadow-md"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
