import { PackageNotificationPayload } from '../types';
import { STATUS_MAP } from './emailTemplates';

export function renderPackageSmsText(payload: PackageNotificationPayload): string {
  const statusInfo = STATUS_MAP[payload.newStatus] || { label: payload.newStatus };
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const trackingUrl = `${appUrl}/track/${payload.trackingNumber}`;

  const greeting = payload.clientName ? `Bonjour ${payload.clientName},` : 'Bonjour,';

  // Format short SMS content (targeted <= 160 chars)
  return `${greeting} votre colis ${payload.trackingNumber} est : ${statusInfo.label.toUpperCase()}. Suivi : ${trackingUrl}`;
}
