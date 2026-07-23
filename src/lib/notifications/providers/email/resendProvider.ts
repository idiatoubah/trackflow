import { INotificationProvider, NotificationResult, SendNotificationOptions } from '../../types';

export class ResendEmailProvider implements INotificationProvider {
  name = 'RESEND';
  channel: 'EMAIL' = 'EMAIL';
  private apiKey: string;
  private fromEmail: string;

  constructor(apiKey?: string, fromEmail?: string) {
    this.apiKey = apiKey || process.env.RESEND_API_KEY || '';
    this.fromEmail = fromEmail || process.env.NOTIFICATION_EMAIL_FROM || 'Trackflow <notifications@resend.dev>';
  }

  async send(options: SendNotificationOptions): Promise<NotificationResult> {
    const startTime = Date.now();

    if (!this.apiKey) {
      return {
        success: false,
        provider: this.name,
        statusCode: 401,
        errorMessage: 'Clé API Resend manquante (RESEND_API_KEY non configurée).',
        responseTimeMs: Date.now() - startTime,
        status: 'FAILED',
      };
    }

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: this.fromEmail,
          to: [options.recipient],
          subject: options.subject || `Notification Trackflow - Colis ${options.trackingNumber}`,
          html: options.bodyHtml || `<p>${options.bodyText}</p>`,
          tags: [
            { name: 'tracking_number', value: options.trackingNumber },
            { name: 'status', value: options.newStatus },
          ],
        }),
      });

      const data = await response.json();
      const responseTimeMs = Date.now() - startTime;

      if (!response.ok) {
        return {
          success: false,
          provider: this.name,
          statusCode: response.status,
          errorMessage: data?.message || data?.error || 'Erreur lors de l’envoi Resend',
          responseTimeMs,
          status: 'FAILED',
        };
      }

      return {
        success: true,
        provider: this.name,
        providerMessageId: data.id,
        statusCode: 200,
        responseTimeMs,
        status: 'SUCCESS',
      };
    } catch (error: any) {
      return {
        success: false,
        provider: this.name,
        statusCode: 500,
        errorMessage: error.message || 'Erreur réseau lors de l’appel API Resend',
        responseTimeMs: Date.now() - startTime,
        status: 'FAILED',
      };
    }
  }
}
