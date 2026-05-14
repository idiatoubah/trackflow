import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { sendPackageCreatedEmail } from '@/lib/email';

const createPackageSchema = z.object({
  trackingNumber: z.string().min(1, 'Le numéro de suivi est requis'),
  clientEmail: z.string().email('Email Invalide'),
  clientName: z.string().optional(),
  clientPhone: z.string().optional(),
  destination: z.string().optional(),
  carrier: z.string().optional(),
  weight: z.coerce.number().optional(),
  initialStatus: z.string().optional().default('PREPARATION'),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = createPackageSchema.parse(body);

    const existingPackage = await prisma.package.findUnique({
      where: { trackingNumber: data.trackingNumber },
    });

    if (existingPackage) {
      return NextResponse.json({ error: 'Ce numéro de suivi existe déjà' }, { status: 400 });
    }

    const newPackage = await prisma.package.create({
      data: {
        trackingNumber: data.trackingNumber,
        clientEmail: data.clientEmail,
        clientName: data.clientName,
        clientPhone: data.clientPhone,
        destination: data.destination,
        carrier: data.carrier,
        weight: data.weight,
        events: {
          create: {
            status: data.initialStatus,
            notes: 'Colis créé',
          },
        },
      },
      include: {
        events: true,
      },
    });

    // Envoyer l'email de création de colis (asynchrone)
    if (newPackage.clientEmail) {
      sendPackageCreatedEmail(
        newPackage.clientEmail,
        newPackage.trackingNumber,
        data.initialStatus
      );
    }

    return NextResponse.json(newPackage, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: (error as any).errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const packages = await prisma.package.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        events: {
          orderBy: { timestamp: 'desc' },
          take: 1
        }
      }
    });
    return NextResponse.json(packages);
  } catch (error) {
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
