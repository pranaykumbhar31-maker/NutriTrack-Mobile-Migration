import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, MoreVertical, CheckCircle2 } from 'lucide-react';

export const PWAInstallBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already running in standalone PWA mode
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) {
      return; // Already installed, do not show banner
    }

    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Always show banner after 1.5 seconds if not in standalone mode
    const timer = setTimeout(() => {
      setShowBanner(true);
    }, 1200);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setShowBanner(false);
        }
        setDeferredPrompt(null);
      } catch (err) {
        setShowGuideModal(true);
      }
    } else {
      // If browser doesn't support direct prompt over local HTTP, show visual guide
      setShowGuideModal(true);
    }
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Top Banner */}
      <div className="mx-4 my-2 p-3.5 bg-gradient-to-r from-emerald-900/95 to-slate-900/95 border border-emerald-500/50 rounded-2xl shadow-xl flex items-center justify-between gap-3 text-slate-100 z-40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500 text-white rounded-xl shadow-md">
            <Smartphone size={20} />
          </div>
          <div className="flex-1">
            <h4 className="text-xs font-extrabold text-white">Install NutriTrack App</h4>
            <p className="text-[11px] text-emerald-200/90 leading-tight">
              {isIOS
                ? 'Tap Share ⎋ then "Add to Home Screen" ⊞'
                : 'Add to Android home screen for native full-screen app experience.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleInstallClick}
            className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition-all"
          >
            <Download size={13} />
            <span>Install</span>
          </button>
          <button
            onClick={() => setShowBanner(false)}
            className="p-1 text-slate-400 hover:text-white rounded-lg"
            aria-label="Dismiss banner"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Guide Modal for Android (when browser requires manual 3-dots install) */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-sm w-full p-5 shadow-2xl flex flex-col gap-4 text-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
                  <Smartphone size={18} />
                </div>
                <h3 className="text-sm font-extrabold text-white">How to Install on Android</h3>
              </div>
              <button
                onClick={() => setShowGuideModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Follow these simple steps in Google Chrome on your phone to add the app icon to your Android home screen:
            </p>

            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-3 p-3 bg-slate-800/80 border border-slate-700/60 rounded-xl">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                  1
                </div>
                <div className="text-xs">
                  <span className="font-bold text-white">Tap the 3 dots menu (⋮)</span> in the top-right corner of Google Chrome.
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-slate-800/80 border border-slate-700/60 rounded-xl">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                  2
                </div>
                <div className="text-xs">
                  Tap <span className="font-bold text-emerald-400">"Add to Home screen"</span> or <span className="font-bold text-emerald-400">"Install app"</span>.
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-slate-800/80 border border-slate-700/60 rounded-xl">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                  3
                </div>
                <div className="text-xs">
                  Tap <span className="font-bold text-white">"Install"</span> or <span className="font-bold text-white">"Add"</span>. Android will download the app icon to your home screen!
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowGuideModal(false)}
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-white font-bold text-xs rounded-xl transition-all shadow-md mt-1"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </>
  );
};
