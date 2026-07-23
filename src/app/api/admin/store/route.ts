import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';
import { z } from 'zod';

const updateStoreSchema = z.object({
  name: z.string().min(2).optional(),
  logoUrl: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  country: z.string().optional(),
  managerName: z.string().optional(),
});

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      const defaultStore = await prisma.store.findFirst({ orderBy: { createdAt: 'asc' } });
      return NextResponse.json(defaultStore);
    }

    const store = await prisma.store.findUnique({
      where: { id: session.storeId },
      include: {
        _count: {
          select: {
            packages: true,
            users: true,
          },
        },
      },
    });

    return NextResponse.json(store);
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'OWNER' && session.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Droits insuffisants pour modifier la boutique' }, { status: 403 });
    }

    const body = await req.json();
    const data = updateStoreSchema.parse(body);

    const updatedStore = await prisma.store.update({
      where: { id: session.storeId },
      data: {
        name: data.name,
        logoUrl: data.logoUrl,
        address: data.address,
        phone: data.phone,
        country: data.country,
        managerName: data.managerName,
      },
    });

    return NextResponse.json(updatedStore);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: (error as any).errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Erreur lors de la mise à jour de la boutique' }, { status: 500 });
  }
}
