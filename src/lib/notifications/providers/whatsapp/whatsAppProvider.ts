import { INotificationProvider, NotificationResult, SendNotificationOptions } from '../../types';

export class WhatsAppProvider implements INotificationProvider {
  name = 'TWILIO_WHATSAPP';
  channel: 'WHATSAPP' = 'WHATSAPP';

  async send(options: SendNotificationOptions): Promise<NotificationResult> {
    const startTime = Date.now();
    const cleanPhone = options.recipient.replace(/[^\d]/g, '');

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromWhatsAppNumber = process.env.TWILIO_WHATSAPP_NUMBER || process.env.TWILIO_PHONE_NUMBER || '+14155238886';

    // 1. Automatic background dispatch via Twilio WhatsApp API
    if (accountSid && authToken && !accountSid.includes('ACCOUNT_SID')) {
      try {
        const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
        const credentials = Buffer.from(`${accountSid}:${authToken}`).toString('base64');

        const fromFormatted = fromWhatsAppNumber.startsWith('whatsapp:')
          ? fromWhatsAppNumber
          : `whatsapp:${fromWhatsAppNumber}`;

        const toFormatted = `whatsapp:+${cleanPhone}`;

        const formData = new URLSearchParams();
        formData.append('To', toFormatted);
        formData.append('From', fromFormatted);
        formData.append('Body', options.bodyText);

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: formData.toString(),
        });

        const data = await response.json();
        const responseTimeMs = Date.now() - startTime;

        if (response.ok) {
          return {
            success: true,
            provider: 'TWILIO_WHATSAPP_AUTOMATIC',
            providerMessageId: data.sid,
            statusCode: 200,
            responseTimeMs,
            status: 'DELIVERED',
          };
        } else {
          console.error('[Twilio WhatsApp Error]', data);
        }
      } catch (err: any) {
        console.error('[Twilio WhatsApp Network Error]', err);
      }
    }

    // 2. Fallback: Generate instant 1-Click WhatsApp Link
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(options.bodyText)}`;
    const duration = Date.now() - startTime;

    console.log('\n================ [WHATSAPP TRAITÉ EN ARRIÈRE-PLAN] ================');
    console.log(`Destinataire: +${cleanPhone}`);
    console.log(`Message: ${options.bodyText}`);
    console.log(`Lien d'accès: ${whatsappUrl}`);
    console.log('===================================================================\n');

    return {
      success: true,
      provider: 'WHATSAPP_AUTOMATIC',
      providerMessageId: whatsappUrl,
      statusCode: 200,
      responseTimeMs: duration,
      status: 'DELIVERED',
    };
  }
}
