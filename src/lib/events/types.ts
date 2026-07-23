export type EventType =
  | 'PACKAGE_CREATED'
  | 'PACKAGE_STATUS_CHANGED'
  | 'NOTIFICATION_RETRY_REQUESTED';

export interface DomainEvent<T = any> {
  id: string; // Event ID (UUID)
  type: EventType;
  aggregateId: string; // packageId or trackingNumber
  timestamp: Date;
  idempotencyKey: string;
  payload: T;
}

export interface PackageCreatedEventPayload {
  packageId: string;
  trackingNumber: string;
  clientEmail: string;
  clientName?: string | null;
  clientPhone?: string | null;
  destination?: string | null;
  carrier?: string | null;
  weight?: number | null;
  initialStatus: string;
  notifyEmail?: boolean;
  notifySms?: boolean;
  notifyWhatsapp?: boolean;
}

export interface PackageStatusChangedEventPayload {
  packageId: string;
  trackingNumber: string;
  clientEmail: string;
  clientName?: string | null;
  clientPhone?: string | null;
  previousStatus: string | null;
  newStatus: string;
  destination?: string | null;
  carrier?: string | null;
  weight?: number | null;
  location?: string | null;
  notes?: string | null;
  notifyEmail?: boolean;
  notifySms?: boolean;
  notifyWhatsapp?: boolean;
}

export type EventHandler<T = any> = (event: DomainEvent<T>) => Promise<void> | void;
