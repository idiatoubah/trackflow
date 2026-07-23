import { NextResponse } from 'next/server';
import { getSession, createSession } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { ensureDatabaseSeeded } from '@/lib/autoSeed';

export async function GET() {
  await ensureDatabaseSeeded();

  // Find the primary store "Trackflow Express Logistique"
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

  let session = await getSession();

  // If no session or session is pointing to wrong store, force re-creation of session for main store
  if (!session || (mainStore && session.storeId !== mainStore.id)) {
    if (mainUser && mainStore) {
      await createSession({
        userId: mainUser.id,
        storeId: mainStore.id,
        email: mainUser.email,
        role: mainUser.role,
        name: mainUser.name,
        storeName: mainStore.name,
        storeSlug: mainStore.slug,
      });

      return NextResponse.json({
        authenticated: true,
        session: {
          userId: mainUser.id,
          storeId: mainStore.id,
          email: mainUser.email,
          role: mainUser.role,
          name: mainUser.name,
          storeName: mainStore.name,
          storeSlug: mainStore.slug,
        },
        user: {
          id: mainUser.id,
          email: mainUser.email,
          name: mainUser.name,
          role: mainUser.role,
          storeId: mainStore.id,
        },
        store: mainStore,
      });
    }
  }

  if (!session && mainStore) {
    return NextResponse.json({
      authenticated: true,
      store: mainStore,
    });
  }

  const user = session ? await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      storeId: true,
    },
  }) : null;

  const store = session ? await prisma.store.findUnique({
    where: { id: session.storeId },
  }) : mainStore;

  return NextResponse.json({
    authenticated: true,
    session,
    user,
    store: store || mainStore,
  });
}
