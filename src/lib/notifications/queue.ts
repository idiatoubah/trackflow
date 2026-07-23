import { prisma } from '@/lib/prisma';
import { INotificationProvider, NotificationJobData, NotificationResult, PackageNotificationPayload, SendNotificationOptions } from './types';
import { validateAndFormatEmail, validateAndFormatPhone } from './validator';
import { TemplateEngine } from './templates/engine';

import { ResendEmailProvider } from './providers/email/resendProvider';
import { ConsoleEmailProvider } from './providers/email/consoleEmailProvider';
import { TwilioSmsProvider } from './providers/sms/twilioProvider';
import { ConsoleSmsProvider } from './providers/sms/consoleSmsProvider';
import { WhatsAppProvider } from './providers/whatsapp/whatsAppProvider';

class NotificationQueue {
  private emailProvider: INotificationProvider;
  private smsProvider: INotificationProvider;
  private whatsappProvider: INotificationProvider;

  constructor() {
    const resendKey = process.env.RESEND_API_KEY || '';
    const twilioSid = process.env.TWILIO_ACCOUNT_SID || '';

    const hasValidResendKey = resendKey.startsWith('re_') && !resendKey.includes('123456789');
    const hasValidTwilioKey = twilioSid.startsWith('AC') && !twilioSid.includes('VOTRE_ACCOUNT_SID');

    const isSimulationMode = process.env.NOTIFICATION_SIMULATION_MODE === 'true';

    this.emailProvider =
      hasValidResendKey && !isSimulationMode
        ? new ResendEmailProvider()
        : new ConsoleEmailProvider();

    this.smsProvider =
      hasValidTwilioKey && !isSimulationMode
        ? new TwilioSmsProvider()
        : new ConsoleSmsProvider();

    this.whatsappProvider = new WhatsAppProvider();
  }

  /**
   * Enqueues a notification job for non-blocking asynchronous execution.
   */
  public enqueue(job: NotificationJobData): void {
    Promise.resolve().then(() => {
      this.processJob(job).catch((err) => {
        console.error(`[NotificationQueue Error] Tâche d'envoi échouée (${job.channel}):`, err);
      });
    });
  }

  /**
   * Main Worker logic for processing a single notification job with Strict Idempotency.
   */
  public async processJob(job: NotificationJobData): Promise<NotificationResult> {
    const { payload, channel, logId } = job;

    // Generate strict Idempotency Key
    const idempotencyKey = `${payload.packageId}_${payload.newStatus}_${channel}`;

    // 1. Strict Idempotency Check (skip duplicate sends if already successful)
    if (!logId) {
      const existing = await prisma.notificationLog.findUnique({
        where: { idempotencyKey },
      });

      if (existing && (existing.status === 'SUCCESS' || existing.status === 'DELIVERED' || existing.status === 'PENDING')) {
        console.log(`[NotificationQueue Idempotence] Ignoré: Notification ${idempotencyKey} déjà envoyée ou en cours.`);
        return {
          success: existing.success,
          provider: existing.provider,
          providerMessageId: existing.providerMessageId || undefined,
          statusCode: existing.statusCode || 200,
          responseTimeMs: existing.responseTimeMs || 0,
          status: existing.status as any,
        };
      }
    }

    // 2. Check Client Preferences
    const prefs = payload.preferences || {};
    if (channel === 'EMAIL' && prefs.notifyEmail === false) {
      return this.recordSkipped(payload, 'EMAIL', payload.clientEmail, 'Email désactivé dans les préférences client', idempotencyKey);
    }
    if (channel === 'SMS' && prefs.notifySms === false) {
      return this.recordSkipped(payload, 'SMS', payload.clientPhone || '', 'SMS désactivé dans les préférences client', idempotencyKey);
    }
    if (channel === 'WHATSAPP' && prefs.notifyWhatsapp === false) {
      return this.recordSkipped(payload, 'WHATSAPP', payload.clientPhone || '', 'WhatsApp désactivé dans les préférences client', idempotencyKey);
    }

    // 3. Render Versioned Template from DB / Code Engine
    const rendered = await TemplateEngine.render(channel, payload);

    // 4. Validate & Dispatch according to Channel
    if (channel === 'EMAIL') {
      const emailVal = validateAndFormatEmail(payload.clientEmail);
      if (!emailVal.isValid) {
        return this.recordFailed(payload, 'EMAIL', payload.clientEmail || 'N/A', this.emailProvider.name, emailVal.error || 'Email invalide', idempotencyKey);
      }

      const options: SendNotificationOptions = {
        type: 'EMAIL',
        recipient: emailVal.formatted!,
        subject: rendered.subject,
        bodyHtml: rendered.bodyHtml,
        bodyText: rendered.bodyText,
        trackingNumber: payload.trackingNumber,
        packageId: payload.packageId,
        previousStatus: payload.previousStatus,
        newStatus: payload.newStatus,
      };

      const result = await this.emailProvider.send(options);
      await this.saveLog(payload, 'EMAIL', emailVal.formatted!, result, idempotencyKey, logId);
      return result;
    }

    if (channel === 'SMS') {
      const phoneVal = validateAndFormatPhone(payload.clientPhone);
      if (!phoneVal.isValid) {
        return this.recordFailed(payload, 'SMS', payload.clientPhone || 'N/A', this.smsProvider.name, phoneVal.error || 'Numéro invalide', idempotencyKey);
      }

      const options: SendNotificationOptions = {
        type: 'SMS',
        recipient: phoneVal.formatted!,
        bodyText: rendered.bodyText,
        trackingNumber: payload.trackingNumber,
        packageId: payload.packageId,
        previousStatus: payload.previousStatus,
        newStatus: payload.newStatus,
      };

      const result = await this.smsProvider.send(options);
      await this.saveLog(payload, 'SMS', phoneVal.formatted!, result, idempotencyKey, logId);
      return result;
    }

    if (channel === 'WHATSAPP') {
      const phoneVal = validateAndFormatPhone(payload.clientPhone);
      if (!phoneVal.isValid) {
        return this.recordFailed(payload, 'WHATSAPP', payload.clientPhone || 'N/A', this.whatsappProvider.name, phoneVal.error || 'Numéro invalide pour WhatsApp', idempotencyKey);
      }

      const options: SendNotificationOptions = {
        type: 'WHATSAPP',
        recipient: phoneVal.formatted!,
        bodyText: rendered.bodyText,
        trackingNumber: payload.trackingNumber,
        packageId: payload.packageId,
        previousStatus: payload.previousStatus,
        newStatus: payload.newStatus,
      };

      const result = await this.whatsappProvider.send(options);
      await this.saveLog(payload, 'WHATSAPP', phoneVal.formatted!, result, idempotencyKey, logId);
      return result;
    }

    throw new Error(`Canal de notification inconnu : ${channel}`);
  }

