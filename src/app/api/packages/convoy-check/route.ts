import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const convoyCheckSchema = z.object({
  trackingNumber: z.string().min(1),
  targetStatus: z.string().min(1),
});

function getDayString(dateInput: Date | string | null | undefined): string | null {
  if (!dateInput) return null;
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return null;
  return d.toISOString().substring(0, 10);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { trackingNumber, targetStatus } = convoyCheckSchema.parse(body);

    const targetPackage = await prisma.package.findUnique({
      where: { trackingNumber },
      include: {
        events: {
          orderBy: { timestamp: 'desc' },
          take: 1,
        },
      },
    });

    if (!targetPackage || !targetPackage.destination) {
      return NextResponse.json({
        hasConvoy: false,
        count: 0,
        matchingPackages: [],
      });
    }

    const targetDestNormalized = targetPackage.destination.trim().toLowerCase();
    const targetDateStr = getDayString(targetPackage.departureDate) || getDayString(targetPackage.createdAt);

    if (!targetDateStr) {
      return NextResponse.json({
        hasConvoy: false,
        count: 0,
        matchingPackages: [],
      });
    }

    // Fetch all other packages with a destination
    const allOtherPackages = await prisma.package.findMany({
      where: {
        id: { not: targetPackage.id },
        destination: { not: null },
      },
      include: {
        events: {
          orderBy: { timestamp: 'desc' },
          take: 1,
        },
      },
    });

    // Filter matching convoy packages
    const eligiblePackages = allOtherPackages.filter((pkg) => {
      if (!pkg.destination) return false;

      // 1. Match destination (case-insensitive & trimmed)
      const pkgDestNormalized = pkg.destination.trim().toLowerCase();
      if (pkgDestNormalized !== targetDestNormalized) return false;

      // 2. Match date (departureDate if available, fallback to createdAt)
      const pkgDateStr = getDayString(pkg.departureDate) || getDayString(pkg.createdAt);
      if (pkgDateStr !== targetDateStr) return false;

      // 3. Filter out packages that already have the target status
      const currentStatus = pkg.events[0]?.status;
      return currentStatus !== targetStatus;
    });

    const displayDate = targetPackage.departureDate
      ? new Date(targetPackage.departureDate).toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        })
      : new Date(targetPackage.createdAt).toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        });

    return NextResponse.json({
      hasConvoy: eligiblePackages.length > 0,
      count: eligiblePackages.length,
      destination: targetPackage.destination.trim(),
      departureDate: displayDate,
      matchingPackages: eligiblePackages.map((pkg) => ({
        id: pkg.id,
        trackingNumber: pkg.trackingNumber,
        clientName: pkg.clientName,
        clientEmail: pkg.clientEmail,
        currentStatus: pkg.events[0]?.status || 'N/A',
      })),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: (error as any).errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Erreur lors de la détection du convoi' }, { status: 500 });
  }
}
