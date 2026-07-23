import { INotificationProvider, NotificationChannel, NotificationResult, SendNotificationOptions } from '../../types';

export class TelegramProvider implements INotificationProvider {
  name = 'TELEGRAM_BOT';
  channel: NotificationChannel = 'TELEGRAM';
  private botToken: string;
  private chatId: string;

  constructor(botToken?: string, chatId?: string) {
    this.botToken = botToken || process.env.TELEGRAM_BOT_TOKEN || '';
    this.chatId = chatId || process.env.TELEGRAM_CHAT_ID || '';
  }

  async send(options: SendNotificationOptions): Promise<NotificationResult> {
    const startTime = Date.now();

    if (!this.botToken || !this.chatId) {
      console.log('\n================ [TELEGRAM BOT SIMULATION] ================');
      console.log(`To Chat ID: ${this.chatId || 'Demo Chat'}`);
      console.log(`Message: ${options.bodyText}`);
      console.log('===========================================================\n');

      return {
        success: true,
        provider: this.name,
        providerMessageId: `sim_tg_${Date.now()}`,
        statusCode: 200,
        responseTimeMs: Date.now() - startTime,
        status: 'DELIVERED',
      };
    }

    try {
      const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: this.chatId,
          text: `📦 *NOTIFICATION TRACKFLOW*\n\n${options.bodyText}`,
          parse_mode: 'Markdown',
        }),
      });

      const data = await response.json();
      const duration = Date.now() - startTime;

      if (!response.ok || !data.ok) {
        return {
          success: false,
          provider: this.name,
          statusCode: response.status || 400,
          errorMessage: data.description || 'Erreur d’envoi Telegram',
          responseTimeMs: duration,
          status: 'FAILED',
        };
      }

      return {
        success: true,
        provider: this.name,
        providerMessageId: String(data.result?.message_id),
        statusCode: 200,
        responseTimeMs: duration,
        status: 'DELIVERED',
      };
    } catch (error: any) {
      return {
        success: false,
        provider: this.name,
        statusCode: 500,
        errorMessage: error.message || 'Erreur réseau Telegram',
        responseTimeMs: Date.now() - startTime,
        status: 'FAILED',
      };
    }
  }
}
