"use client";

import { useState, useEffect } from 'react';
import { Download, Share, PlusSquare, X, Smartphone, CheckCircle, QrCode } from 'lucide-react';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);

  useEffect(() => {
    // 1. Check if running in Standalone (already installed)
    const inStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    setIsStandalone(inStandalone);
    if (inStandalone) return;

    // 2. Detect iOS Device
    const ua = window.navigator.userAgent;
    const isIOSDevice = /iPhone|iPad|iPod/.test(ua) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // Show prompt by default on non-standalone devices
    setShowPrompt(true);

    // 3. Android / Chrome / Edge beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    } else {
      setShowGuideModal(true);
    }
  };

  if (isStandalone || !showPrompt) return null;

  return (
    <>
      {/* Floating Bottom Banner */}
      <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-50 animate-slide-up">
        <div className="bg-slate-900/95 text-white border border-slate-700/90 backdrop-blur-xl rounded-2xl p-4 shadow-2xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-md">
              <Smartphone className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white leading-tight">Installer Trackflow</h4>
              <p className="text-xs text-slate-300 mt-0.5">Accès direct sur votre téléphone</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleInstallClick}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 shrink-0 active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Installer</span>
            </button>
            <button
              onClick={() => setShowPrompt(false)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
              title="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Guide Modal for iOS & Browsers with QR Code */}
      {showGuideModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 text-white rounded-3xl p-6 w-full max-w-md border border-slate-700 shadow-2xl space-y-5 animate-slide-up text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Smartphone className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">Installer sur votre téléphone</h3>
              <p className="text-xs text-slate-400">
                Scannez le QR Code ou suivez ces étapes simples :
              </p>
            </div>

            {/* QR Code Section for Desktop viewing */}
            <div className="bg-white p-3 rounded-2xl w-44 h-44 mx-auto shadow-md flex items-center justify-center border border-slate-200">
              <img
                src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=http://172.20.10.3:3000"
                alt="QR Code Trackflow"
                className="w-full h-full object-contain"
              />
            </div>
            <p className="text-[11px] text-blue-400 font-medium">
              📱 Scannez avec l'appareil photo de votre téléphone
            </p>

            {isIOS ? (
              <div className="space-y-3 text-left bg-slate-800/80 p-4 rounded-2xl border border-slate-700/60 text-xs">
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                    1
                  </span>
                  <p className="text-slate-200 pt-0.5">
                    Sur Safari, appuyez sur le bouton <strong className="text-white inline-flex items-center gap-1"><Share className="w-3.5 h-3.5 text-blue-400 inline" /> Partager</strong> au bas de l'écran.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                    2
                  </span>
                  <p className="text-slate-200 pt-0.5">
                    Sélectionnez <strong className="text-white inline-flex items-center gap-1"><PlusSquare className="w-3.5 h-3.5 text-emerald-400 inline" /> Sur l'écran d'accueil</strong>.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-left bg-slate-800/80 p-4 rounded-2xl border border-slate-700/60 text-xs">
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                    1
                  </span>
                  <p className="text-slate-200 pt-0.5">
                    Sur Chrome, appuyez sur le menu (les <strong className="text-white">3 petits points ⋮</strong> en haut à droite).
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                    2
                  </span>
                  <p className="text-slate-200 pt-0.5">
                    Sélectionnez <strong className="text-white inline-flex items-center gap-1"><Download className="w-3.5 h-3.5 text-blue-400 inline" /> Installer l'application</strong> ou <strong className="text-white">Ajouter à l'écran d'accueil</strong>.
                  </p>
                </div>
              </div>
            )}

            <button
              onClick={() => setShowGuideModal(false)}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>J'ai compris</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
