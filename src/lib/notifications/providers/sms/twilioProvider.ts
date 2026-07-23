import { INotificationProvider, NotificationResult, SendNotificationOptions } from '../../types';

export class TwilioSmsProvider implements INotificationProvider {
  name = 'TWILIO';
  channel: 'SMS' = 'SMS';
  private accountSid: string;
  private authToken: string;
  private fromNumber: string;

  constructor(accountSid?: string, authToken?: string, fromNumber?: string) {
    this.accountSid = accountSid || process.env.TWILIO_ACCOUNT_SID || '';
    this.authToken = authToken || process.env.TWILIO_AUTH_TOKEN || '';
    this.fromNumber = fromNumber || process.env.TWILIO_PHONE_NUMBER || '';
  }

  async send(options: SendNotificationOptions): Promise<NotificationResult> {
    const startTime = Date.now();

    if (!this.accountSid || !this.authToken || !this.fromNumber) {
      return {
        success: false,
        provider: this.name,
        statusCode: 401,
        errorMessage: 'Identifiants Twilio manquants (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN ou TWILIO_PHONE_NUMBER non configurés).',
        responseTimeMs: Date.now() - startTime,
        status: 'FAILED',
      };
    }

    try {
      const url = `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`;
      const credentials = Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64');

      const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';
      const statusCallbackUrl = appUrl ? `${appUrl}/api/webhooks/twilio` : undefined;

      const formData = new URLSearchParams();
      formData.append('To', options.recipient);
      formData.append('From', this.fromNumber);
      formData.append('Body', options.bodyText);
      if (statusCallbackUrl) {
        formData.append('StatusCallback', statusCallbackUrl);
      }

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

      if (!response.ok) {
        return {
          success: false,
          provider: this.name,
          statusCode: response.status,
          errorMessage: data?.message || `Erreur Twilio (${data?.code || 'inconnu'})`,
          responseTimeMs,
          status: 'FAILED',
        };
      }

      return {
        success: true,
        provider: this.name,
        providerMessageId: data.sid,
        statusCode: 200,
        responseTimeMs,
        status: 'SUCCESS',
      };
    } catch (error: any) {
      return {
        success: false,
        provider: this.name,
        statusCode: 500,
        errorMessage: error.message || 'Erreur réseau lors de l’appel API Twilio',
        responseTimeMs: Date.now() - startTime,
        status: 'FAILED',
      };
    }
  }
}
