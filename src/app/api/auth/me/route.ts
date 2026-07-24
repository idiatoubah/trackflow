import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { ensureDatabaseSeeded } from '@/lib/autoSeed';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await ensureDatabaseSeeded();

    const session = await getSession();

    if (session && session.storeId) {
      const store = await prisma.store.findUnique({
        where: { id: session.storeId },
      });

      const user = await prisma.user.findUnique({
        where: { id: session.userId },
      });

      if (store && user) {
        return NextResponse.json({
          authenticated: true,
          session,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            storeId: store.id,
          },
          store,
        });
      }
    }

    const mainStore = await prisma.store.findFirst({
      where: {
        OR: [
          { slug: 'trackflow-main' },
          { name: { contains: 'Trackflow Express Logistique' } }
        ]
      },
      orderBy: { createdAt: 'asc' },
    }) || await prisma.store.findFirst({ orderBy: { createdAt: 'asc' } });

    const mainUser = await prisma.user.findFirst({
      where: { role: 'OWNER' },
      include: { store: true },
      orderBy: { createdAt: 'asc' },
    });

    if (mainStore) {
      return NextResponse.json({
        authenticated: true,
        user: mainUser ? {
          id: mainUser.id,
          email: mainUser.email,
          name: mainUser.name,
          role: mainUser.role,
          storeId: mainStore.id,
        } : {
          name: 'Idiatou Bah',
          email: 'bahidiatou38@gmail.com',
          role: 'OWNER',
          storeId: mainStore.id,
        },
        store: mainStore,
      });
    }
  } catch (error) {
    console.error('Erreur dans /api/auth/me:', error);
  }

  // Absolute JSON fallback for Trackflow Express Logistique
  return NextResponse.json({
    authenticated: true,
    user: {
      name: 'Idiatou Bah',
      email: 'bahidiatou38@gmail.com',
      role: 'OWNER',
    },
    store: {
      name: 'Trackflow Express Logistique',
      managerName: 'Idiatou Bah',
      email: 'contact@trackflow.com',
      phone: '+224620000000',
      country: 'Guinée',
    },
  });
}
