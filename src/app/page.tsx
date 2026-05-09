import Link from 'next/link';
import { Package, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="border-b border-slate-200 bg-surface sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-2 rounded-lg">
              <Package className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">Trackflow</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">
              Espace Admin
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
        <div className="animate-slide-up">
          <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-6">
            Le suivi de colis, <span className="text-primary">simplifié.</span>
          </h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-10">
            Une plateforme moderne et professionnelle pour gérer vos expéditions et offrir la meilleure expérience de suivi à vos clients.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/admin" className="btn btn-primary text-lg px-8 py-3 w-full sm:w-auto shadow-lg shadow-primary/30">
              Créer un envoi <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-24 grid md:grid-cols-3 gap-8 text-left max-w-5xl mx-auto">
          <div className="card hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 text-primary">
              <Package className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Gestion Intuitive</h3>
            <p className="text-slate-500">Créez et suivez vos colis depuis un tableau de bord moderne et réactif.</p>
          </div>
          <div className="card hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mb-4 text-success">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Suivi Fiable</h3>
            <p className="text-slate-500">Mettez à jour le statut des envois en temps réel avec des étapes claires.</p>
          </div>
          <div className="card hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center mb-4 text-warning">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Expérience Premium</h3>
            <p className="text-slate-500">Offrez à vos clients une page de suivi esthétique et parfaitement adaptée aux mobiles.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
