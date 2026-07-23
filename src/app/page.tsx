import Link from 'next/link';
import { Package, ArrowRight, ShieldCheck, Zap, Store, Building2, UserPlus, LogIn } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Navbar */}
      <nav className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-2 rounded-xl shadow-lg shadow-blue-500/20">
              <Package className="w-6 h-6 text-white" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-white">Trackflow<span className="text-blue-500">.SaaS</span></span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs sm:text-sm font-semibold text-slate-300 hover:text-white transition-colors px-3 py-2 rounded-xl flex items-center gap-1.5"
            >
              <LogIn className="w-4 h-4 text-blue-400" />
              <span>Connexion</span>
            </Link>

            <Link
              href="/register-store"
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-blue-600/30 transition-all flex items-center gap-2 active:scale-95"
            >
              <Building2 className="w-4 h-4" />
              <span>Créer ma boutique</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 text-center">
        <div className="animate-slide-up space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider">
            <Store className="w-3.5 h-3.5" />
            <span>Plateforme Multi-Boutiques Logistiques</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight max-w-4xl mx-auto">
            Gérez vos colis & convois dans votre <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Espace Privé.</span>
          </h1>

          <p className="text-base sm:text-xl text-slate-400 max-w-2xl mx-auto font-normal">
            Créez votre propre boutique, invitez vos employés, personnalisez votre branding et offrez un suivi haut de gamme à tous vos clients.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Link
              href="/register-store"
              className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-base rounded-2xl shadow-xl shadow-blue-600/40 transition-all flex items-center gap-2 w-full sm:w-auto justify-center active:scale-95"
            >
              <UserPlus className="w-5 h-5" />
              <span>Créer ma boutique maintenant</span>
            </Link>

            <Link
              href="/admin"
              className="px-6 py-4 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-base rounded-2xl transition-all flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              <span>Accéder au Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-20 grid md:grid-cols-3 gap-6 text-left max-w-5xl mx-auto">
          <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-3xl backdrop-blur-md">
            <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-4 text-blue-400 border border-blue-500/20">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Isolation Multi-Tenant</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Chaque boutique possède son propre espace, ses clients, ses employés et son logo. Données strictement étanches.
            </p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-3xl backdrop-blur-md">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-4 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Rôles & Permissions</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Définissez des rôles (`OWNER`, `ADMIN`, `AGENT`) pour vos employés et gérez qui peut ajouter ou modifier des colis.
            </p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-3xl backdrop-blur-md">
            <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-4 text-amber-400 border border-amber-500/20">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Notifications Automatiques</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Alertez vos clients automatiquement par Email, SMS et WhatsApp dès que le statut de leur colis évolue.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
