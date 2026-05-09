import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { sendStatusUpdateEmail } from '@/lib/email';

const eventSchema = z.object({
  status: z.enum(['PREPARATION', 'SHIPPED', 'IN_TRANSIT', 'DELIVERED', 'DELAYED']),
  location: z.string().optional(),
  notes: z.string().optional(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ trackingNumber: string }> }
) {
  try {
    const p = await params;
    const body = await req.json();
    const data = eventSchema.parse(body);

    const packageData = await prisma.package.findUnique({
      where: { trackingNumber: p.trackingNumber },
    });

    if (!packageData) {
      return NextResponse.json({ error: 'Colis introuvable' }, { status: 404 });
    }

    const event = await prisma.trackingEvent.create({
      data: {
        packageId: packageData.id,
        status: data.status,
        location: data.location,
        notes: data.notes,
      },
    });

    // Envoyer un email de mise à jour (asynchrone)
    if (packageData.clientEmail) {
      sendStatusUpdateEmail(
        packageData.clientEmail,
        packageData.trackingNumber,
        event.status,
        event.notes
      );
    }

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: (error as any).errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
