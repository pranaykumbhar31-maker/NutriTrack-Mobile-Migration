import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

export const PWAInstallBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already in standalone PWA mode
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) {
      return; // Already installed, do not show banner
    }

    // Detect iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // If on iOS and not standalone, show after 3 seconds
    if (isIosDevice && !isStandalone) {
      const timer = setTimeout(() => setShowBanner(true), 2500);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    }
  };

  if (!showBanner) return null;

  return (
    <div className="mx-4 my-2 p-3.5 bg-gradient-to-r from-emerald-900/90 to-slate-900/90 border border-emerald-500/40 rounded-2xl shadow-lg flex items-center justify-between gap-3 text-slate-100 z-40 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-emerald-500 text-white rounded-xl shadow-md">
          <Smartphone size={20} />
        </div>
        <div className="flex-1">
          <h4 className="text-xs font-bold text-white">Install NutriTrack App</h4>
          <p className="text-[11px] text-slate-300 leading-tight">
            {isIOS
              ? 'Tap Share ⎋ then "Add to Home Screen" ⊞'
              : 'Add to home screen for native camera scanning & offline diary.'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {!isIOS && deferredPrompt && (
          <button
            onClick={handleInstallClick}
            className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1 transition-all"
          >
            <Download size={13} />
            <span>Install</span>
          </button>
        )}
        <button
          onClick={() => setShowBanner(false)}
          className="p-1 text-slate-400 hover:text-white rounded-lg"
          aria-label="Dismiss banner"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};
