export type NotificationChannel = 'EMAIL' | 'SMS' | 'WHATSAPP' | 'TELEGRAM';

export type NotificationStatusType =
  | 'PENDING'
  | 'SUCCESS'
  | 'DELIVERED'
  | 'FAILED'
  | 'BOUNCED'
  | 'UNDELIVERED'
  | 'SKIPPED';

export interface PackageNotificationPayload {
  packageId: string;
  trackingNumber: string;
  storeId?: string | null;
  storeName?: string | null;
  clientName?: string | null;
  clientEmail: string;
  clientPhone?: string | null;
  previousStatus?: string | null;
  newStatus: string;
  destination?: string | null;
  carrier?: string | null;
  weight?: number | null;
  notes?: string | null;
  location?: string | null;
  timestamp?: Date | string;
  preferences?: {
    notifyEmail?: boolean;
    notifySms?: boolean;
    notifyWhatsapp?: boolean;
  };
}

export interface SendNotificationOptions {
  type: NotificationChannel;
  recipient: string;
  subject?: string;
  bodyHtml?: string;
  bodyText: string;
  trackingNumber: string;
  packageId?: string;
  previousStatus?: string | null;
  newStatus: string;
  metadata?: Record<string, any>;
}

export interface NotificationResult {
  success: boolean;
  provider: string;
  providerMessageId?: string;
  statusCode?: number;
  errorMessage?: string;
  responseTimeMs: number;
  status: NotificationStatusType;
}

export interface INotificationProvider {
  name: string;
  channel: NotificationChannel;
  send(options: SendNotificationOptions): Promise<NotificationResult>;
}

export interface NotificationJobData {
  logId?: string;
  payload: PackageNotificationPayload;
  channel: NotificationChannel;
  attempts?: number;
}
