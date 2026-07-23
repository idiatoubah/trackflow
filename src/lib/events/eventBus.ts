import { DomainEvent, EventHandler, EventType } from './types';

class EventBus {
  private handlers: Map<EventType, Set<EventHandler>> = new Map();

  /**
   * Subscribes an event handler function to a specific EventType.
   */
  public subscribe<T = any>(eventType: EventType, handler: EventHandler<T>): () => void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    this.handlers.get(eventType)!.add(handler);

    // Return unsubscribe callback
    return () => {
      this.handlers.get(eventType)?.delete(handler);
    };
  }

  /**
   * Publishes a domain event asynchronously to all subscribed handlers.
   * Handlers run in non-blocking fashion.
   */
  public publish<T = any>(event: DomainEvent<T>): void {
    const subscribers = this.handlers.get(event.type);
    if (!subscribers || subscribers.size === 0) {
      console.log(`[EventBus] Aucun abonné pour l'événement ${event.type}`);
      return;
    }

    // Execute handlers asynchronously
    subscribers.forEach((handler) => {
      Promise.resolve().then(async () => {
        try {
          await handler(event);
        } catch (error) {
          console.error(`[EventBus Error] Erreur lors du traitement de l'événement ${event.type} (${event.id}):`, error);
        }
      });
    });
  }
}

// Global Singleton for application lifetime
export const eventBus = new EventBus();
