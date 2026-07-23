"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Package, ArrowRight, ShieldCheck, Zap, Search, LayoutDashboard } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [searchTracking, setSearchTracking] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTracking.trim()) {
      router.push(`/track/${searchTracking.trim().toUpperCase()}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Navbar */}
      <nav className="border-b border-slate-200 bg-white sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-blue-600 p-2 rounded-xl shadow-md shadow-blue-600/20">
              <Package className="w-6 h-6 text-white" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-slate-900">
              Trackflow<span className="text-blue-600">.Express</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-blue-600/20 transition-all flex items-center gap-2 active:scale-95"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Espace Admin</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 text-center">
        <div className="animate-slide-up space-y-6 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider border border-blue-200">
            <Package className="w-3.5 h-3.5" />
            <span>Plateforme Officielle de Suivi & Logistique</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-tight">
            Le suivi de vos colis, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">simplifié & instantané.</span>
          </h1>

          <p className="text-base sm:text-xl text-slate-600 max-w-2xl mx-auto font-normal">
            Saisissez votre numéro de suivi ci-dessous pour localiser et suivre l'acheminement de votre colis en temps réel.
          </p>

          {/* Direct Tracking Search Bar */}
          <form onSubmit={handleSearch} className="max-w-xl mx-auto pt-4 pb-2">
            <div className="bg-white p-2 rounded-2xl shadow-xl border border-slate-200 flex items-center gap-2">
              <div className="pl-3 text-slate-400">
                <Search className="w-5 h-5 text-blue-600" />
              </div>
              <input
                type="text"
                required
                placeholder="Entrez votre N° de suivi (ex: BV-0001, BV-0018...)"
                value={searchTracking}
                onChange={(e) => setSearchTracking(e.target.value)}
                className="w-full bg-transparent px-2 py-2.5 text-sm font-semibold text-slate-900 placeholder:text-slate-400 outline-none"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl shadow-md transition-all shrink-0 flex items-center gap-1.5 active:scale-95"
              >
                <span>Suivre</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-2">
            <Link
              href="/admin"
              className="px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl shadow-lg transition-all flex items-center gap-2 w-full sm:w-auto justify-center active:scale-95"
            >
              <LayoutDashboard className="w-4 h-4 text-blue-400" />
              <span>Accéder au Tableau de Bord Admin</span>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-20 grid md:grid-cols-3 gap-6 text-left max-w-5xl mx-auto">
          <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mb-4 text-blue-600 border border-blue-200">
              <Package className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Gestion Intuitive</h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Créez et suivez vos colis depuis un tableau de bord moderne, clair et réactif.
            </p>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center mb-4 text-emerald-600 border border-emerald-200">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Suivi En Temps Réel</h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Mettez à jour le statut des envois avec des notifications automatiques envoyées à vos clients.
            </p>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center mb-4 text-amber-600 border border-amber-200">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Expérience Premium</h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Offrez à vos clients une page de suivi esthétique, rapide et parfaitement lisible sur tous les écrans.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
