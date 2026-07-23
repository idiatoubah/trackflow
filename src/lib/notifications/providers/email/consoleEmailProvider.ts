import nodemailer from 'nodemailer';
import { INotificationProvider, NotificationResult, SendNotificationOptions } from '../../types';

let etherealTransporter: nodemailer.Transporter | null = null;

async function getEtherealTransporter() {
  if (etherealTransporter) return etherealTransporter;

  try {
    const testAccount = await nodemailer.createTestAccount();
    etherealTransporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
      tls: {
        rejectUnauthorized: false, // Bypass local corporate/Windows proxy certificate chain issues
      },
    });
    console.log(`[Ethereal Email Setup] Compte de test généré : ${testAccount.user}`);
    return etherealTransporter;
  } catch (error) {
    console.error('[Ethereal Setup Error] Fallback vers simulation console:', error);
    return null;
  }
}

export class ConsoleEmailProvider implements INotificationProvider {
  name = 'ETHEREAL_EMAIL';
  channel: 'EMAIL' = 'EMAIL';

  async send(options: SendNotificationOptions): Promise<NotificationResult> {
    const startTime = Date.now();

    try {
      const transporter = await getEtherealTransporter();

      if (transporter) {
        const info = await transporter.sendMail({
          from: `"Trackflow" <no-reply@trackflow.com>`,
          to: options.recipient,
          subject: options.subject || `Notification Trackflow - Colis ${options.trackingNumber}`,
          text: options.bodyText,
          html: options.bodyHtml || `<p>${options.bodyText}</p>`,
        });

        const previewUrl = nodemailer.getTestMessageUrl(info);
        const duration = Date.now() - startTime;

        console.log('\n================ [EMAIL TEST ENVOYÉ RÉELLEMENT] ================');
        console.log(`Destinataire: ${options.recipient}`);
        console.log(`Sujet: ${options.subject}`);
        if (previewUrl) {
          console.log(`🔗 LIEN POUR VOIR L'EMAIL EN DIRECT DANS VOTRE NAVIGATEUR :`);
          console.log(`👉 ${previewUrl}`);
        }
        console.log('=================================================================\n');

        return {
          success: true,
          provider: this.name,
          providerMessageId: (previewUrl as string) || info.messageId,
          statusCode: 200,
          responseTimeMs: duration,
          status: 'DELIVERED',
        };
      }
    } catch (err: any) {
      console.error('Erreur d’envoi Ethereal:', err);
    }

    // Fallback console simulation
    const duration = Date.now() - startTime;
    return {
      success: true,
      provider: 'CONSOLE_EMAIL',
      providerMessageId: `sim_email_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      statusCode: 200,
      responseTimeMs: duration,
      status: 'SUCCESS',
    };
  }
}
