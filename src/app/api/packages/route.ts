import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { eventBus } from '@/lib/events/eventBus';
import { getSession } from '@/lib/auth/session';
import '@/lib/notifications/subscribers';

const createPackageSchema = z.object({
  trackingNumber: z.string().min(1, 'Le numéro de suivi est requis'),
  clientEmail: z.string().email('Email Invalide'),
  clientName: z.string().optional(),
  clientPhone: z.string().optional(),
  destination: z.string().optional(),
  carrier: z.string().optional(),
  weight: z.coerce.number().optional(),
  departureDate: z.string().optional(),
  notifyEmail: z.boolean().optional().default(true),
  notifySms: z.boolean().optional().default(false),
  notifyWhatsapp: z.boolean().optional().default(true),
  initialStatus: z.string().optional().default('PREPARATION'),
});

async function resolveStoreId(): Promise<string> {
  const session = await getSession();
  if (session?.storeId) return session.storeId;

  const defaultStore = await prisma.store.findFirst({
    orderBy: { createdAt: 'asc' },
  });
  if (defaultStore) return defaultStore.id;

  const newStore = await prisma.store.create({
    data: {
      name: 'Trackflow Main Store',
      slug: 'trackflow-default',
      email: 'admin@trackflow.com',
    },
  });
  return newStore.id;
}

export async function POST(req: Request) {
  try {
    const storeId = await resolveStoreId();
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
        storeId,
        trackingNumber: data.trackingNumber,
        clientEmail: data.clientEmail,
        clientName: data.clientName,
        clientPhone: data.clientPhone,
        destination: data.destination,
        carrier: data.carrier,
        weight: data.weight,
        departureDate: data.departureDate ? new Date(data.departureDate) : null,
        notifyEmail: data.notifyEmail,
        notifySms: data.notifySms,
        notifyWhatsapp: data.notifyWhatsapp,
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

    // Publish PACKAGE_CREATED Domain Event to EventBus
    eventBus.publish({
      id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      type: 'PACKAGE_CREATED',
      aggregateId: newPackage.id,
      timestamp: new Date(),
      idempotencyKey: `PACKAGE_CREATED_${newPackage.id}`,
      payload: {
        packageId: newPackage.id,
        trackingNumber: newPackage.trackingNumber,
        clientEmail: newPackage.clientEmail,
        clientName: newPackage.clientName,
        clientPhone: newPackage.clientPhone,
        destination: newPackage.destination,
        carrier: newPackage.carrier,
        weight: newPackage.weight,
        initialStatus: data.initialStatus,
        notifyEmail: newPackage.notifyEmail,
        notifySms: newPackage.notifySms,
        notifyWhatsapp: newPackage.notifyWhatsapp,
      },
    });

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
    const storeId = await resolveStoreId();
    const packages = await prisma.package.findMany({
      where: { storeId },
      orderBy: { createdAt: 'desc' },
      include: {
        events: {
          orderBy: { timestamp: 'desc' },
          take: 1,
        },
      },
    });
    return NextResponse.json(packages);
  } catch (error) {
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
