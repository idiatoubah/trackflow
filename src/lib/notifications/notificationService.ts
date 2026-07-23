import { prisma } from '@/lib/prisma';
import { notificationQueue } from './queue';
import { PackageNotificationPayload } from './types';

export class NotificationService {
  /**
   * Dispatches automatic email and SMS notifications on package creation.
   * Runs non-blocking in the background.
   */
  public static async dispatchOnCreate(pkg: {
    id: string;
    trackingNumber: string;
    clientEmail: string;
    clientName?: string | null;
    clientPhone?: string | null;
    destination?: string | null;
    carrier?: string | null;
    weight?: number | null;
    notifyEmail?: boolean;
    notifySms?: boolean;
    notifyWhatsapp?: boolean;
    initialStatus?: string;
  }): Promise<void> {
    const payload: PackageNotificationPayload = {
      packageId: pkg.id,
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

    // Queue Email notification
    notificationQueue.enqueue({ payload, channel: 'EMAIL' });

    // Queue SMS notification
    notificationQueue.enqueue({ payload, channel: 'SMS' });
  }

  /**
   * Dispatches automatic email and SMS notifications when a package status changes.
   * Enforces deduplication: never notifies if status didn't actually change.
   */
  public static async dispatchOnStatusChange(
    pkg: {
      id: string;
      trackingNumber: string;
      clientEmail: string;
      clientName?: string | null;
      clientPhone?: string | null;
      destination?: string | null;
      carrier?: string | null;
      weight?: number | null;
      notifyEmail?: boolean;
      notifySms?: boolean;
      notifyWhatsapp?: boolean;
    },
    previousStatus: string | null,
    newStatus: string,
    notes?: string | null,
    location?: string | null
  ): Promise<void> {
    // 1. Deduplication check: Do not send if status hasn't changed
    if (previousStatus && previousStatus === newStatus) {
      console.log(`[NotificationService] Ignoré: Le statut ${newStatus} de ${pkg.trackingNumber} n'a pas changé.`);
      return;
    }

    const payload: PackageNotificationPayload = {
      packageId: pkg.id,
      trackingNumber: pkg.trackingNumber,
      clientName: pkg.clientName,
      clientEmail: pkg.clientEmail,
      clientPhone: pkg.clientPhone,
      previousStatus,
      newStatus,
      destination: pkg.destination,
      carrier: pkg.carrier,
      weight: pkg.weight,
      notes,
      location,
      preferences: {
        notifyEmail: pkg.notifyEmail ?? true,
        notifySms: pkg.notifySms ?? true,
        notifyWhatsapp: pkg.notifyWhatsapp ?? false,
      },
    };

    // Dispatch parallel background jobs
    notificationQueue.enqueue({ payload, channel: 'EMAIL' });
    notificationQueue.enqueue({ payload, channel: 'SMS' });
  }

  /**
   * Retries a specific failed notification by Log ID.
   */
  public static async retry(logId: string): Promise<boolean> {
    const log = await prisma.notificationLog.findUnique({
      where: { id: logId },
      include: { package: true },
    });

    if (!log) {
      throw new Error(`Log de notification introuvable (${logId})`);
    }

    const pkg = log.package;
    if (!pkg) {
      throw new Error(`Colis associé introuvable (${log.trackingNumber})`);
    }

    const payload: PackageNotificationPayload = {
      packageId: pkg.id,
      trackingNumber: pkg.trackingNumber,
      clientName: pkg.clientName,
      clientEmail: pkg.clientEmail,
      clientPhone: pkg.clientPhone,
      previousStatus: log.previousStatus,
      newStatus: log.newStatus,
      destination: pkg.destination,
      carrier: pkg.carrier,
      weight: pkg.weight,
      preferences: {
        notifyEmail: pkg.notifyEmail ?? true,
        notifySms: pkg.notifySms ?? true,
        notifyWhatsapp: pkg.notifyWhatsapp ?? false,
      },
    };

    // Re-execute immediately via queue worker
    const result = await notificationQueue.processJob({
      logId: log.id,
      payload,
      channel: log.type as any,
    });

    return result.success;
  }
}
