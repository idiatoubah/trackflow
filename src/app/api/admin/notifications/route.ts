import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const trackingNumber = searchParams.get('trackingNumber');
    const search = searchParams.get('search');

    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const skip = (page - 1) * limit;

    const where: any = {};

    if (type && type !== 'ALL') {
      where.type = type;
    }

    if (status && status !== 'ALL') {
      if (status === 'SUCCESS') {
        where.status = { in: ['SUCCESS', 'DELIVERED'] };
      } else if (status === 'FAILED') {
        where.status = { in: ['FAILED', 'BOUNCED', 'UNDELIVERED'] };
      } else {
        where.status = status;
      }
    }

    if (trackingNumber) {
      where.trackingNumber = { contains: trackingNumber };
    } else if (search) {
      where.OR = [
        { trackingNumber: { contains: search } },
        { recipient: { contains: search } },
        { errorMessage: { contains: search } },
      ];
    }

    const [total, logs] = await Promise.all([
      prisma.notificationLog.count({ where }),
      prisma.notificationLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          package: {
            select: {
              clientName: true,
              clientEmail: true,
              clientPhone: true,
            },
          },
        },
      }),
    ]);

    // Calculate Summary Stats
    const [totalSent, totalSuccess, totalFailed] = await Promise.all([
      prisma.notificationLog.count(),
      prisma.notificationLog.count({ where: { status: { in: ['SUCCESS', 'DELIVERED'] } } }),
      prisma.notificationLog.count({ where: { status: { in: ['FAILED', 'BOUNCED', 'UNDELIVERED'] } } }),
    ]);

    return NextResponse.json({
      logs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        totalSent,
        totalSuccess,
        totalFailed,
        successRate: totalSent > 0 ? Math.round((totalSuccess / totalSent) * 100) : 100,
      },
    });
  } catch (error: any) {
    console.error('Erreur lors de la récupération des logs de notifications:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
