import { prisma } from '@/lib/prisma';
import seedData from '../../prisma/seedData.json';

let seedingInProgress = false;

export async function ensureDatabaseSeeded() {
  if (seedingInProgress) return;

  try {
    const bvPackageCount = await prisma.package.count({
      where: { trackingNumber: { startsWith: 'BV-' } },
    });

    if (bvPackageCount >= 17) return; // All 17 packages are present

    seedingInProgress = true;
    console.log('[AutoSeed] Restauration des 17 colis officiels BV-0001 à BV-0018...');

    // 1. Seed Stores
    for (const store of seedData.stores) {
      const existing = await prisma.store.findUnique({ where: { id: store.id } });
      if (!existing) {
        await prisma.store.create({
          data: {
            id: store.id,
            name: store.name,
            slug: store.slug,
            logoUrl: store.logoUrl,
            address: store.address,
            phone: store.phone,
            email: store.email,
            country: store.country,
            managerName: store.managerName,
            subscriptionPlan: store.subscriptionPlan,
            subscriptionStatus: store.subscriptionStatus,
            createdAt: new Date(store.createdAt),
            updatedAt: new Date(store.updatedAt),
          },
        });
      }
    }

    // 2. Seed Users
    for (const user of seedData.users) {
      const existing = await prisma.user.findUnique({ where: { id: user.id } });
      if (!existing) {
        await prisma.user.create({
          data: {
            id: user.id,
            storeId: user.storeId,
            name: user.name,
            email: user.email,
            passwordHash: user.passwordHash,
            role: user.role,
            createdAt: new Date(user.createdAt),
            updatedAt: new Date(user.updatedAt),
          },
        });
      }
    }

    // 3. Seed Packages & Events
    for (const pkg of seedData.packages) {
      const existing = await prisma.package.findUnique({ where: { id: pkg.id } });
      if (!existing) {
        await prisma.package.create({
          data: {
            id: pkg.id,
            trackingNumber: pkg.trackingNumber,
            storeId: pkg.storeId,
            clientEmail: pkg.clientEmail,
            clientName: pkg.clientName,
            clientPhone: pkg.clientPhone,
            destination: pkg.destination,
            carrier: pkg.carrier,
            weight: pkg.weight,
            notifyEmail: pkg.notifyEmail,
            notifySms: pkg.notifySms,
            notifyWhatsapp: pkg.notifyWhatsapp,
            departureDate: pkg.departureDate ? new Date(pkg.departureDate) : null,
            createdAt: new Date(pkg.createdAt),
            updatedAt: new Date(pkg.updatedAt),
          },
        });

        if (pkg.events && pkg.events.length > 0) {
          for (const ev of pkg.events) {
            const existingEv = await prisma.trackingEvent.findUnique({ where: { id: ev.id } });
            if (!existingEv) {
              await prisma.trackingEvent.create({
                data: {
                  id: ev.id,
                  packageId: ev.packageId,
                  status: ev.status,
                  location: ev.location,
                  notes: ev.notes,
                  timestamp: new Date(ev.timestamp),
                },
              });
            }
          }
        }
      }
    }

    console.log('[AutoSeed] Restauration des 17 colis officiels terminée avec succès !');
  } catch (err) {
    console.error('[AutoSeed] Erreur lors de l’auto-restauration des données:', err);
  } finally {
    seedingInProgress = false;
  }
}
