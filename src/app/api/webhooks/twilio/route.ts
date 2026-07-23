import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const messageSid = formData.get('MessageSid')?.toString();
    const messageStatus = formData.get('MessageStatus')?.toString()?.toLowerCase();
    const errorCode = formData.get('ErrorCode')?.toString();

    if (!messageSid || !messageStatus) {
      return NextResponse.json({ message: 'Payload callback Twilio invalide' }, { status: 400 });
    }

    let targetStatus: 'DELIVERED' | 'UNDELIVERED' | 'FAILED' | 'SUCCESS' | null = null;
    let errorMessage: string | undefined = undefined;

    if (messageStatus === 'delivered') {
      targetStatus = 'DELIVERED';
    } else if (messageStatus === 'undelivered') {
      targetStatus = 'UNDELIVERED';
      errorMessage = `SMS non délivré par l'opérateur mobile (Code erreur Twilio: ${errorCode || 'inconnu'})`;
    } else if (messageStatus === 'failed') {
      targetStatus = 'FAILED';
      errorMessage = `Échec d'envoi SMS (Code erreur Twilio: ${errorCode || 'inconnu'})`;
    } else if (messageStatus === 'sent') {
      targetStatus = 'SUCCESS';
    }

    if (targetStatus) {
      const existingLog = await prisma.notificationLog.findFirst({
        where: { providerMessageId: messageSid },
      });

      if (existingLog) {
        await prisma.notificationLog.update({
          where: { id: existingLog.id },
          data: {
            status: targetStatus,
            success: targetStatus === 'DELIVERED' || targetStatus === 'SUCCESS',
            ...(errorMessage ? { errorMessage } : {}),
            ...(errorCode ? { statusCode: parseInt(errorCode, 10) || undefined } : {}),
          },
        });
      }
    }

    return new Response('<Response></Response>', {
      headers: { 'Content-Type': 'text/xml' },
    });
  } catch (error: any) {
    console.error('Erreur Webhook Twilio:', error);
    return NextResponse.json({ error: 'Erreur traitement webhook Twilio' }, { status: 500 });
  }
}
