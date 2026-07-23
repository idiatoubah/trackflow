"use client";

import { WifiOff, RotateCw, Package, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center items-center p-6 text-center select-none font-sans">
      <div className="bg-slate-800/80 border border-slate-700/80 backdrop-blur-xl rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6 animate-slide-up">
        {/* Animated Icon */}
        <div className="w-20 h-20 mx-auto rounded-3xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-inner">
          <WifiOff className="w-10 h-10 stroke-[1.75]" />
        </div>

        {/* Title & Description */}
        <div className="space-y-2">
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center justify-center gap-2">
            <span>Connexion Indisponible</span>
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            Vous êtes actuellement hors-ligne. Trackflow nécessite une connexion Internet pour synchroniser l'état des colis et envoyer les notifications.
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-2 space-y-3">
          <button
            onClick={() => window.location.reload()}
            className="w-full py-3.5 px-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm rounded-2xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2.5 active:scale-[0.98]"
          >
            <RotateCw className="w-4 h-4" />
            <span>Réessayer la connexion</span>
          </button>

          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors pt-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Retour à l'accueil</span>
          </Link>
        </div>

        {/* Footer Brand */}
        <div className="pt-4 border-t border-slate-700/50 flex items-center justify-center gap-2 text-xs font-semibold text-slate-500">
          <Package className="w-4 h-4 text-blue-500" />
          <span>Trackflow PWA • Mode Résilient</span>
        </div>
      </div>
    </div>
  );
}
