import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ trackingNumber: string }> }
) {
  try {
    const p = await params;
    const packageData = await prisma.package.findUnique({
      where: { trackingNumber: p.trackingNumber.toUpperCase() },
      include: {
        events: {
          orderBy: { timestamp: 'desc' },
        },
      },
    });

    if (!packageData) {
      return NextResponse.json({ error: 'Colis introuvable' }, { status: 404 });
    }

    return NextResponse.json(packageData);
  } catch (error) {
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ trackingNumber: string }> }
) {
  try {
    const p = await params;
    const trackingNumber = p.trackingNumber.toUpperCase();

    const existingPackage = await prisma.package.findUnique({
      where: { trackingNumber },
    });

    if (!existingPackage) {
      return NextResponse.json({ error: 'Colis introuvable' }, { status: 404 });
    }

    // Supprimer les événements associés puis le colis
    await prisma.event.deleteMany({
      where: { packageId: existingPackage.id },
    });

    await prisma.package.delete({
      where: { id: existingPackage.id },
    });

    return NextResponse.json({ success: true, message: 'Colis supprimé avec succès' });
  } catch (error) {
    console.error('Erreur suppression colis:', error);
    return NextResponse.json({ error: 'Erreur interne lors de la suppression' }, { status: 500 });
  }
}
