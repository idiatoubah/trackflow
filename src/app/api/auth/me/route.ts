import { NextResponse } from 'next/server';
import { getSession, createSession } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { ensureDatabaseSeeded } from '@/lib/autoSeed';

export async function GET() {
  await ensureDatabaseSeeded();

  let session = await getSession();

  if (!session) {
    // Auto-login seamless fallback for default main store owner
    const mainUser = await prisma.user.findFirst({
      where: { role: 'OWNER' },
      include: { store: true },
      orderBy: { createdAt: 'asc' },
    });

    if (mainUser) {
      await createSession({
        userId: mainUser.id,
        storeId: mainUser.storeId,
        email: mainUser.email,
        role: mainUser.role,
        name: mainUser.name,
        storeName: mainUser.store.name,
        storeSlug: mainUser.store.slug,
      });

      return NextResponse.json({
        authenticated: true,
        session: {
          userId: mainUser.id,
          storeId: mainUser.storeId,
          email: mainUser.email,
          role: mainUser.role,
          name: mainUser.name,
          storeName: mainUser.store.name,
          storeSlug: mainUser.store.slug,
        },
        user: {
          id: mainUser.id,
          email: mainUser.email,
          name: mainUser.name,
          role: mainUser.role,
          storeId: mainUser.storeId,
        },
        store: mainUser.store,
      });
    }
  }

  if (!session) {
    return NextResponse.json({ authenticated: false });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      storeId: true,
    },
  });

  const store = await prisma.store.findUnique({
    where: { id: session.storeId },
  });

  return NextResponse.json({
    authenticated: true,
    session,
    user,
    store,
  });
}
