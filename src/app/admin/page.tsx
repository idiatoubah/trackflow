"use client";

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Package,
  Search,
  Copy,
  ExternalLink,
  Edit2,
  LayoutDashboard,
  CheckCircle2,
  Clock,
  Truck,
  PackageOpen,
  AlertTriangle,
  Bell,
  RotateCw,
  Mail,
  MessageSquare,
  Smartphone,
  Check,
  XCircle,
  AlertCircle,
  Filter,
  Send,
  HelpCircle,
  MapPin,
  Building2,
  Info,
  FileText,
  Plus,
  Save,
  Layers,
  Zap,
  Trash2,
  Users,
  Settings,
  LogOut,
  UserPlus,
  Shield,
  KeyRound,
  ArrowLeft
} from 'lucide-react';
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
  departureDate?: string | null;
  notifyEmail?: boolean;
  notifySms?: boolean;
  notifyWhatsapp?: boolean;
  createdAt: string;
  events: {
    status: string;
    timestamp: string;
  }[];
};

type NotificationLog = {
  id: string;
  idempotencyKey: string | null;
  trackingNumber: string;
  type: 'EMAIL' | 'SMS' | 'WHATSAPP';
  recipient: string;
  provider: string;
  providerMessageId: string | null;
  previousStatus: string | null;
  newStatus: string;
  success: boolean;
  status: 'PENDING' | 'SUCCESS' | 'DELIVERED' | 'FAILED' | 'BOUNCED' | 'UNDELIVERED' | 'SKIPPED';
  responseTimeMs: number | null;
  statusCode: number | null;
  errorMessage: string | null;
  attempts: number;
  createdAt: string;
  package?: {
    clientName: string | null;
    clientEmail: string;
    clientPhone: string | null;
  };
};

