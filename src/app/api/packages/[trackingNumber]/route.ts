import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ trackingNumber: string }> }
) {
  try {
    const p = await params;
    const packageData = await prisma.package.findUnique({
      where: { trackingNumber: p.trackingNumber },
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
    const existingPackage = await prisma.package.findUnique({
      where: { trackingNumber: p.trackingNumber },
    });

    if (!existingPackage) {
      return NextResponse.json({ error: 'Colis introuvable' }, { status: 404 });
    }

    await prisma.package.delete({
      where: { trackingNumber: p.trackingNumber },
    });

    return NextResponse.json({ success: true, message: 'Colis supprimé avec succès' });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la suppression du colis' }, { status: 500 });
  }
}
