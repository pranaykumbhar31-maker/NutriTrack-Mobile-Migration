import React, { useState } from 'react';
import { MobileHeader } from './components/MobileHeader';
import { BottomNavBar, NavTab } from './components/BottomNavBar';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { DashboardView } from './views/DashboardView';
import { RoutineView } from './views/RoutineView';
import { ScannerView } from './views/ScannerView';
import { CalendarView } from './views/CalendarView';
import { ProfileView } from './views/ProfileView';
import { AssistantModal } from './components/AssistantModal';
import { ReminderModal } from './components/ReminderModal';
import { ManualMealModal } from './components/ManualMealModal';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isRemindersOpen, setIsRemindersOpen] = useState(false);
  const [isManualLoggerOpen, setIsManualLoggerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Header */}
      <MobileHeader
        onOpenAssistant={() => setIsAssistantOpen(true)}
        onOpenReminders={() => setIsRemindersOpen(true)}
      />

      {/* PWA Install Banner */}
      <PWAInstallBanner />

      {/* Main Screen Content */}
      <main className="flex-1 max-w-md mx-auto w-full px-4 pt-2">
        {activeTab === 'dashboard' && (
          <DashboardView
            onOpenManualLogger={() => setIsManualLoggerOpen(true)}
            onNavigateToRoutines={() => setActiveTab('routine')}
          />
        )}
        {activeTab === 'routine' && <RoutineView />}
        {activeTab === 'scanner' && (
          <ScannerView onMealSaved={() => setActiveTab('dashboard')} />
        )}
        {activeTab === 'calendar' && <CalendarView />}
        {activeTab === 'profile' && <ProfileView />}
      </main>

      {/* Fixed Bottom Navigation Bar */}
      <BottomNavBar activeTab={activeTab} onSelectTab={setActiveTab} />

      {/* Slide-Up Modals */}
      <AssistantModal
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
      />
      <ReminderModal
        isOpen={isRemindersOpen}
        onClose={() => setIsRemindersOpen(false)}
      />
      <ManualMealModal
        isOpen={isManualLoggerOpen}
        onClose={() => setIsManualLoggerOpen(false)}
        onMealAdded={() => setActiveTab('dashboard')}
      />
    </div>
  );
};

export default App;
