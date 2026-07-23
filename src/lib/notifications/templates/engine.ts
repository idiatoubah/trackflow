import { prisma } from '@/lib/prisma';
import { NotificationChannel, PackageNotificationPayload } from '../types';
import { renderPackageEmailHtml, renderPackageEmailSubject, STATUS_MAP } from './emailTemplates';
import { renderPackageSmsText } from './smsTemplates';

export interface RenderedTemplate {
  subject?: string;
  bodyHtml?: string;
  bodyText: string;
}

export class TemplateEngine {
  /**
   * Renders the template for a specific channel and package notification payload.
   * Checks database NotificationTemplate table first; falls back to code defaults if not found.
   */
  public static async render(
    channel: NotificationChannel,
    payload: PackageNotificationPayload
  ): Promise<RenderedTemplate> {
    const statusKey = payload.newStatus;

    // Resolve store name if missing
    if (!payload.storeName && payload.packageId) {
      try {
        const pkg = await prisma.package.findUnique({
          where: { id: payload.packageId },
          include: { store: true },
        });
        if (pkg?.store?.name) {
          payload.storeName = pkg.store.name;
        }
      } catch (e) {
        // Fallback
      }
    }

    try {
      // 1. Query database for active NotificationTemplate
      const dbTemplate = await prisma.notificationTemplate.findFirst({
        where: {
          channel,
          statusKey,
          isActive: true,
        },
        orderBy: { version: 'desc' },
      });

      if (dbTemplate) {
        let bodyText = this.interpolate(dbTemplate.bodyText, payload);
        let bodyHtml = dbTemplate.bodyHtml ? this.interpolate(dbTemplate.bodyHtml, payload) : undefined;

        // Append thank you message strictly for DELIVERED status if not present
        if (statusKey === 'DELIVERED') {
          const storeLabel = payload.storeName ? payload.storeName : 'notre boutique';
          const thankYouText = `Merci d’avoir choisi ${storeLabel} pour votre livraison. Nous espérons que vous êtes satisfait(e) de notre service et nous serons ravis de vous accompagner à nouveau très prochainement. À bientôt !`;
          
          if (!bodyText.includes('Merci d’avoir choisi')) {
            bodyText += `\n\n${thankYouText}`;
          }
        }

        return {
          subject: dbTemplate.subject ? this.interpolate(dbTemplate.subject, payload) : undefined,
          bodyHtml,
          bodyText,
        };
      }
    } catch (err) {
      console.warn(`[TemplateEngine] Impossible de charger le template DB pour ${channel}:${statusKey}, fallback vers template code.`, err);
    }

    // 2. Fallback to default code templates
    if (channel === 'EMAIL') {
      return {
        subject: renderPackageEmailSubject(payload),
        bodyHtml: renderPackageEmailHtml(payload),
        bodyText: renderPackageSmsText(payload),
      };
    }

    return {
      bodyText: renderPackageSmsText(payload),
    };
  }

  /**
   * Helper function to interpolate placeholders like {{trackingNumber}}, {{clientName}}, {{storeName}}, etc.
   */
  private static interpolate(template: string, payload: PackageNotificationPayload): string {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const trackingUrl = `${appUrl}/track/${payload.trackingNumber}`;
    const statusInfo = STATUS_MAP[payload.newStatus] || { label: payload.newStatus };
    const prevStatusInfo = payload.previousStatus ? STATUS_MAP[payload.previousStatus] || { label: payload.previousStatus } : null;

    const formattedDate = payload.timestamp
      ? new Date(payload.timestamp).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
      : new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

    const formattedTime = payload.timestamp
      ? new Date(payload.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      : new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

    const storeLabel = payload.storeName ? payload.storeName : 'notre boutique';

    const replacements: Record<string, string> = {
      '{{trackingNumber}}': payload.trackingNumber || '',
      '{{clientName}}': payload.clientName || 'Client',
      '{{clientEmail}}': payload.clientEmail || '',
      '{{clientPhone}}': payload.clientPhone || '',
      '{{storeName}}': storeLabel,
      '{{newStatusLabel}}': statusInfo.label,
      '{{previousStatusLabel}}': prevStatusInfo ? prevStatusInfo.label : '-',
      '{{trackingUrl}}': trackingUrl,
      '{{carrier}}': payload.carrier || 'N/A',
      '{{destination}}': payload.destination || 'N/A',
      '{{weight}}': payload.weight ? `${payload.weight} kg` : 'N/A',
      '{{notes}}': payload.notes || '',
      '{{date}}': formattedDate,
      '{{time}}': formattedTime,
    };

    let result = template;
    for (const [key, value] of Object.entries(replacements)) {
      result = result.replace(new RegExp(key, 'g'), value);
    }

    return result;
  }
}
