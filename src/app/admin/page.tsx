"use client";

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Package, Search, Copy, ExternalLink, Edit2, LayoutDashboard, CheckCircle2, Clock, Truck, PackageOpen, AlertTriangle } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type Package = {
  id: string;
  trackingNumber: string;
  clientEmail: string;
  clientName: string | null;
  clientPhone: string | null;
  destination: string | null;
  carrier: string | null;
  weight: number | null;
  createdAt: string;
  events: {
    status: string;
    timestamp: string;
  }[];
};

const STATUS_CONFIG: Record<string, { label: string, color: string, icon: any }> = {
  'PREPARATION': { label: 'En préparation', color: 'bg-slate-100 text-slate-700 border-slate-200', icon: PackageOpen },
  'SHIPPED': { label: 'Expédié', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Package },
  'IN_TRANSIT': { label: 'En cours de livraison', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Truck },
  'DELIVERED': { label: 'Livré', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
  'DELAYED': { label: 'Retardé', color: 'bg-red-100 text-red-700 border-red-200', icon: AlertTriangle },
};

export default function AdminDashboard() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Create Package State
  const [trackingNumber, setTrackingNumber] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [destination, setDestination] = useState('');
  const [carrier, setCarrier] = useState('');
  const [weight, setWeight] = useState('');
  const [initialStatus, setInitialStatus] = useState('PREPARATION');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update Status Modal State
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [newStatus, setNewStatus] = useState('PREPARATION');
  const [newLocation, setNewLocation] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchPackages();
    generateTrackingNumber();
  }, []);

  const generateTrackingNumber = () => {
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    setTrackingNumber(`TRK-${random}`);
  };

  const fetchPackages = async () => {
    try {
      const res = await fetch('/api/packages');
      if (res.ok) {
        const data = await res.json();
        setPackages(data);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des colis:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        trackingNumber,
        clientEmail,
        clientName: clientName || undefined,
        clientPhone: clientPhone || undefined,
        destination: destination || undefined,
        carrier: carrier || undefined,
        weight: weight ? parseFloat(weight) : undefined,
        initialStatus
      };
      
      const res = await fetch('/api/packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (res.ok) {
        // Reset form
        setClientEmail('');
        setClientName('');
        setClientPhone('');
        setDestination('');
        setCarrier('');
        setWeight('');
        setInitialStatus('PREPARATION');
        generateTrackingNumber();
        fetchPackages(); // Reload list
      } else {
        const error = await res.json();
        alert(error.error || 'Erreur lors de la création');
      }
    } catch (error) {
      alert('Erreur serveur');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPackage) return;
    
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/packages/${selectedPackage.trackingNumber}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          location: newLocation || undefined,
          notes: newNotes || undefined,
        }),
      });
      
      if (res.ok) {
        setSelectedPackage(null);
        setNewLocation('');
        setNewNotes('');
        fetchPackages(); // Reload list
      } else {
        const error = await res.json();
        alert(error.error || 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      alert('Erreur serveur');
    } finally {
      setIsUpdating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    const url = `${window.location.origin}/track/${text}`;
    navigator.clipboard.writeText(url);
    alert('Lien de suivi copié !');
  };

  const filteredPackages = useMemo(() => {
    return packages.filter(pkg => 
      pkg.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.clientEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (pkg.clientName && pkg.clientName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (pkg.destination && pkg.destination.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [packages, searchTerm]);

  const kpis = useMemo(() => {
    const total = packages.length;
    const prep = packages.filter(p => p.events[0]?.status === 'PREPARATION').length;
    const shipped = packages.filter(p => p.events[0]?.status === 'SHIPPED').length;
    const transit = packages.filter(p => p.events[0]?.status === 'IN_TRANSIT').length;
    const delivered = packages.filter(p => p.events[0]?.status === 'DELIVERED').length;
    const delayed = packages.filter(p => p.events[0]?.status === 'DELAYED').length;
    const totalWeight = packages.reduce((acc, p) => acc + (p.weight || 0), 0);
    
    return { total, prep, shipped, transit, delivered, delayed, totalWeight };
  }, [packages]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar Admin */}
      <nav className="border-b border-slate-200 bg-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6 text-primary" />
            <span className="font-bold text-lg text-slate-900">Trackflow Admin</span>
          </div>
          <Link href="/" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
            Retour au site
          </Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <p className="text-sm text-slate-500 font-medium">Total Colis</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{kpis.total}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <p className="text-sm text-slate-500 font-medium">Total Kilos</p>
            <p className="text-2xl font-bold text-indigo-600 mt-1">
              {kpis.totalWeight.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} kg
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <p className="text-sm text-slate-500 font-medium">En préparation</p>
            <p className="text-2xl font-bold text-slate-700 mt-1">{kpis.prep}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <p className="text-sm text-slate-500 font-medium">Expédiés</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{kpis.shipped}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <p className="text-sm text-slate-500 font-medium">En transit</p>
            <p className="text-2xl font-bold text-amber-500 mt-1">{kpis.transit}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <p className="text-sm text-slate-500 font-medium">Livrés</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{kpis.delivered}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <p className="text-sm text-slate-500 font-medium">Retardés</p>
            <p className="text-2xl font-bold text-red-600 mt-1">{kpis.delayed}</p>
          </div>
        </div>

        {/* Creation Form */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200 bg-slate-50/50">
            <h2 className="text-lg font-bold text-slate-900">Créer un nouvel envoi</h2>
          </div>
          <form className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" onSubmit={handleCreatePackage}>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">N° de Suivi *</label>
              <input required type="text" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Email Client *</label>
              <input required type="email" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="client@mail.com" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Nom Client</label>
              <input type="text" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="Jean Dupont" value={clientName} onChange={(e) => setClientName(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Téléphone</label>
              <input type="tel" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="+33 6..." value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Destination</label>
              <input type="text" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="Paris, France" value={destination} onChange={(e) => setDestination(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Transporteur</label>
              <input type="text" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="Colissimo" value={carrier} onChange={(e) => setCarrier(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Poids du colis (kg)</label>
              <input type="number" step="0.01" min="0" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="Ex: 2.5" value={weight} onChange={(e) => setWeight(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Statut initial</label>
              <select className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-white" value={initialStatus} onChange={(e) => setInitialStatus(e.target.value)}>
                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end lg:col-span-2">
              <button type="submit" className="btn btn-primary w-full h-[38px]" disabled={isSubmitting}>
                {isSubmitting ? 'Création...' : 'Créer le colis'}
              </button>
            </div>
          </form>
        </div>

        {/* Packages Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
            <h2 className="text-lg font-bold text-slate-900">Liste des envois</h2>
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Rechercher..." 
                className="w-full rounded-md border border-slate-300 pl-9 pr-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-8 text-center text-slate-500">Chargement des données...</div>
            ) : (
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                  <tr>
                    <th className="px-6 py-3 font-medium">N° Suivi</th>
                    <th className="px-6 py-3 font-medium">Client</th>
                    <th className="px-6 py-3 font-medium">Destination</th>
                    <th className="px-6 py-3 font-medium">Transporteur</th>
                    <th className="px-6 py-3 font-medium">Poids</th>
                    <th className="px-6 py-3 font-medium">Statut</th>
                    <th className="px-6 py-3 font-medium">Date</th>
                    <th className="px-6 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredPackages.map((pkg) => {
                    const currentStatus = pkg.events[0]?.status || 'N/A';
                    const statusCfg = STATUS_CONFIG[currentStatus] || { label: currentStatus, color: 'bg-slate-100 text-slate-700', icon: Package };
                    const StatusIcon = statusCfg.icon;

                    return (
                      <tr key={pkg.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-mono font-medium text-slate-900">{pkg.trackingNumber}</td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-slate-900">{pkg.clientName || 'N/A'}</div>
                          <div className="text-slate-500 text-xs">{pkg.clientEmail}</div>
                          {pkg.clientPhone && <div className="text-slate-500 text-xs mt-0.5">{pkg.clientPhone}</div>}
                        </td>
                        <td className="px-6 py-4 text-slate-600">{pkg.destination || '-'}</td>
                        <td className="px-6 py-4 text-slate-600">{pkg.carrier || '-'}</td>
                        <td className="px-6 py-4 text-slate-600">{pkg.weight ? `${pkg.weight} kg` : '-'}</td>
                        <td className="px-6 py-4">
                          <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border", statusCfg.color)}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusCfg.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-500">
                          {new Date(pkg.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button 
                            title="Modifier le statut"
                            className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary-bg rounded-md transition-colors"
                            onClick={() => { setSelectedPackage(pkg); setNewStatus(currentStatus); }}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            title="Copier le lien client"
                            className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                            onClick={() => copyToClipboard(pkg.trackingNumber)}
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <Link 
                            href={`/track/${pkg.trackingNumber}`} 
                            target="_blank"
                            title="Voir la page client"
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors inline-block"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredPackages.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-6 py-8 text-center text-slate-500">
                        Aucun colis trouvé pour votre recherche.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>

      {/* Modal */}
      {selectedPackage && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md animate-slide-up">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Mettre à jour le statut</h3>
              <p className="text-sm text-slate-500 mt-1 font-mono">{selectedPackage.trackingNumber}</p>
            </div>
            <form onSubmit={handleUpdateStatus} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Nouveau Statut</label>
                <select 
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-white"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                    <option key={key} value={key}>{config.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Lieu (Optionnel)</label>
                <input 
                  type="text" 
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" 
                  placeholder="Ex: Centre de tri Paris"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Note (Optionnel)</label>
                <textarea 
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none" 
                  rows={3}
                  placeholder="Message pour le client..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                />
              </div>
              <div className="pt-4 flex gap-3 justify-end">
                <button type="button" className="btn btn-outline" onClick={() => setSelectedPackage(null)}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary" disabled={isUpdating}>
                  {isUpdating ? 'Sauvegarde...' : 'Appliquer & Notifier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
