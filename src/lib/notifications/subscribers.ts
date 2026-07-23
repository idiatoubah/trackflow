import { eventBus } from '@/lib/events/eventBus';
import { DomainEvent, PackageCreatedEventPayload, PackageStatusChangedEventPayload } from '@/lib/events/types';
import { notificationQueue } from './queue';

/**
 * Registers domain event subscribers for automatic notifications.
 */
export function registerNotificationSubscribers(): void {
  // 1. Subscribe to PACKAGE_CREATED
  eventBus.subscribe<PackageCreatedEventPayload>('PACKAGE_CREATED', async (event: DomainEvent<PackageCreatedEventPayload>) => {
    const pkg = event.payload;
    const payload = {
      packageId: pkg.packageId,
      trackingNumber: pkg.trackingNumber,
      clientName: pkg.clientName,
      clientEmail: pkg.clientEmail,
      clientPhone: pkg.clientPhone,
      previousStatus: null,
      newStatus: pkg.initialStatus || 'PREPARATION',
      destination: pkg.destination,
      carrier: pkg.carrier,
      weight: pkg.weight,
      preferences: {
        notifyEmail: pkg.notifyEmail ?? true,
        notifySms: pkg.notifySms ?? true,
        notifyWhatsapp: pkg.notifyWhatsapp ?? false,
      },
    };

    // Queue parallel background jobs
    notificationQueue.enqueue({ payload, channel: 'EMAIL' });
    notificationQueue.enqueue({ payload, channel: 'SMS' });
    notificationQueue.enqueue({ payload, channel: 'WHATSAPP' });
  });

  // 2. Subscribe to PACKAGE_STATUS_CHANGED
  eventBus.subscribe<PackageStatusChangedEventPayload>('PACKAGE_STATUS_CHANGED', async (event: DomainEvent<PackageStatusChangedEventPayload>) => {
    const pkg = event.payload;

    // Deduplication check: ignore if status didn't actually change
    if (pkg.previousStatus && pkg.previousStatus === pkg.newStatus) {
      console.log(`[NotificationSubscriber] Ignoré: Statut ${pkg.newStatus} inchangé pour ${pkg.trackingNumber}`);
      return;
    }

    const payload = {
      packageId: pkg.packageId,
      trackingNumber: pkg.trackingNumber,
      clientName: pkg.clientName,
      clientEmail: pkg.clientEmail,
      clientPhone: pkg.clientPhone,
      previousStatus: pkg.previousStatus,
      newStatus: pkg.newStatus,
      destination: pkg.destination,
      carrier: pkg.carrier,
      weight: pkg.weight,
      notes: pkg.notes,
      location: pkg.location,
      preferences: {
        notifyEmail: pkg.notifyEmail ?? true,
        notifySms: pkg.notifySms ?? true,
        notifyWhatsapp: pkg.notifyWhatsapp ?? false,
      },
    };

    // Queue parallel background jobs
    notificationQueue.enqueue({ payload, channel: 'EMAIL' });
    notificationQueue.enqueue({ payload, channel: 'SMS' });
    notificationQueue.enqueue({ payload, channel: 'WHATSAPP' });
  });
}

// Auto-register subscribers on import
registerNotificationSubscribers();
