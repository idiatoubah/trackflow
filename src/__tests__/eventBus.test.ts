import { describe, it, expect, vi } from 'vitest';
import { eventBus } from '../lib/events/eventBus';
import { DomainEvent, PackageCreatedEventPayload } from '../lib/events/types';

describe('EventBus - Architecture Event-Driven', () => {
  it('doit publier un événement et exécuter les abonnés de manière asynchrone', async () => {
    const handlerMock = vi.fn();

    // S'abonner à l'événement PACKAGE_CREATED
    const unsubscribe = eventBus.subscribe<PackageCreatedEventPayload>('PACKAGE_CREATED', handlerMock);

    const testEvent: DomainEvent<PackageCreatedEventPayload> = {
      id: 'evt_test_123',
      type: 'PACKAGE_CREATED',
      aggregateId: 'pkg_123',
      timestamp: new Date(),
      idempotencyKey: 'PACKAGE_CREATED_pkg_123',
      payload: {
        packageId: 'pkg_123',
        trackingNumber: 'TRK-TEST',
        clientEmail: 'test@example.com',
        initialStatus: 'PREPARATION',
      },
    };

    // Publier l'événement
    eventBus.publish(testEvent);

    // Attendre la résolution des microtâches asynchrones
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(handlerMock).toHaveBeenCalledTimes(1);
    expect(handlerMock).toHaveBeenCalledWith(testEvent);

    // Nettoyer l'abonnement
    unsubscribe();
  });
});
