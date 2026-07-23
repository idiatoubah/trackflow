import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, data } = body;

    if (!data || !data.email_id) {
      return NextResponse.json({ message: 'Payload webhook invalide' }, { status: 400 });
    }

    const emailId = data.email_id;
    let targetStatus: 'DELIVERED' | 'BOUNCED' | 'FAILED' | 'SUCCESS' | null = null;
    let errorMessage: string | undefined = undefined;

    switch (type) {
      case 'email.delivered':
        targetStatus = 'DELIVERED';
        break;
      case 'email.bounced':
        targetStatus = 'BOUNCED';
        errorMessage = 'Email rejeté (bounced) par le serveur de messagerie du destinataire';
        break;
      case 'email.complained':
        targetStatus = 'FAILED';
        errorMessage = 'Signalé comme spam par le destinataire';
        break;
      case 'email.sent':
        targetStatus = 'SUCCESS';
        break;
    }

    if (targetStatus) {
      const existingLog = await prisma.notificationLog.findFirst({
        where: { providerMessageId: emailId },
      });

      if (existingLog) {
        await prisma.notificationLog.update({
          where: { id: existingLog.id },
          data: {
            status: targetStatus,
            success: targetStatus === 'DELIVERED' || targetStatus === 'SUCCESS',
            ...(errorMessage ? { errorMessage } : {}),
          },
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Erreur Webhook Resend:', error);
    return NextResponse.json({ error: 'Erreur interne lors du traitement du webhook' }, { status: 500 });
  }
}
