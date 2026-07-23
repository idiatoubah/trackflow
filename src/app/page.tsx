"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Package,
  ArrowRight,
  ShieldCheck,
  Zap,
  Search,
  LayoutDashboard,
  Building2,
  Globe2,
  Sparkles,
  Truck,
  CheckCircle2,
  Clock,
  TrendingUp,
  Lock
} from 'lucide-react';

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
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 font-sans selection:bg-blue-500 selection:text-white relative overflow-hidden">
      {/* Background Glow Lights */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-tr from-blue-600/20 via-indigo-600/20 to-purple-600/10 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute top-1/3 -left-48 w-96 h-96 bg-blue-500/10 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute bottom-10 -right-48 w-96 h-96 bg-purple-500/10 blur-[120px] pointer-events-none rounded-full" />

      {/* Navbar */}
      <nav className="border-b border-white/10 bg-[#0b0f19]/80 backdrop-blur-xl sticky top-0 z-50 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur-sm opacity-70 group-hover:opacity-100 transition duration-300" />
              <div className="relative bg-slate-900 border border-white/20 p-2.5 rounded-2xl">
                <Package className="w-6 h-6 text-blue-400" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-black text-2xl tracking-tight text-white flex items-center gap-1">
                Trackflow<span className="text-blue-500">.</span>
              </span>
              <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase -mt-1">
                Express Logistique
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/register-store"
              className="px-4 py-2.5 text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 font-semibold text-xs sm:text-sm rounded-xl transition-all border border-white/10 hover:border-white/20 flex items-center gap-2 backdrop-blur-md active:scale-95"
            >
              <Building2 className="w-4 h-4 text-emerald-400" />
              <span>Créer une Boutique</span>
            </Link>

            <Link
              href="/admin"
              className="relative group px-5 py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all flex items-center gap-2 active:scale-95 overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              <LayoutDashboard className="w-4 h-4 relative z-10" />
              <span className="relative z-10">Espace Admin</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24 text-center relative z-10">
        <div className="space-y-8 max-w-4xl mx-auto">
          {/* Badge Top */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider backdrop-blur-md shadow-inner">
            <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
            <span>Plateforme Logistique de Nouvelle Génération</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-tight leading-[1.15]">
            Le suivi de colis <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">
              Haut de Gamme & Temps Réel.
            </span>
          </h1>

          <p className="text-base sm:text-xl text-slate-400 max-w-2xl mx-auto font-normal leading-relaxed">
            Consultez instantanément l'acheminement de vos expéditions internationales (Guinée, France, USA) grâce à notre système certifié.
          </p>

          {/* Premium Glowing Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto pt-4">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl blur-md opacity-50 group-hover:opacity-90 transition duration-500" />
              <div className="relative bg-slate-900/90 backdrop-blur-2xl p-2.5 rounded-2xl border border-white/20 flex items-center gap-3 shadow-2xl">
                <div className="pl-3 text-blue-400">
                  <Search className="w-6 h-6" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Saisissez votre N° de suivi (ex: BV-0001, BV-0018...)"
                  value={searchTracking}
                  onChange={(e) => setSearchTracking(e.target.value)}
                  className="w-full bg-transparent px-2 py-3 text-base font-medium text-white placeholder:text-slate-500 outline-none"
                />
                <button
                  type="submit"
                  className="px-7 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg transition-all shrink-0 flex items-center gap-2 active:scale-95"
                >
                  <span>Rechercher</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Suggestions */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs text-slate-400">
              <span className="font-semibold text-slate-500">Exemples de suivi rapide :</span>
              <button
                type="button"
                onClick={() => setSearchTracking('BV-0001')}
                className="px-2.5 py-1 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 font-mono text-blue-400 transition-colors"
              >
                BV-0001
              </button>
              <button
                type="button"
                onClick={() => setSearchTracking('BV-0016')}
                className="px-2.5 py-1 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 font-mono text-blue-400 transition-colors"
              >
                BV-0016 (Paris)
              </button>
              <button
                type="button"
                onClick={() => setSearchTracking('BV-0018')}
                className="px-2.5 py-1 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 font-mono text-blue-400 transition-colors"
              >
                BV-0018 (USA)
              </button>
            </div>
          </form>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
            <Link
              href="/register-store"
              className="px-8 py-4 bg-emerald-600/90 hover:bg-emerald-500 text-white font-bold text-sm rounded-2xl shadow-xl shadow-emerald-600/20 border border-emerald-400/30 transition-all flex items-center gap-2.5 w-full sm:w-auto justify-center active:scale-95"
            >
              <Building2 className="w-5 h-5" />
              <span>Créer mon Entreprise / Boutique</span>
            </Link>

            <Link
              href="/admin"
              className="px-8 py-4 bg-slate-900/90 hover:bg-slate-800 text-white font-bold text-sm rounded-2xl border border-white/10 transition-all flex items-center gap-2.5 w-full sm:w-auto justify-center active:scale-95"
            >
              <LayoutDashboard className="w-5 h-5 text-blue-400" />
              <span>Accéder au Tableau de Bord</span>
            </Link>
          </div>
        </div>

        {/* Dynamic Key Stats */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 p-5 rounded-2xl text-center">
            <div className="text-3xl font-black text-white">17 Colis</div>
            <div className="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-wider">Actifs en Gestion</div>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 p-5 rounded-2xl text-center">
            <div className="text-3xl font-black text-emerald-400">93,2 kg</div>
            <div className="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-wider">Poids Total Géré</div>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 p-5 rounded-2xl text-center">
            <div className="text-3xl font-black text-blue-400">100%</div>
            <div className="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-wider">Notifications Email & SMS</div>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 p-5 rounded-2xl text-center">
            <div className="text-3xl font-black text-purple-400">24h / 7j</div>
            <div className="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-wider">Suivi Client Continu</div>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="mt-16 grid md:grid-cols-3 gap-6 text-left max-w-5xl mx-auto">
          <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 p-8 rounded-3xl hover:border-blue-500/40 transition-all group">
            <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 text-blue-400 border border-blue-500/20 group-hover:scale-110 transition-transform">
              <Truck className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Convois & Expéditions</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Mettez à jour des groupes complets de colis en 1 seul clic grâce à la mise à jour par date de départ et destination.
            </p>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 p-8 rounded-3xl hover:border-emerald-500/40 transition-all group">
            <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 text-emerald-400 border border-emerald-500/20 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Notifications Automatiques</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Vos clients reçoivent immédiatement un e-mail personnalisé et un SMS dès que le statut de leur colis évolue.
            </p>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 p-8 rounded-3xl hover:border-purple-500/40 transition-all group">
            <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6 text-purple-400 border border-purple-500/20 group-hover:scale-110 transition-transform">
              <Globe2 className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Multi-Boutiques & SaaS</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Créez et gérez votre propre entreprise logistique avec un domaine personnalisé et vos propres employés.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#070a12] py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-blue-500" />
            <span className="font-bold text-slate-300">Trackflow Express Logistique</span>
            <span>© 2026 Tous droits réservés.</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <Link href="/admin" className="hover:text-white transition-colors">Espace Admin</Link>
            <span>•</span>
            <Link href="/register-store" className="hover:text-white transition-colors">Créer une Entreprise</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
