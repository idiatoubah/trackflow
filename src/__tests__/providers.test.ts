import { describe, it, expect } from 'vitest';
import { ConsoleEmailProvider } from '../lib/notifications/providers/email/consoleEmailProvider';
import { ConsoleSmsProvider } from '../lib/notifications/providers/sms/consoleSmsProvider';
import { ResendEmailProvider } from '../lib/notifications/providers/email/resendProvider';
import { TwilioSmsProvider } from '../lib/notifications/providers/sms/twilioProvider';

describe('Providers - Absraction & Execution Providers', () => {
  it('ConsoleEmailProvider doit retourner un résultat SUCCESS avec ID simulé ou Ethereal URL', async () => {
    const provider = new ConsoleEmailProvider();
    const result = await provider.send({
      type: 'EMAIL',
      recipient: 'test@example.com',
      subject: 'Test Subject',
      bodyText: 'Test Body Text',
      trackingNumber: 'TRK-SIM-1',
      newStatus: 'PREPARATION',
    });

    expect(result.success).toBe(true);
    expect(result.provider).toBe(provider.name);
    expect(result.providerMessageId).toBeDefined();
  });

  it('ConsoleSmsProvider doit retourner un résultat SUCCESS avec ID simulé', async () => {
    const provider = new ConsoleSmsProvider();
    const result = await provider.send({
      type: 'SMS',
      recipient: '+224620000000',
      bodyText: 'Test SMS Body',
      trackingNumber: 'TRK-SIM-2',
      newStatus: 'SHIPPED',
    });

    expect(result.success).toBe(true);
    expect(result.provider).toBe('CONSOLE_SMS');
    expect(result.providerMessageId).toContain('sim_sms_');
  });

  it('ResendEmailProvider sans clé API doit retourner un échec propre sans planter', async () => {
    const provider = new ResendEmailProvider('', '');
    const result = await provider.send({
      type: 'EMAIL',
      recipient: 'test@example.com',
      trackingNumber: 'TRK-RESEND',
      bodyText: 'Test',
      newStatus: 'DELIVERED',
    });

    expect(result.success).toBe(false);
    expect(result.provider).toBe('RESEND');
    expect(result.errorMessage).toContain('Resend');
  });

  it('TwilioSmsProvider sans identifiants doit retourner un échec propre sans planter', async () => {
    const provider = new TwilioSmsProvider('', '', '');
    const result = await provider.send({
      type: 'SMS',
      recipient: '+224620000000',
      trackingNumber: 'TRK-TWILIO',
      bodyText: 'Test SMS',
      newStatus: 'DELIVERED',
    });

    expect(result.success).toBe(false);
    expect(result.provider).toBe('TWILIO');
    expect(result.errorMessage).toContain('Twilio');
  });
});