type NotificationTemplate = {
  id: string;
  channel: 'EMAIL' | 'SMS' | 'WHATSAPP';
  statusKey: string;
  subject: string | null;
  bodyHtml: string | null;
  bodyText: string;
  version: number;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
};

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  PREPARATION: { label: 'En préparation', color: 'bg-slate-100 text-slate-700 border-slate-200', icon: PackageOpen },
  SHIPPED: { label: 'Expédié', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Package },
  IN_TRANSIT: { label: 'En transit', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Truck },
  ARRIVED: { label: 'Arrivé à destination', color: 'bg-sky-100 text-sky-700 border-sky-200', icon: MapPin },
  AVAILABLE: { label: 'Disponible (Retrait)', color: 'bg-purple-100 text-purple-700 border-purple-200', icon: Building2 },
  DELIVERED: { label: 'Livré', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
  DELAYED: { label: 'Retardé', color: 'bg-orange-100 text-orange-700 border-orange-200', icon: Clock },
  INCIDENT: { label: 'Incident signalé', color: 'bg-red-100 text-red-700 border-red-200', icon: AlertTriangle },
};

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'packages' | 'notifications' | 'templates' | 'employees' | 'store'>('packages');

  // Multi-Tenant Auth & Store State
  const [currentStore, setCurrentStore] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  // Employee Form State
  const [empName, setEmpName] = useState('');
  const [empEmail, setEmpEmail] = useState('');
  const [empPassword, setEmpPassword] = useState('');
  const [empRole, setEmpRole] = useState<'ADMIN' | 'AGENT'>('AGENT');
  const [isSubmittingEmp, setIsSubmittingEmp] = useState(false);

  // Store Edit Form State
  const [storeEditName, setStoreEditName] = useState('');
  const [storeEditLogo, setStoreEditLogo] = useState('');
  const [storeEditAddress, setStoreEditAddress] = useState('');
  const [storeEditPhone, setStoreEditPhone] = useState('');
  const [storeEditCountry, setStoreEditCountry] = useState('Guinée');
  const [storeEditManager, setStoreEditManager] = useState('');
  const [isSavingStore, setIsSavingStore] = useState(false);

  // Packages State
  const [packages, setPackages] = useState<Package[]>([]);
  const [loadingPackages, setLoadingPackages] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Create Package Form State
  const [trackingNumber, setTrackingNumber] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [destination, setDestination] = useState('');
  const [carrier, setCarrier] = useState('');
  const [weight, setWeight] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [initialStatus, setInitialStatus] = useState('PREPARATION');
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifySms, setNotifySms] = useState(false);
  const [notifyWhatsapp, setNotifyWhatsapp] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update Status Modal State
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [newStatus, setNewStatus] = useState('PREPARATION');
  const [newLocation, setNewLocation] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Convoy Batch Update State
  const [convoyInfo, setConvoyInfo] = useState<{
    hasConvoy: boolean;
    count: number;
    destination: string;
    departureDate: string;
    departureDateRaw: string;
    matchingPackages: Array<{ id: string; trackingNumber: string; clientName: string | null }>;
  } | null>(null);
  const [showConvoyModal, setShowConvoyModal] = useState(false);

  // Notification Logs State
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [notifSearchTerm, setNotifSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [retryingLogId, setRetryingLogId] = useState<string | null>(null);
  const [notifStats, setNotifStats] = useState({ totalSent: 0, totalSuccess: 0, totalFailed: 0, successRate: 100 });

  // Templates State
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);
  const [editChannel, setEditChannel] = useState<'EMAIL' | 'SMS' | 'WHATSAPP'>('EMAIL');
  const [editStatusKey, setEditStatusKey] = useState('PREPARATION');
  const [editSubject, setEditSubject] = useState('');
  const [editBodyText, setEditBodyText] = useState('');
  const [editBodyHtml, setEditBodyHtml] = useState('');
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);

  useEffect(() => {
    fetchAuthAndStore();
    fetchPackages();
    generateTrackingNumber();
  }, []);

  useEffect(() => {
    if (activeTab === 'notifications') fetchNotificationLogs();
    if (activeTab === 'templates') fetchTemplates();
    if (activeTab === 'employees') fetchEmployees();
  }, [activeTab, typeFilter, statusFilter, notifSearchTerm]);

  const generateTrackingNumber = () => {
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    setTrackingNumber(`TRK-${random}`);
  };

  const fetchPackages = async () => {
    setLoadingPackages(true);
    try {
      const res = await fetch('/api/packages');
      if (res.ok) {
        const data = await res.json();
        setPackages(data);
      } else {
        console.error('Erreur API colis:', res.statusText);
      }
    } catch (error) {
      console.error('Erreur récupération colis:', error);
    } finally {
      setLoadingPackages(false);
    }
  };

  const fetchNotificationLogs = async () => {
    setLoadingLogs(true);
    try {
      const params = new URLSearchParams();
      if (typeFilter !== 'ALL') params.append('type', typeFilter);
      if (statusFilter !== 'ALL') params.append('status', statusFilter);
      if (notifSearchTerm) params.append('search', notifSearchTerm);

      const res = await fetch(`/api/admin/notifications?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
        if (data.stats) setNotifStats(data.stats);
      }
    } catch (error) {
      console.error('Erreur récupération logs notifications:', error);
    } finally {
      setLoadingLogs(false);
    }
  };

  const fetchTemplates = async () => {
    setLoadingTemplates(true);
    try {
      const res = await fetch('/api/admin/templates');
      if (res.ok) {
        const data = await res.json();
        setTemplates(data);
      }
    } catch (error) {
      console.error('Erreur récupération templates:', error);
    } finally {
      setLoadingTemplates(false);
    }
  };

  const fetchAuthAndStore = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user || null);
        if (data.store) {
          setCurrentStore(data.store);
          setStoreEditName(data.store.name || '');
          setStoreEditLogo(data.store.logoUrl || '');
          setStoreEditAddress(data.store.address || '');
          setStoreEditPhone(data.store.phone || '');
          setStoreEditCountry(data.store.country || 'Guinée');
          setStoreEditManager(data.store.managerName || '');
        } else if (data.defaultStore) {
          setCurrentStore(data.defaultStore);
        }
      }
    } catch (error) {
      console.error('Erreur récupération session/store:', error);
    }
  };

  const fetchEmployees = async () => {
    setLoadingEmployees(true);
    try {
      const res = await fetch('/api/admin/employees');
      if (res.ok) {
        const data = await res.json();
        setEmployees(data);
      }
    } catch (error) {
      console.error('Erreur récupération employés:', error);
    } finally {
      setLoadingEmployees(false);
    }
  };

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingEmp(true);
    try {
      const res = await fetch('/api/admin/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: empName,
          email: empEmail,
          password: empPassword,
          role: empRole,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert('✅ Nouvel employé créé avec succès !');
        setEmpName('');
        setEmpEmail('');
        setEmpPassword('');
        setEmpRole('AGENT');
        fetchEmployees();
      } else {
        alert(data.error || 'Erreur lors de la création de l\'employé');
      }
    } catch (error) {
      alert('Erreur serveur lors de la création');
    } finally {
      setIsSubmittingEmp(false);
    }
  };

  const handleUpdateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingStore(true);
    try {
      const res = await fetch('/api/admin/store', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: storeEditName,
          logoUrl: storeEditLogo,
          address: storeEditAddress,
          phone: storeEditPhone,
          country: storeEditCountry,
          managerName: storeEditManager,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert('✅ Informations de la boutique mises à jour !');
        setCurrentStore(data);
      } else {
        alert(data.error || 'Erreur lors de la mise à jour de la boutique');
      }
    } catch (error) {
      alert('Erreur serveur lors de la sauvegarde');
    } finally {
      setIsSavingStore(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
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
        departureDate: departureDate || undefined,
        initialStatus,
        notifyEmail,
        notifySms,
        notifyWhatsapp,
      };

      const res = await fetch('/api/packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setClientEmail('');
        setClientName('');
        setClientPhone('');
        setDestination('');
        setCarrier('');
        setWeight('');
        setDepartureDate('');
        setInitialStatus('PREPARATION');
        generateTrackingNumber();
        fetchPackages();
        if (activeTab === 'notifications') fetchNotificationLogs();
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
      // 1. Check if other packages in the same convoy exist
      const checkRes = await fetch('/api/packages/convoy-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trackingNumber: selectedPackage.trackingNumber,
          targetStatus: newStatus,
        }),
      });

      if (checkRes.ok) {
        const convoyData = await checkRes.json();
        if (convoyData.hasConvoy && convoyData.count > 0) {
          setConvoyInfo(convoyData);
          setShowConvoyModal(true);
          setIsUpdating(false);
          return;
        }
      }

      // No convoy detected -> apply status change only to single package
      await executeUpdateStatus(false);
    } catch (error) {
      console.error('Erreur vérification convoi:', error);
      await executeUpdateStatus(false);
    }
  };

  const executeUpdateStatus = async (applyToConvoy: boolean) => {
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
          applyToConvoy,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setShowConvoyModal(false);
        setConvoyInfo(null);
        setSelectedPackage(null);
        setNewLocation('');
        setNewNotes('');
        fetchPackages();
        if (activeTab === 'notifications') fetchNotificationLogs();

        if (applyToConvoy) {
          alert(`✅ ${data.updatedCount || 1} colis du convoi ont été mis à jour avec succès et les notifications ont été envoyées aux clients !`);
        }
      } else {
        alert(data.error || 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      alert('Erreur serveur lors de la mise à jour');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeletePackage = async (trackingNumber: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer définitivement le colis ${trackingNumber} ?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/packages/${trackingNumber}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchPackages();
        if (activeTab === 'notifications') fetchNotificationLogs();
      } else {
        const error = await res.json();
        alert(error.error || 'Erreur lors de la suppression');
      }
    } catch (error) {
      alert('Erreur serveur lors de la suppression');
    }
  };

  const handleRetryNotification = async (logId: string) => {
    setRetryingLogId(logId);
    try {
      const res = await fetch(`/api/admin/notifications/${logId}/retry`, {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok) {
        alert('Notification renvoyée avec succès !');
        fetchNotificationLogs();
      } else {
        alert(data.error || 'Erreur lors du renvoi de la notification');
        fetchNotificationLogs();
      }
    } catch (error) {
      alert('Erreur serveur lors du renvoi');
    } finally {
      setRetryingLogId(null);
    }
  };

  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingTemplate(true);
    try {
      const res = await fetch('/api/admin/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: editChannel,
          statusKey: editStatusKey,
          subject: editChannel === 'EMAIL' ? editSubject : undefined,
          bodyText: editBodyText,
          bodyHtml: editChannel === 'EMAIL' ? editBodyHtml : undefined,
          isActive: true,
        }),
      });

      if (res.ok) {
        alert('Nouveau template enregistré et activé avec succès !');
        setIsEditingTemplate(false);
        fetchTemplates();
      } else {
        const err = await res.json();
        alert(err.error || 'Erreur enregistrement template');
      }
    } catch (error) {
      alert('Erreur serveur');
    } finally {
      setIsSavingTemplate(false);
    }
  };

  const copyToClipboard = (text: string) => {
    const url = `${window.location.origin}/track/${text}`;
    navigator.clipboard.writeText(url);
    alert('Lien de suivi copié !');
  };

  const filteredPackages = useMemo(() => {
    return packages.filter(
      (pkg) =>
        pkg.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.clientEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (pkg.clientName && pkg.clientName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (pkg.destination && pkg.destination.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [packages, searchTerm]);

  const kpis = useMemo(() => {
    const total = packages.length;
    const prep = packages.filter((p) => p.events[0]?.status === 'PREPARATION').length;
    const shipped = packages.filter((p) => p.events[0]?.status === 'SHIPPED').length;
    const transit = packages.filter((p) => p.events[0]?.status === 'IN_TRANSIT').length;
    const delivered = packages.filter((p) => p.events[0]?.status === 'DELIVERED').length;
    const delayed = packages.filter((p) => p.events[0]?.status === 'DELAYED' || p.events[0]?.status === 'INCIDENT').length;
    const totalWeight = packages.reduce((acc, p) => acc + (p.weight || 0), 0);

    return { total, prep, shipped, transit, delivered, delayed, totalWeight };
  }, [packages]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Top Navbar */}
      <nav className="border-b border-slate-200 bg-white sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {currentStore?.logoUrl ? (
              <img src={currentStore.logoUrl} alt={currentStore.name} className="w-9 h-9 rounded-lg object-contain bg-slate-100 p-0.5 border" />
            ) : (
              <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-2 rounded-xl text-white shadow-md">
                <Building2 className="w-5 h-5" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-slate-900 leading-tight">
                  {currentStore?.name || 'Trackflow Boutique'}
                </span>
                <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {currentUser?.role || 'OWNER'}
                </span>
              </div>
              {currentStore?.managerName && (
                <p className="text-xs text-slate-500">Gérant : {currentStore.managerName}</p>
              )}
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl gap-1 overflow-x-auto">
            <button
              onClick={() => setActiveTab('packages')}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap',
                activeTab === 'packages' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              )}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Colis</span>
              <span className="ml-0.5 text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded-full">{packages.length}</span>
            </button>

            <button
              onClick={() => setActiveTab('notifications')}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap',
                activeTab === 'notifications' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              )}
            >
              <Bell className="w-3.5 h-3.5 text-amber-500" />
              <span>Notifications</span>
            </button>

            <button
              onClick={() => setActiveTab('templates')}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap',
                activeTab === 'templates' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              )}
            >
              <FileText className="w-3.5 h-3.5 text-blue-500" />
              <span>Templates</span>
            </button>

            <button
              onClick={() => setActiveTab('employees')}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap',
                activeTab === 'employees' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              )}
            >
              <Users className="w-3.5 h-3.5 text-emerald-500" />
              <span>Employés</span>
            </button>

            <button
              onClick={() => setActiveTab('store')}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap',
                activeTab === 'store' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              )}
            >
              <Settings className="w-3.5 h-3.5 text-purple-500" />
              <span>Paramètres</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border"
              title="Retourner à l'accueil du site"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Retour</span>
            </Link>

            <button
              onClick={() => {
                alert("📱 Pour installer Trackflow sur votre téléphone :\n\n• Android / Chrome : Cliquez sur le bouton 'Installer' en bas de l'écran\n• iPhone / Safari : Appuyez sur le bouton Partager ⎘ ➔ Sur l'écran d'accueil ➕");
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-lg transition-all shadow-sm active:scale-95"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">PWA</span>
            </button>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border"
              title="Se déconnecter"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Quitter</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {activeTab === 'packages' && (
          <>
            {/* KPIs Colis */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Total Colis</p>
                <p className="text-2xl font-extrabold text-slate-900 mt-1">{kpis.total}</p>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Total Kilos</p>
                <p className="text-2xl font-extrabold text-indigo-600 mt-1">
                  {kpis.totalWeight.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 1 })} kg
                </p>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">En préparation</p>
                <p className="text-2xl font-extrabold text-slate-700 mt-1">{kpis.prep}</p>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Expédiés</p>
                <p className="text-2xl font-extrabold text-blue-600 mt-1">{kpis.shipped}</p>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">En transit</p>
                <p className="text-2xl font-extrabold text-amber-500 mt-1">{kpis.transit}</p>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Livrés</p>
                <p className="text-2xl font-extrabold text-emerald-600 mt-1">{kpis.delivered}</p>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Alertes/Retards</p>
                <p className="text-2xl font-extrabold text-red-600 mt-1">{kpis.delayed}</p>
              </div>
            </div>

            {/* Formulaire de création */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-5 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary" />
                  <span>Créer un nouvel envoi</span>
                </h2>
                <span className="text-xs text-slate-500 font-medium">Déclenche automatiquement l'EventBus</span>
              </div>
              <form className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" onSubmit={handleCreatePackage}>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">N° de Suivi *</label>
                  <input
                    required
                    type="text"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none font-mono"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Email Client *</label>
                  <input
                    required
                    type="email"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    placeholder="client@domaine.com"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Nom Client</label>
                  <input
                    type="text"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    placeholder="ex: Mamadou Bah"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                    <span>Téléphone (E.164)</span>
                    <span className="text-[10px] text-slate-400 font-normal">ex: +224 620...</span>
                  </label>
                  <input
                    type="tel"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none font-mono"
                    placeholder="+224620000000 ou +336..."
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Destination</label>
                  <input
                    type="text"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    placeholder="ex: Conakry / Paris"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                    <span>Date de départ (Convoi)</span>
                    <span className="text-[10px] text-blue-600 font-normal">Groupe convoi</span>
                  </label>
                  <input
                    type="date"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    value={departureDate}
                    onChange={(e) => setDepartureDate(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Transporteur</label>
                  <input
                    type="text"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    placeholder="ex: DHL / Air Cargo"
                    value={carrier}
                    onChange={(e) => setCarrier(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Poids (kg)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    placeholder="ex: 3.5"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Statut Initial</label>
                  <select
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-white font-medium"
                    value={initialStatus}
                    onChange={(e) => setInitialStatus(e.target.value)}
                  >
                    {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                      <option key={key} value={key}>
                        {config.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Notification Preferences */}
                <div className="lg:col-span-3 bg-slate-50 p-3 rounded-lg border border-slate-200 flex flex-wrap items-center gap-6">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Canaux à notifier :</span>
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={notifyEmail}
                      onChange={(e) => setNotifyEmail(e.target.checked)}
                      className="rounded border-slate-300 text-primary focus:ring-primary w-4 h-4"
                    />
                    <Mail className="w-4 h-4 text-blue-600" />
                    <span>Email</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={notifySms}
                      onChange={(e) => setNotifySms(e.target.checked)}
                      className="rounded border-slate-300 text-primary focus:ring-primary w-4 h-4"
                    />
                    <Smartphone className="w-4 h-4 text-emerald-600" />
                    <span>SMS</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={notifyWhatsapp}
                      onChange={(e) => setNotifyWhatsapp(e.target.checked)}
                      className="rounded border-slate-300 text-primary focus:ring-primary w-4 h-4"
                    />
                    <MessageSquare className="w-4 h-4 text-green-600" />
                    <span>WhatsApp</span>
                  </label>
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold h-[42px] rounded-lg transition-colors flex items-center justify-center gap-2 text-sm shadow-sm"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      'Création en cours...'
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Créer l'envoi</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Table des Colis */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-base font-bold text-slate-900">Liste des envois ({filteredPackages.length})</h2>
                  <button
                    onClick={() => fetchPackages()}
                    className="p-1.5 text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                    title="Actualiser les colis"
                  >
                    <RotateCw className={cn('w-4 h-4', loadingPackages && 'animate-spin')} />
                  </button>
                </div>
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Rechercher par N° suivi, client..."
                    className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                {loadingPackages ? (
                  <div className="p-8 text-center text-slate-500">Chargement des données...</div>
                ) : (
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[11px] tracking-wider font-semibold">
                      <tr>
                        <th className="px-6 py-3 font-semibold">N° Suivi</th>
                        <th className="px-6 py-3 font-semibold">Client</th>
                        <th className="px-6 py-3 font-semibold">Destination</th>
                        <th className="px-6 py-3 font-semibold">Date Départ</th>
                        <th className="px-6 py-3 font-semibold">Transporteur</th>
                        <th className="px-6 py-3 font-semibold">Poids</th>
                        <th className="px-6 py-3 font-semibold">Statut</th>
                        <th className="px-6 py-3 font-semibold">Création</th>
                        <th className="px-6 py-3 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {filteredPackages.map((pkg) => {
                        const currentStatus = pkg.events[0]?.status || 'N/A';
                        const statusCfg = STATUS_CONFIG[currentStatus] || {
                          label: currentStatus,
                          color: 'bg-slate-100 text-slate-700',
                          icon: Package,
                        };
                        const StatusIcon = statusCfg.icon;

                        return (
                          <tr key={pkg.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4 font-mono font-bold text-slate-900">{pkg.trackingNumber}</td>
                            <td className="px-6 py-4">
                              <div className="font-medium text-slate-900">{pkg.clientName || 'Sans nom'}</div>
                              <div className="text-slate-500 text-xs font-mono">{pkg.clientEmail}</div>
                              {pkg.clientPhone && (
                                <div className="text-slate-500 text-xs font-mono mt-0.5">{pkg.clientPhone}</div>
                              )}
                            </td>
                            <td className="px-6 py-4 text-slate-600">{pkg.destination || '-'}</td>
                            <td className="px-6 py-4 text-slate-600 font-mono text-xs">
                              {pkg.departureDate ? (
                                <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium border border-slate-200">
                                  <Clock className="w-3 h-3 text-blue-600" />
                                  {new Date(pkg.departureDate).toLocaleDateString('fr-FR')}
                                </span>
                              ) : (
                                '-'
                              )}
                            </td>
                            <td className="px-6 py-4 text-slate-600">{pkg.carrier || '-'}</td>
                            <td className="px-6 py-4 text-slate-600">{pkg.weight ? `${pkg.weight} kg` : '-'}</td>
                            <td className="px-6 py-4">
                              <span
                                className={cn(
                                  'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border gap-1',
                                  statusCfg.color
                                )}
                              >
                                <StatusIcon className="w-3.5 h-3.5" />
                                {statusCfg.label}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-slate-500 text-xs">
                              {new Date(pkg.createdAt).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </td>
                            <td className="px-6 py-4 text-right space-x-2">
                              <button
                                title="Mettre à jour le statut"
                                className="p-1.5 text-slate-500 hover:text-primary hover:bg-slate-100 rounded-lg transition-colors"
                                onClick={() => {
                                  setSelectedPackage(pkg);
                                  setNewStatus(currentStatus);
                                }}
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                title="Copier le lien de suivi client"
                                className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                onClick={() => copyToClipboard(pkg.trackingNumber)}
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                              <Link
                                href={`/track/${pkg.trackingNumber}`}
                                target="_blank"
                                title="Page de suivi"
                                className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors inline-block"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </Link>
                              <button
                                title="Supprimer le colis"
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors inline-block"
                                onClick={() => handleDeletePackage(pkg.trackingNumber)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                      {filteredPackages.length === 0 && (
                        <tr>
                          <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                            Aucun colis ne correspond à votre recherche.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </>
        )}

        {/* Onglet Notifications */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            {/* KPIs Notifications */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Envois</span>
                  <Bell className="w-5 h-5 text-slate-400" />
                </div>
                <p className="text-3xl font-extrabold text-slate-900 mt-2">{notifStats.totalSent}</p>
              </div>

              <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Taux de Succès</span>
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                </div>
                <p className="text-3xl font-extrabold text-emerald-600 mt-2">{notifStats.successRate}%</p>
                <p className="text-xs text-slate-500 mt-1">{notifStats.totalSuccess} notifications délivrées</p>
              </div>

              <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-red-600 uppercase tracking-wider">Échecs / Erreurs</span>
                  <AlertCircle className="w-5 h-5 text-red-500" />
                </div>
                <p className="text-3xl font-extrabold text-red-600 mt-2">{notifStats.totalFailed}</p>
                <p className="text-xs text-slate-500 mt-1">Nécessite attention ou renvoi</p>
              </div>

              <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Architecture</span>
                  <span className="text-xs bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Zap className="w-3 h-3" /> EventBus
                  </span>
                </div>
                <div className="text-xs text-slate-600 space-y-1 mt-2">
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-blue-600" />
                    <span>Email (Resend REST API)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>SMS (Twilio E.164)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Table des Logs */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-5 border-b border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/50">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Journal des Notifications</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Historique temps réel filtrable avec idempotence stricte</p>
                </div>

                {/* Controls & Filters */}
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                  <div className="relative flex-1 md:w-60">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="N° suivi, destinataire..."
                      className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-1.5 text-xs focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-white"
                      value={notifSearchTerm}
                      onChange={(e) => setNotifSearchTerm(e.target.value)}
                    />
                  </div>

                  <select
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-white font-medium"
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                  >
                    <option value="ALL">Tous les canaux</option>
                    <option value="EMAIL">Email uniquement</option>
                    <option value="SMS">SMS uniquement</option>
                    <option value="WHATSAPP">WhatsApp uniquement</option>
                  </select>

                  <select
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-white font-medium"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="ALL">Tous les statuts</option>
                    <option value="SUCCESS">Succès / Délivrés</option>
                    <option value="FAILED">Échecs / Erreurs</option>
                    <option value="SKIPPED">Ignorés / Désactivés</option>
                  </select>

                  <button
                    onClick={() => fetchNotificationLogs()}
                    className="p-2 text-slate-600 hover:text-slate-900 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                    title="Actualiser"
                  >
                    <RotateCw className={cn('w-4 h-4', loadingLogs && 'animate-spin')} />
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                {loadingLogs ? (
                  <div className="p-8 text-center text-slate-500">Chargement des notifications...</div>
                ) : (
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[11px] tracking-wider font-semibold">
                      <tr>
                        <th className="px-6 py-3 font-semibold">Canal</th>
                        <th className="px-6 py-3 font-semibold">Statut</th>
                        <th className="px-6 py-3 font-semibold">Destinataire</th>
                        <th className="px-6 py-3 font-semibold">N° Suivi</th>
                        <th className="px-6 py-3 font-semibold">Statut Colis</th>
                        <th className="px-6 py-3 font-semibold">Fournisseur</th>
                        <th className="px-6 py-3 font-semibold">Latence</th>
                        <th className="px-6 py-3 font-semibold text-center">Essais</th>
                        <th className="px-6 py-3 font-semibold">Date</th>
                        <th className="px-6 py-3 font-semibold text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {logs.map((log) => {
                        const isSuccess = log.status === 'SUCCESS' || log.status === 'DELIVERED';
                        const isFailed = log.status === 'FAILED' || log.status === 'BOUNCED' || log.status === 'UNDELIVERED';

                        return (
                          <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4">
                              {log.type === 'EMAIL' && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                                  <Mail className="w-3 h-3" /> Email
                                </span>
                              )}
                              {log.type === 'SMS' && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  <Smartphone className="w-3 h-3" /> SMS
                                </span>
                              )}
                              {log.type === 'WHATSAPP' && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
                                  <MessageSquare className="w-3 h-3" /> WhatsApp
                                </span>
                              )}
                            </td>

                            <td className="px-6 py-4">
                              {isSuccess && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                                  <CheckCircle2 className="w-3 h-3" />
                                  {log.status === 'DELIVERED' ? 'Délivré' : 'Envoyé'}
                                </span>
                              )}
                              {isFailed && (
                                <div className="group relative inline-block">
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 cursor-help">
                                    <XCircle className="w-3 h-3" />
                                    {log.status}
                                  </span>
                                  {log.errorMessage && (
                                    <div className="hidden group-hover:block absolute left-0 top-full mt-1 w-64 p-2 bg-slate-900 text-white text-xs rounded-lg shadow-xl z-30">
                                      {log.errorMessage}
                                    </div>
                                  )}
                                </div>
                              )}
                              {log.status === 'SKIPPED' && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                                  <Info className="w-3 h-3" /> Ignoré
                                </span>
                              )}
                              {log.status === 'PENDING' && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 animate-pulse">
                                  <Clock className="w-3 h-3" /> En cours
                                </span>
                              )}
                            </td>

                            <td className="px-6 py-4">
                              <div className="font-mono text-xs text-slate-900">{log.recipient}</div>
                              {log.package?.clientName && (
                                <div className="text-slate-500 text-[11px]">{log.package.clientName}</div>
                              )}
                            </td>

                            <td className="px-6 py-4 font-mono font-bold text-slate-900">{log.trackingNumber}</td>

                            <td className="px-6 py-4 text-xs font-medium text-slate-700">
                              {STATUS_CONFIG[log.newStatus]?.label || log.newStatus}
                            </td>

                            <td className="px-6 py-4 text-xs text-slate-600 font-mono">
                              <div className="font-bold text-slate-800">{log.provider}</div>
                              {log.providerMessageId && log.providerMessageId.startsWith('http') ? (
                                <a
                                  href={log.providerMessageId}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={cn(
                                    'inline-flex items-center gap-1 text-[11px] font-bold hover:underline mt-1 px-2 py-0.5 rounded border transition-colors',
                                    log.type === 'WHATSAPP' || log.providerMessageId.includes('wa.me')
                                      ? 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
                                      : 'text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100'
                                  )}
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  {log.type === 'WHATSAPP' || log.providerMessageId.includes('wa.me')
                                    ? 'Ouvrir WhatsApp 💬'
                                    : 'Voir l’email ↗'}
                                </a>
                              ) : log.providerMessageId ? (
                                <div className="text-[10px] text-slate-400 truncate max-w-[100px]" title={log.providerMessageId}>
                                  {log.providerMessageId}
                                </div>
                              ) : null}
                            </td>

                            <td className="px-6 py-4 text-xs text-slate-600 font-mono">
                              {log.responseTimeMs ? `${log.responseTimeMs} ms` : '-'}
                            </td>

                            <td className="px-6 py-4 text-xs font-semibold text-slate-700 text-center">
                              {log.attempts}
                            </td>

                            <td className="px-6 py-4 text-xs text-slate-500">
                              {new Date(log.createdAt).toLocaleString('fr-FR', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </td>

                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => handleRetryNotification(log.id)}
                                disabled={retryingLogId === log.id}
                                className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
                              >
                                <RotateCw className={cn('w-3.5 h-3.5', retryingLogId === log.id && 'animate-spin')} />
                                <span>{retryingLogId === log.id ? 'Envoi...' : 'Renvoyer'}</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}

                      {logs.length === 0 && (
                        <tr>
                          <td colSpan={10} className="px-6 py-12 text-center text-slate-500">
                            Aucune notification enregistrée dans les journaux.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Onglet Templates DB */}
        {activeTab === 'templates' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <span>Templates de Notification (Stockés en Base de Données)</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Modifiez le contenu des emails et SMS à chaud sans aucun redéploiement de code.
                </p>
              </div>
              <button
                onClick={() => {
                  setEditChannel('EMAIL');
                  setEditStatusKey('PREPARATION');
                  setEditSubject('');
                  setEditBodyText('');
                  setEditBodyHtml('');
                  setIsEditingTemplate(true);
                }}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Nouveau Template</span>
              </button>
            </div>

            {/* Guide des Variables Disponibles */}
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl text-xs text-blue-900 space-y-1">
              <p className="font-bold flex items-center gap-1 text-sm">
                <Info className="w-4 h-4 text-blue-600" /> Variables d'interpolation disponibles dans vos templates :
              </p>
              <div className="flex flex-wrap gap-2 pt-1 font-mono text-[11px]">
                <span className="bg-white px-2 py-0.5 rounded border border-blue-200 font-bold">{`{{trackingNumber}}`}</span>
                <span className="bg-white px-2 py-0.5 rounded border border-blue-200 font-bold">{`{{clientName}}`}</span>
                <span className="bg-white px-2 py-0.5 rounded border border-blue-200 font-bold">{`{{newStatusLabel}}`}</span>
                <span className="bg-white px-2 py-0.5 rounded border border-blue-200 font-bold">{`{{previousStatusLabel}}`}</span>
                <span className="bg-white px-2 py-0.5 rounded border border-blue-200 font-bold">{`{{trackingUrl}}`}</span>
                <span className="bg-white px-2 py-0.5 rounded border border-blue-200 font-bold">{`{{carrier}}`}</span>
                <span className="bg-white px-2 py-0.5 rounded border border-blue-200 font-bold">{`{{destination}}`}</span>
                <span className="bg-white px-2 py-0.5 rounded border border-blue-200 font-bold">{`{{weight}}`}</span>
                <span className="bg-white px-2 py-0.5 rounded border border-blue-200 font-bold">{`{{date}}`}</span>
                <span className="bg-white px-2 py-0.5 rounded border border-blue-200 font-bold">{`{{time}}`}</span>
              </div>
            </div>

            {/* Formulaire d'édition de Template */}
            {isEditingTemplate && (
              <div className="bg-white p-6 rounded-xl shadow-md border border-slate-300 space-y-4 animate-slide-up">
                <div className="flex justify-between items-center border-b pb-3">
                  <h3 className="text-base font-bold text-slate-900">Créer une nouvelle version de Template</h3>
                  <button
                    onClick={() => setIsEditingTemplate(false)}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-900"
                  >
                    Fermer
                  </button>
                </div>
                <form onSubmit={handleSaveTemplate} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Canal *</label>
                      <select
                        className="w-full mt-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-white"
                        value={editChannel}
                        onChange={(e) => setEditChannel(e.target.value as any)}
                      >
                        <option value="EMAIL">Email</option>
                        <option value="SMS">SMS</option>
                        <option value="WHATSAPP">WhatsApp</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Statut concerné *</label>
                      <select
                        className="w-full mt-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-white"
                        value={editStatusKey}
                        onChange={(e) => setEditStatusKey(e.target.value)}
                      >
                        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                          <option key={key} value={key}>
                            {cfg.label} ({key})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {editChannel === 'EMAIL' && (
                    <div>
                      <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Sujet de l'Email</label>
                      <input
                        type="text"
                        className="w-full mt-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                        placeholder="[Trackflow] Votre colis {{trackingNumber}} est {{newStatusLabel}}"
                        value={editSubject}
                        onChange={(e) => setEditSubject(e.target.value)}
                      />
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Corps du message Texte *</label>
                    <textarea
                      required
                      rows={3}
                      className="w-full mt-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none font-mono"
                      placeholder="Bonjour {{clientName}}, votre colis {{trackingNumber}} est {{newStatusLabel}}. Suivez-le sur {{trackingUrl}}"
                      value={editBodyText}
                      onChange={(e) => setEditBodyText(e.target.value)}
                    />
                  </div>

                  {editChannel === 'EMAIL' && (
                    <div>
                      <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Corps HTML (Optionnel)</label>
                      <textarea
                        rows={4}
                        className="w-full mt-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none font-mono"
                        placeholder="<p>Bonjour {{clientName}}, votre colis <strong>{{trackingNumber}}</strong>...</p>"
                        value={editBodyHtml}
                        onChange={(e) => setEditBodyHtml(e.target.value)}
                      />
                    </div>
                  )}

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingTemplate(false)}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingTemplate}
                      className="bg-primary hover:bg-primary/90 text-white px-5 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <Save className="w-4 h-4" />
                      <span>{isSavingTemplate ? 'Enregistrement...' : 'Activer cette version'}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Liste des Templates DB */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                {loadingTemplates ? (
                  <div className="p-8 text-center text-slate-500">Chargement des templates DB...</div>
                ) : (
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[11px] tracking-wider font-semibold">
                      <tr>
                        <th className="px-6 py-3 font-semibold">Canal</th>
                        <th className="px-6 py-3 font-semibold">Statut</th>
                        <th className="px-6 py-3 font-semibold">Version</th>
                        <th className="px-6 py-3 font-semibold">Sujet</th>
                        <th className="px-6 py-3 font-semibold">Message Texte</th>
                        <th className="px-6 py-3 font-semibold">Actif</th>
                        <th className="px-6 py-3 font-semibold">Création</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {templates.map((t) => (
                        <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border">
                              {t.channel}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-bold text-slate-900">
                            {STATUS_CONFIG[t.statusKey]?.label || t.statusKey}
                          </td>
                          <td className="px-6 py-4 font-mono text-xs font-bold text-indigo-600">v{t.version}</td>
                          <td className="px-6 py-4 text-xs text-slate-700 max-w-xs truncate">{t.subject || '-'}</td>
                          <td className="px-6 py-4 text-xs font-mono text-slate-600 max-w-sm truncate" title={t.bodyText}>
                            {t.bodyText}
                          </td>
                          <td className="px-6 py-4">
                            {t.isActive ? (
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                                <Check className="w-3 h-3" /> Actif
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                                Historique
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-xs text-slate-500">
                            {new Date(t.createdAt).toLocaleDateString('fr-FR')}
                          </td>
                        </tr>
                      ))}
                      {templates.length === 0 && (
                        <tr>
                          <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                            Aucun template en base de données. Cliquez sur "Nouveau Template" ou relancez le seed.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Gestion des Employés de la Boutique */}
        {activeTab === 'employees' && (
          <div className="space-y-6 animate-slide-up">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div>
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-600" />
                  <span>Employés & Accès de la Boutique</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Créez des accès pour vos collaborateurs et définissez leurs rôles (Admin ou Agent opé).
                </p>
              </div>

              <div className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl">
                <span>Total employés :</span>
                <span className="bg-white px-2 py-0.5 rounded-lg border text-emerald-600 font-extrabold">{employees.length}</span>
              </div>
            </div>

            {/* Formulaire d'ajout d'employé */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wider text-xs border-b pb-3">
                <UserPlus className="w-4 h-4 text-emerald-600" />
                <span>Ajouter un Nouvel Employé</span>
              </h3>

              <form onSubmit={handleCreateEmployee} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Nom Complet *</label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Amadou Diallo"
                    value={empName}
                    onChange={(e) => setEmpName(e.target.value)}
                    className="w-full mt-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">Email de Connexion *</label>
                  <input
                    type="email"
                    required
                    placeholder="employe@boutique.com"
                    value={empEmail}
                    onChange={(e) => setEmpEmail(e.target.value)}
                    className="w-full mt-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">Mot de passe *</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={empPassword}
                    onChange={(e) => setEmpPassword(e.target.value)}
                    className="w-full mt-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">Rôle & Permissions *</label>
                  <div className="flex gap-2 mt-1">
                    <select
                      value={empRole}
                      onChange={(e) => setEmpRole(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 outline-none font-bold"
                    >
                      <option value="AGENT">AGENT (Opérateur Colis)</option>
                      <option value="ADMIN">ADMIN (Gestionnaire)</option>
                    </select>
                    <button
                      type="submit"
                      disabled={isSubmittingEmp}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all shrink-0 active:scale-95 disabled:opacity-50"
                    >
                      {isSubmittingEmp ? '...' : 'Ajouter'}
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Tableau des employés */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
                <h3 className="text-sm font-bold text-slate-900">Liste des Employés</h3>
              </div>

              {loadingEmployees ? (
                <div className="p-8 text-center text-slate-500 text-xs font-medium">Chargement des employés...</div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/70 text-slate-500 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="px-6 py-3 font-semibold">Nom</th>
                      <th className="px-6 py-3 font-semibold">Email</th>
                      <th className="px-6 py-3 font-semibold">Rôle</th>
                      <th className="px-6 py-3 font-semibold">Statut</th>
                      <th className="px-6 py-3 font-semibold">Date de création</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {employees.map((emp) => (
                      <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-900">{emp.name || 'Sans nom'}</td>
                        <td className="px-6 py-4 text-slate-600 font-mono">{emp.email}</td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase',
                            emp.role === 'OWNER' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                            emp.role === 'ADMIN' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                            'bg-slate-100 text-slate-700 border-slate-200'
                          )}>
                            <Shield className="w-3 h-3" />
                            {emp.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                            <Check className="w-3 h-3" /> Actif
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-500">
                          {new Date(emp.createdAt).toLocaleDateString('fr-FR')}
                        </td>
                      </tr>
                    ))}
                    {employees.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                          Aucun employé enregistré pour le moment.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Tab 5: Paramètres de la Boutique */}
        {activeTab === 'store' && (
          <div className="space-y-6 animate-slide-up max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2 border-b pb-4">
                <Settings className="w-5 h-5 text-purple-600" />
                <span>Paramètres & Personnalisation de la Boutique</span>
              </h2>

              <form onSubmit={handleUpdateStore} className="space-y-6 pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700">Nom de la Boutique *</label>
                    <input
                      type="text"
                      required
                      value={storeEditName}
                      onChange={(e) => setStoreEditName(e.target.value)}
                      className="w-full mt-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:border-purple-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700">Nom du Responsable *</label>
                    <input
                      type="text"
                      required
                      value={storeEditManager}
                      onChange={(e) => setStoreEditManager(e.target.value)}
                      className="w-full mt-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:border-purple-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700">Pays *</label>
                    <input
                      type="text"
                      required
                      value={storeEditCountry}
                      onChange={(e) => setStoreEditCountry(e.target.value)}
                      className="w-full mt-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:border-purple-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700">Téléphone de contact</label>
                    <input
                      type="text"
                      value={storeEditPhone}
                      onChange={(e) => setStoreEditPhone(e.target.value)}
                      className="w-full mt-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:border-purple-500 outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700">Adresse / Siège social</label>
                    <input
                      type="text"
                      value={storeEditAddress}
                      onChange={(e) => setStoreEditAddress(e.target.value)}
                      className="w-full mt-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:border-purple-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700">URL du Logo Boutique</label>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={storeEditLogo}
                      onChange={(e) => setStoreEditLogo(e.target.value)}
                      className="w-full mt-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:border-purple-500 outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={isSavingStore}
                    className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSavingStore ? 'Enregistrement...' : 'Enregistrer les modifications'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* Modal Mise à jour du Statut */}
      {selectedPackage && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md animate-slide-up border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-base font-bold text-slate-900">Mettre à jour le statut</h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">{selectedPackage.trackingNumber}</p>
            </div>
            <form onSubmit={handleUpdateStatus} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Nouveau Statut *</label>
                <select
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-white font-medium"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                    <option key={key} value={key}>
                      {config.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Lieu actuel (Optionnel)</label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  placeholder="ex: Centre de tri Conakry / CDG"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Note (Optionnel)</label>
                <textarea
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none"
                  rows={3}
                  placeholder="Informations complémentaires destinées au client..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                />
              </div>
              <div className="pt-4 flex gap-3 justify-end border-t border-slate-100">
                <button
                  type="button"
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  onClick={() => setSelectedPackage(null)}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="bg-primary hover:bg-primary/90 text-white px-5 py-2 text-sm font-bold rounded-lg transition-colors shadow-sm flex items-center gap-2"
                  disabled={isUpdating}
                >
                  <Send className="w-4 h-4" />
                  <span>{isUpdating ? 'Sauvegarde...' : 'Appliquer & Notifier'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmation de Mise à Jour par Convoi */}
      {showConvoyModal && convoyInfo && selectedPackage && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-slide-up border border-slate-200 overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-sm">
                  <Truck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold">Mise à jour groupée par convoi</h3>
                  <p className="text-xs text-blue-100 mt-0.5">
                    Départ vers {convoyInfo.destination} le {convoyInfo.departureDate}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 space-y-2 text-sm">
                <p className="font-bold flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                  <span>Convoi détecté</span>
                </p>
                <p className="text-slate-800 leading-relaxed">
                  <strong>{convoyInfo.count} autres colis</strong> appartiennent au même départ vers <strong>{convoyInfo.destination}</strong> du <strong>{convoyInfo.departureDate}</strong>.
                </p>
                <p className="text-xs text-slate-600 font-medium pt-1">
                  Souhaitez-vous appliquer ce nouveau statut (<strong>{STATUS_CONFIG[newStatus]?.label || newStatus}</strong>) à tous ces colis ?
                </p>
              </div>

              <div className="space-y-2.5 pt-2">
                <button
                  onClick={() => executeUpdateStatus(true)}
                  disabled={isUpdating}
                  className="w-full py-3 px-4 bg-primary hover:bg-primary/90 text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Oui, mettre à jour tous les colis ({convoyInfo.count + 1})</span>
                </button>

                <button
                  onClick={() => executeUpdateStatus(false)}
                  disabled={isUpdating}
                  className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-sm rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <span>Non, uniquement ce colis</span>
                </button>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => {
                  setShowConvoyModal(false);
                  setConvoyInfo(null);
                }}
                disabled={isUpdating}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-3 py-1.5"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