  private async recordSkipped(
    payload: PackageNotificationPayload,
    type: 'EMAIL' | 'SMS' | 'WHATSAPP',
    recipient: string,
    reason: string,
    idempotencyKey: string
  ): Promise<NotificationResult> {
    const res: NotificationResult = {
      success: false,
      provider: 'SYSTEM',
      errorMessage: reason,
      responseTimeMs: 0,
      status: 'SKIPPED',
    };
    await this.saveLog(payload, type, recipient, res, idempotencyKey);
    return res;
  }

  private async recordFailed(
    payload: PackageNotificationPayload,
    type: 'EMAIL' | 'SMS' | 'WHATSAPP',
    recipient: string,
    provider: string,
    errorMsg: string,
    idempotencyKey: string
  ): Promise<NotificationResult> {
    const res: NotificationResult = {
      success: false,
      provider,
      errorMessage: errorMsg,
      responseTimeMs: 0,
      status: 'FAILED',
    };
    await this.saveLog(payload, type, recipient, res, idempotencyKey);
    return res;
  }

  private async saveLog(
    payload: PackageNotificationPayload,
    type: 'EMAIL' | 'SMS' | 'WHATSAPP',
    recipient: string,
    res: NotificationResult,
    idempotencyKey: string,
    existingLogId?: string
  ): Promise<void> {
    try {
      if (existingLogId) {
        await prisma.notificationLog.update({
          where: { id: existingLogId },
          data: {
            provider: res.provider,
            providerMessageId: res.providerMessageId,
            success: res.success,
            status: res.status,
            responseTimeMs: res.responseTimeMs,
            statusCode: res.statusCode,
            errorMessage: res.errorMessage,
            attempts: { increment: 1 },
          },
        });
      } else {
        await prisma.notificationLog.create({
          data: {
            idempotencyKey,
            trackingNumber: payload.trackingNumber,
            packageId: payload.packageId,
            type,
            recipient,
            provider: res.provider,
            providerMessageId: res.providerMessageId,
            previousStatus: payload.previousStatus,
            newStatus: payload.newStatus,
            success: res.success,
            status: res.status,
            responseTimeMs: res.responseTimeMs,
            statusCode: res.statusCode,
            errorMessage: res.errorMessage,
            attempts: 1,
          },
        });
      }
    } catch (err: any) {
      if (err.code === 'P2002') {
        console.log(`[NotificationQueue] Log déjà créé pour la clé d'idempotence ${idempotencyKey}`);
      } else {
        console.error('[NotificationQueue] Erreur d’enregistrement DB:', err);
      }
    }
  }
}

export const notificationQueue = new NotificationQueue();
