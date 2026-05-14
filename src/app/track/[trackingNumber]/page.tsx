import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Package, Truck, CheckCircle2, AlertTriangle, PackageOpen, MapPin, Calendar, User, Navigation, ArrowLeft, Scale, Phone } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const STATUS_CONFIG: Record<string, { label: string, color: string, bgColor: string, icon: any }> = {
  'PREPARATION': { label: 'En préparation', color: 'text-slate-700', bgColor: 'bg-slate-100', icon: PackageOpen },
  'SHIPPED': { label: 'Expédié', color: 'text-blue-700', bgColor: 'bg-blue-100', icon: Package },
  'IN_TRANSIT': { label: 'En cours de livraison', color: 'text-amber-700', bgColor: 'bg-amber-100', icon: Truck },
  'DELIVERED': { label: 'Livré', color: 'text-emerald-700', bgColor: 'bg-emerald-100', icon: CheckCircle2 },
  'DELAYED': { label: 'Retardé', color: 'text-red-700', bgColor: 'bg-red-100', icon: AlertTriangle },
};

// Next.js Server Component
export default async function TrackPage({
  params,
}: {
  params: Promise<{ trackingNumber: string }>;
}) {
  const p = await params;
  const packageData = await prisma.package.findUnique({
    where: { trackingNumber: p.trackingNumber.toUpperCase() },
    include: {
      events: {
        orderBy: { timestamp: 'desc' },
      },
    },
  });

  if (!packageData || packageData.events.length === 0) {
    notFound();
  }

  const currentEvent = packageData.events[0];
  const currentStatusConfig = STATUS_CONFIG[currentEvent.status] || STATUS_CONFIG['PREPARATION'];
  const StatusIcon = currentStatusConfig.icon;

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Client Header */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-1.5 rounded-lg">
              <Package className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-slate-900">Trackflow</span>
          </div>
          <Link href="/" className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" /> Retour
          </Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Title Section */}
        <div className="mb-8 animate-slide-up">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Suivi de colis</h1>
          <div className="flex items-center mt-2 text-slate-500">
            <span className="font-mono bg-slate-200 px-2 py-1 rounded text-sm text-slate-700 mr-3">
              {packageData.trackingNumber}
            </span>
            <span className="text-sm flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              {new Date(packageData.createdAt).toLocaleDateString('fr-FR')}
            </span>
          </div>
        </div>

        {/* Current Status Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">Statut Actuel</p>
              <div className="flex items-center">
                <div className={cn("p-2 rounded-full mr-3", currentStatusConfig.bgColor, currentStatusConfig.color)}>
                  <StatusIcon className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    {currentStatusConfig.label}
                  </h2>
                  {currentEvent.location && (
                    <p className="text-slate-500 flex items-center mt-1">
                      <MapPin className="w-4 h-4 mr-1" /> {currentEvent.location}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Details Row */}
          {(packageData.carrier || packageData.destination || packageData.clientName || packageData.weight || packageData.clientPhone) && (
            <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 gap-4">
              {packageData.carrier && (
                <div>
                  <p className="text-xs text-slate-400 font-medium uppercase">Transporteur</p>
                  <p className="font-medium text-slate-700 flex items-center mt-1">
                    <Truck className="w-4 h-4 mr-2 text-slate-400" />
                    {packageData.carrier}
                  </p>
                </div>
              )}
              {packageData.destination && (
                <div>
                  <p className="text-xs text-slate-400 font-medium uppercase">Destination</p>
                  <p className="font-medium text-slate-700 flex items-center mt-1">
                    <Navigation className="w-4 h-4 mr-2 text-slate-400" />
                    {packageData.destination}
                  </p>
                </div>
              )}
              {packageData.weight !== null && (
                <div>
                  <p className="text-xs text-slate-400 font-medium uppercase">Poids</p>
                  <p className="font-medium text-slate-700 flex items-center mt-1">
                    <Scale className="w-4 h-4 mr-2 text-slate-400" />
                    {packageData.weight} kg
                  </p>
                </div>
              )}
              {packageData.clientName && (
                <div className="col-span-2 sm:col-span-1">
                  <p className="text-xs text-slate-400 font-medium uppercase">Destinataire</p>
                  <p className="font-medium text-slate-700 flex items-center mt-1">
                    <User className="w-4 h-4 mr-2 text-slate-400" />
                    {packageData.clientName}
                  </p>
                </div>
              )}
              {packageData.clientPhone && (
                <div className="col-span-2 sm:col-span-1">
                  <p className="text-xs text-slate-400 font-medium uppercase">Téléphone</p>
                  <p className="font-medium text-slate-700 flex items-center mt-1">
                    <Phone className="w-4 h-4 mr-2 text-slate-400" />
                    {packageData.clientPhone}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <h3 className="text-lg font-bold text-slate-900 mb-6">Historique du colis</h3>
          
          <div className="relative border-l-2 border-slate-100 ml-4 space-y-8">
            {packageData.events.map((event, index) => {
              const isFirst = index === 0;
              const cfg = STATUS_CONFIG[event.status] || STATUS_CONFIG['PREPARATION'];
              const Icon = cfg.icon;

              return (
                <div key={event.id} className="relative pl-8">
                  {/* Timeline Dot */}
                  <div className={cn(
                    "absolute -left-[17px] p-1.5 rounded-full ring-4 ring-white",
                    isFirst ? cfg.bgColor : 'bg-slate-100',
                    isFirst ? cfg.color : 'text-slate-400'
                  )}>
                    <Icon className="w-5 h-5" />
                  </div>
                  
                  {/* Content */}
                  <div className={cn("flex flex-col", !isFirst && "opacity-70")}>
                    <h4 className={cn("text-base font-bold", isFirst ? "text-slate-900" : "text-slate-700")}>
                      {cfg.label}
                    </h4>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center text-sm text-slate-500 mt-1 gap-1 sm:gap-3">
                      <span className="flex items-center">
                        <Calendar className="w-3.5 h-3.5 mr-1" />
                        {new Date(event.timestamp).toLocaleString('fr-FR', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      {event.location && (
                        <span className="flex items-center">
                          <span className="hidden sm:inline text-slate-300 mr-3">•</span>
                          <MapPin className="w-3.5 h-3.5 mr-1" />
                          {event.location}
                        </span>
                      )}
                    </div>

                    {event.notes && (
                      <p className="mt-3 text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                        {event.notes}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </main>
    </div>
  );
}
