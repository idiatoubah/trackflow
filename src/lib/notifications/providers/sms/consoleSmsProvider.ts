import { INotificationProvider, NotificationResult, SendNotificationOptions } from '../../types';

export class ConsoleSmsProvider implements INotificationProvider {
  name = 'CONSOLE_SMS';
  channel: 'SMS' = 'SMS';

  async send(options: SendNotificationOptions): Promise<NotificationResult> {
    const startTime = Date.now();

    console.log('\n================ [SIMULATION SMS] ================');
    console.log(`To: ${options.recipient}`);
    console.log(`Message: ${options.bodyText}`);
    console.log(`Tracking Number: ${options.trackingNumber}`);
    console.log(`Status: ${options.newStatus}`);
    console.log('==================================================\n');

    const duration = Date.now() - startTime;

    return {
      success: true,
      provider: this.name,
      providerMessageId: `sim_sms_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      statusCode: 200,
      responseTimeMs: duration,
      status: 'SUCCESS',
    };
  }
}
