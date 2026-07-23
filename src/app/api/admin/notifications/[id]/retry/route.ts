import { NextResponse } from 'next/server';
import { NotificationService } from '@/lib/notifications/notificationService';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'ID de notification requis' }, { status: 400 });
    }

    const success = await NotificationService.retry(id);

    if (success) {
      return NextResponse.json({ message: 'Notification renvoyée avec succès', success: true });
    } else {
      return NextResponse.json(
        { error: 'L’envoi a échoué. Consultez le journal des notifications pour le détail de l’erreur.' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Erreur lors de la tentative de renvoi:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors du renvoi de la notification' },
      { status: 500 }
    );
  }
}
