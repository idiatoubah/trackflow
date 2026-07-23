"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Building2,
  Package,
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  Globe,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  ArrowLeft,
  Sparkles
} from 'lucide-react';

export default function RegisterStorePage() {
  const router = useRouter();
  const [storeName, setStoreName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('Guinée');
  const [managerName, setManagerName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/auth/register-store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeName,
          logoUrl: logoUrl || undefined,
          address: address || undefined,
          phone: phone || undefined,
          email,
          country,
          managerName,
          password,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push('/admin');
      } else {
        setError(data.error || 'Erreur lors de la création de la boutique');
      }
    } catch (err) {
      setError('Erreur serveur. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 font-sans flex flex-col justify-center items-center p-4 sm:p-8 relative overflow-hidden selection:bg-blue-500 selection:text-white">
      {/* Background Glow Lights */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-tr from-blue-600/20 via-indigo-600/20 to-purple-600/10 blur-[140px] pointer-events-none rounded-full" />

      {/* Top Back Link */}
      <div className="w-full max-w-2xl mb-6 relative z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl border border-white/10 backdrop-blur-md active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 text-blue-400" />
          <span>Retour à l'accueil</span>
        </Link>
      </div>

      {/* Main Glass Form Container */}
      <div className="w-full max-w-2xl relative z-10 space-y-6">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Inscription Entreprise / SaaS</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Créer votre <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Entreprise Logistique</span>
          </h1>

          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Configurez votre espace et commencez à gérer vos colis et vos clients dès aujourd'hui.
          </p>
        </div>

        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition duration-500" />

          <form onSubmit={handleSubmit} className="relative bg-slate-900/90 backdrop-blur-2xl p-6 sm:p-8 rounded-3xl border border-white/15 shadow-2xl space-y-6">
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center gap-3 text-red-400 text-xs font-semibold animate-shake">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Store Name */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-blue-400" />
                  <span>Nom de l'entreprise / boutique *</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex: TransLog Express Guinée"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 focus:border-blue-500 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition-all"
                />
              </div>

              {/* Manager Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-blue-400" />
                  <span>Nom du gérant *</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex: Idiatou Bah"
                  value={managerName}
                  onChange={(e) => setManagerName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 focus:border-blue-500 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition-all"
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-blue-400" />
                  <span>Email professionnel *</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="contact@boutique.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 focus:border-blue-500 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition-all"
                />
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-blue-400" />
                  <span>Téléphone de contact</span>
                </label>
                <input
                  type="tel"
                  placeholder="+224 620 00 00 00"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 focus:border-blue-500 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition-all"
                />
              </div>

              {/* Country */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-blue-400" />
                  <span>Pays du siège *</span>
                </label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full bg-[#111827] border border-white/10 focus:border-blue-500 rounded-xl px-4 py-3 text-sm text-white outline-none transition-all font-medium"
                >
                  <option value="Guinée">Guinée 🇬🇳</option>
                  <option value="France">France 🇫🇷</option>
                  <option value="Sénégal">Sénégal 🇸🇳</option>
                  <option value="Côte d'Ivoire">Côte d'Ivoire 🇨🇮</option>
                  <option value="États-Unis">États-Unis 🇺🇸</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>

              {/* Address */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-400" />
                  <span>Adresse / Ville</span>
                </label>
                <input
                  type="text"
                  placeholder="ex: Kipé, Conakry"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 focus:border-blue-500 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition-all"
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-blue-400" />
                  <span>Mot de passe d'administration *</span>
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 focus:border-blue-500 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-6 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold text-sm rounded-xl shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Création en cours...</span>
              ) : (
                <>
                  <span>Créer mon entreprise et accéder à mon espace</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
