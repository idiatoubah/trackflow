import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { eventBus } from '@/lib/events/eventBus';
import '@/lib/notifications/subscribers'; // Ensure subscribers are registered

const eventSchema = z.object({
  status: z.enum([
    'PREPARATION',
    'SHIPPED',
    'IN_TRANSIT',
    'ARRIVED',
    'AVAILABLE',
    'DELIVERED',
    'DELAYED',
    'INCIDENT',
  ]),
  location: z.string().optional(),
  notes: z.string().optional(),
  applyToConvoy: z.boolean().optional().default(false),
});

function getDayString(dateInput: Date | string | null | undefined): string | null {
  if (!dateInput) return null;
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return null;
  return d.toISOString().substring(0, 10);
}

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
      include: {
        events: {
          orderBy: { timestamp: 'desc' },
          take: 1,
        },
      },
    });

    if (!packageData) {
      return NextResponse.json({ error: 'Colis introuvable' }, { status: 404 });
    }

    const previousStatus = packageData.events[0]?.status || null;

    // 1. Create event for target package
    const event = await prisma.trackingEvent.create({
      data: {
        packageId: packageData.id,
        status: data.status,
        location: data.location,
        notes: data.notes,
      },
    });

    // Publish event for target package
    eventBus.publish({
      id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      type: 'PACKAGE_STATUS_CHANGED',
      aggregateId: packageData.id,
      timestamp: new Date(),
      idempotencyKey: `PACKAGE_STATUS_CHANGED_${packageData.id}_${data.status}`,
      payload: {
        packageId: packageData.id,
        trackingNumber: packageData.trackingNumber,
        clientEmail: packageData.clientEmail,
        clientName: packageData.clientName,
        clientPhone: packageData.clientPhone,
        previousStatus,
        newStatus: data.status,
        destination: packageData.destination,
        carrier: packageData.carrier,
        weight: packageData.weight,
        location: data.location,
        notes: data.notes,
        notifyEmail: packageData.notifyEmail,
        notifySms: packageData.notifySms,
        notifyWhatsapp: packageData.notifyWhatsapp,
      },
    });

    let updatedCount = 1;

    // 2. If applyToConvoy is true, find and update all matching convoy packages
    if (data.applyToConvoy && packageData.destination) {
      const targetDestNormalized = packageData.destination.trim().toLowerCase();
      const targetDateStr = getDayString(packageData.departureDate) || getDayString(packageData.createdAt);

      if (targetDateStr) {
        const allOtherPackages = await prisma.package.findMany({
          where: {
            id: { not: packageData.id },
            destination: { not: null },
          },
          include: {
            events: {
              orderBy: { timestamp: 'desc' },
              take: 1,
            },
          },
        });

        const convoyPackages = allOtherPackages.filter((pkg) => {
          if (!pkg.destination) return false;

          const pkgDestNormalized = pkg.destination.trim().toLowerCase();
          if (pkgDestNormalized !== targetDestNormalized) return false;

          const pkgDateStr = getDayString(pkg.departureDate) || getDayString(pkg.createdAt);
          return pkgDateStr === targetDateStr;
        });

        for (const convoyPkg of convoyPackages) {
          const pkgPrevStatus = convoyPkg.events[0]?.status || null;
          if (pkgPrevStatus === data.status) continue; // Skip if status is already identical

          await prisma.trackingEvent.create({
            data: {
              packageId: convoyPkg.id,
              status: data.status,
              location: data.location,
              notes: data.notes || 'Mise à jour automatique par convoi',
            },
          });

          updatedCount++;

          // Publish Event for each convoy package to trigger notifications
          eventBus.publish({
            id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            type: 'PACKAGE_STATUS_CHANGED',
            aggregateId: convoyPkg.id,
            timestamp: new Date(),
            idempotencyKey: `PACKAGE_STATUS_CHANGED_${convoyPkg.id}_${data.status}`,
            payload: {
              packageId: convoyPkg.id,
              trackingNumber: convoyPkg.trackingNumber,
              clientEmail: convoyPkg.clientEmail,
              clientName: convoyPkg.clientName,
              clientPhone: convoyPkg.clientPhone,
              previousStatus: pkgPrevStatus,
              newStatus: data.status,
              destination: convoyPkg.destination,
              carrier: convoyPkg.carrier,
              weight: convoyPkg.weight,
              location: data.location,
              notes: data.notes || 'Mise à jour automatique par convoi',
              notifyEmail: convoyPkg.notifyEmail,
              notifySms: convoyPkg.notifySms,
              notifyWhatsapp: convoyPkg.notifyWhatsapp,
            },
          });
        }
      }
    }

    return NextResponse.json({
      event,
      updatedCount,
      applyToConvoy: data.applyToConvoy,
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: (error as any).errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
