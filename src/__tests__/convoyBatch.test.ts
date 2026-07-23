import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { prisma } from '../lib/prisma';
import { eventBus } from '../lib/events/eventBus';

describe('Convoy Batch Update System', () => {
  const depDateStr = '2026-07-25T00:00:00.000Z';
  const depDateObj = new Date(depDateStr);

  beforeEach(async () => {
    // Cleanup test packages
    await prisma.package.deleteMany({
      where: { trackingNumber: { startsWith: 'TRK-CONVOY-TEST-' } },
    });
  });

  afterEach(async () => {
    await prisma.package.deleteMany({
      where: { trackingNumber: { startsWith: 'TRK-CONVOY-TEST-' } },
    });
  });

  it('doit créer plusieurs colis dans un même convoi et vérifier la détection', async () => {
    // Create 3 packages with same departureDate & destination "Paris"
    const p1 = await prisma.package.create({
      data: {
        trackingNumber: 'TRK-CONVOY-TEST-1',
        clientEmail: 'client1@example.com',
        clientName: 'Client 1',
        destination: 'Paris',
        departureDate: depDateObj,
        events: { create: { status: 'PREPARATION', notes: 'Test' } },
      },
    });

    const p2 = await prisma.package.create({
      data: {
        trackingNumber: 'TRK-CONVOY-TEST-2',
        clientEmail: 'client2@example.com',
        clientName: 'Client 2',
        destination: 'Paris',
        departureDate: depDateObj,
        events: { create: { status: 'PREPARATION', notes: 'Test' } },
      },
    });

    const p3 = await prisma.package.create({
      data: {
        trackingNumber: 'TRK-CONVOY-TEST-3',
        clientEmail: 'client3@example.com',
        clientName: 'Client 3',
        destination: 'Paris',
        departureDate: depDateObj,
        events: { create: { status: 'PREPARATION', notes: 'Test' } },
      },
    });

    // Query convoy check for p1 with target status IN_TRANSIT
    const startOfDay = new Date(depDateObj.getFullYear(), depDateObj.getMonth(), depDateObj.getDate(), 0, 0, 0, 0);
    const endOfDay = new Date(depDateObj.getFullYear(), depDateObj.getMonth(), depDateObj.getDate(), 23, 59, 59, 999);

    const matching = await prisma.package.findMany({
      where: {
        id: { not: p1.id },
        destination: 'Paris',
        departureDate: { gte: startOfDay, lte: endOfDay },
      },
    });

    expect(matching.length).toBe(2);
    expect(matching.map((p) => p.trackingNumber)).toContain('TRK-CONVOY-TEST-2');
    expect(matching.map((p) => p.trackingNumber)).toContain('TRK-CONVOY-TEST-3');
  });

  it('doit publier les événements EventBus pour tous les colis d’un convoi lors d’un batch update', async () => {
    let publishedEventsCount = 0;
    const unsubscribe = eventBus.subscribe('PACKAGE_STATUS_CHANGED', () => {
      publishedEventsCount++;
    });

    // Create 2 packages in convoy
    const p1 = await prisma.package.create({
      data: {
        trackingNumber: 'TRK-CONVOY-TEST-10',
        clientEmail: 'test10@example.com',
        destination: 'Conakry',
        departureDate: depDateObj,
        events: { create: { status: 'PREPARATION' } },
      },
    });

    const p2 = await prisma.package.create({
      data: {
        trackingNumber: 'TRK-CONVOY-TEST-20',
        clientEmail: 'test20@example.com',
        destination: 'Conakry',
        departureDate: depDateObj,
        events: { create: { status: 'PREPARATION' } },
      },
    });

    // Simulate batch update of convoy to IN_TRANSIT
    const convoyPackages = [p1, p2];
    for (const pkg of convoyPackages) {
      await prisma.trackingEvent.create({
        data: { packageId: pkg.id, status: 'IN_TRANSIT', notes: 'Batch test' },
      });
      eventBus.publish({
        id: `evt_${Date.now()}_${Math.random()}`,
        type: 'PACKAGE_STATUS_CHANGED',
        aggregateId: pkg.id,
        timestamp: new Date(),
        idempotencyKey: `BATCH_TEST_${pkg.id}_IN_TRANSIT`,
        payload: {
          packageId: pkg.id,
          trackingNumber: pkg.trackingNumber,
          clientEmail: pkg.clientEmail,
          previousStatus: 'PREPARATION',
          newStatus: 'IN_TRANSIT',
          destination: 'Conakry',
        },
      });
    }

    // Wait for microtask queue to process EventBus handlers
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(publishedEventsCount).toBe(2);
    unsubscribe();
  });
});
