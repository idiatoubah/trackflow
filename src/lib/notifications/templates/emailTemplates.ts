import { PackageNotificationPayload } from '../types';

export const STATUS_MAP: Record<string, { label: string; color: string; badgeBg: string; description: string }> = {
  PREPARATION: {
    label: 'En préparation',
    color: '#475569',
    badgeBg: '#f1f5f9',
    description: 'Votre colis est en cours d’emballage et de préparation dans notre centre logistique.',
  },
  SHIPPED: {
    label: 'Expédié',
    color: '#2563eb',
    badgeBg: '#dbeafe',
    description: 'Votre colis a quitté notre entrepôt et a été pris en charge par le transporteur.',
  },
  IN_TRANSIT: {
    label: 'En transit',
    color: '#d97706',
    badgeBg: '#fef3c7',
    description: 'Votre colis est en chemin vers sa destination.',
  },
  ARRIVED: {
    label: 'Arrivé à destination',
    color: '#0284c7',
    badgeBg: '#e0f2fe',
    description: 'Votre colis est arrivé dans la ville / agence de destination.',
  },
  AVAILABLE: {
    label: 'Disponible en point de retrait',
    color: '#7c3aed',
    badgeBg: '#ede9fe',
    description: 'Votre colis est prêt à être récupéré à notre point de retrait.',
  },
  DELIVERED: {
    label: 'Livré',
    color: '#059669',
    badgeBg: '#d1fae5',
    description: 'Votre colis a été remis en main propre au destinataire.',
  },
  DELAYED: {
    label: 'Retardé',
    color: '#dc2626',
    badgeBg: '#fee2e2',
    description: 'Un léger retard est survenu dans la livraison de votre colis.',
  },
  INCIDENT: {
    label: 'Incident signalé',
    color: '#b91c1c',
    badgeBg: '#fef2f2',
    description: 'Un problème est survenu lors de l’acheminement. Notre équipe traite la situation.',
  },
};

export function renderPackageEmailSubject(payload: PackageNotificationPayload): string {
  const statusInfo = STATUS_MAP[payload.newStatus] || { label: payload.newStatus };
  if (!payload.previousStatus) {
    return `[Trackflow] Votre colis ${payload.trackingNumber} a été enregistré (${statusInfo.label})`;
  }
  return `[Trackflow] Mise à jour du colis ${payload.trackingNumber} : ${statusInfo.label}`;
}

export function renderPackageEmailHtml(payload: PackageNotificationPayload): string {
  const statusInfo = STATUS_MAP[payload.newStatus] || {
    label: payload.newStatus,
    color: '#2563eb',
    badgeBg: '#dbeafe',
    description: 'Le statut de votre colis a été mis à jour.',
  };

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const trackingUrl = `${appUrl}/track/${payload.trackingNumber}`;

  const formattedDate = payload.timestamp
    ? new Date(payload.timestamp).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

  const formattedTime = payload.timestamp
    ? new Date(payload.timestamp).toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  const clientGreeting = payload.clientName ? `Bonjour ${payload.clientName},` : 'Bonjour,';
  const storeNameText = payload.storeName ? payload.storeName : 'notre boutique';

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Notification Trackflow</title>
</head>
<body style="margin:0; padding:0; background-color:#f8fafc; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color:#334155;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#f8fafc; padding:30px 15px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width:600px; background-color:#ffffff; border-radius:16px; overflow:hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03); border:1px solid #e2e8f0;">
          
          <!-- Header -->
          <tr>
            <td style="background-color:#0f172a; padding:28px 32px; text-align:left;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <span style="font-size:24px; font-weight:800; color:#ffffff; letter-spacing:-0.5px;">Track<span style="color:#38bdf8;">flow</span></span>
                  </td>
                  <td align="right">
                    <span style="font-size:12px; font-weight:600; color:#94a3b8; text-transform:uppercase; letter-spacing:1px;">Colis #${payload.trackingNumber}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding:32px;">
              <p style="font-size:16px; margin-top:0; margin-bottom:16px; font-weight:600; color:#0f172a;">${clientGreeting}</p>
              
              <p style="font-size:15px; line-height:1.6; margin-bottom:24px; color:#475569;">
                Nous vous informons de la mise à jour de l'acheminement de votre colis.
              </p>

              <!-- Status Card -->
              <div style="background-color:${statusInfo.badgeBg}; border-radius:12px; padding:20px; margin-bottom:28px; border:1px solid rgba(0,0,0,0.05);">
                <div style="font-size:12px; font-weight:700; text-transform:uppercase; color:${statusInfo.color}; letter-spacing:0.5px; margin-bottom:4px;">Nouveau Statut</div>
                <div style="font-size:22px; font-weight:800; color:${statusInfo.color}; margin-bottom:8px;">${statusInfo.label}</div>
                <div style="font-size:14px; color:#334155; line-height:1.5;">${statusInfo.description}</div>
              </div>

              <!-- Package Details Table -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom:28px; border-collapse:collapse;">
                <tr style="border-bottom:1px solid #f1f5f9;">
                  <td style="padding:10px 0; font-size:13px; color:#64748b; font-weight:500;">Numéro de suivi</td>
                  <td align="right" style="padding:10px 0; font-size:14px; color:#0f172a; font-weight:700;">${payload.trackingNumber}</td>
                </tr>
                ${payload.previousStatus ? `
                <tr style="border-bottom:1px solid #f1f5f9;">
                  <td style="padding:10px 0; font-size:13px; color:#64748b; font-weight:500;">Ancien statut</td>
                  <td align="right" style="padding:10px 0; font-size:14px; color:#64748b; font-weight:500;">${STATUS_MAP[payload.previousStatus]?.label || payload.previousStatus}</td>
                </tr>
                ` : ''}
                <tr style="border-bottom:1px solid #f1f5f9;">
                  <td style="padding:10px 0; font-size:13px; color:#64748b; font-weight:500;">Date & Heure</td>
                  <td align="right" style="padding:10px 0; font-size:14px; color:#0f172a; font-weight:500;">${formattedDate} à ${formattedTime}</td>
                </tr>
                ${payload.destination ? `
                <tr style="border-bottom:1px solid #f1f5f9;">
                  <td style="padding:10px 0; font-size:13px; color:#64748b; font-weight:500;">Destination</td>
                  <td align="right" style="padding:10px 0; font-size:14px; color:#0f172a; font-weight:500;">${payload.destination}</td>
                </tr>
                ` : ''}
                ${payload.carrier ? `
                <tr style="border-bottom:1px solid #f1f5f9;">
                  <td style="padding:10px 0; font-size:13px; color:#64748b; font-weight:500;">Transporteur</td>
                  <td align="right" style="padding:10px 0; font-size:14px; color:#0f172a; font-weight:500;">${payload.carrier}</td>
                </tr>
                ` : ''}
                ${payload.weight ? `
                <tr style="border-bottom:1px solid #f1f5f9;">
                  <td style="padding:10px 0; font-size:13px; color:#64748b; font-weight:500;">Poids</td>
                  <td align="right" style="padding:10px 0; font-size:14px; color:#0f172a; font-weight:500;">${payload.weight} kg</td>
                </tr>
                ` : ''}
                ${payload.notes ? `
                <tr style="border-bottom:1px solid #f1f5f9;">
                  <td style="padding:10px 0; font-size:13px; color:#64748b; font-weight:500;">Note</td>
                  <td align="right" style="padding:10px 0; font-size:14px; color:#0f172a; font-weight:500;">${payload.notes}</td>
                </tr>
                ` : ''}
              </table>

              <!-- Action Button -->
              <div style="text-align:center; margin:32px 0 20px 0;">
                <a href="${trackingUrl}" target="_blank" style="background-color:#0284c7; color:#ffffff; padding:14px 28px; text-decoration:none; border-radius:10px; font-weight:700; font-size:15px; display:inline-block; box-shadow: 0 4px 6px -1px rgba(2, 132, 199, 0.3);">
                  Suivre mon colis →
                </a>
              </div>

              <!-- Delivered Thank You Message (Appears strictly when status is DELIVERED) -->
              ${payload.newStatus === 'DELIVERED' ? `
              <div style="background-color:#ecfdf5; border:1px solid #a7f3d0; border-radius:12px; padding:20px; margin-top:24px; text-align:center;">
                <p style="font-size:14px; color:#065f46; font-weight:600; margin:0; line-height:1.6;">
                  Merci d’avoir choisi <strong>${storeNameText}</strong> pour votre livraison. Nous espérons que vous êtes satisfait(e) de notre service et nous serons ravis de vous accompagner à nouveau très prochainement. À bientôt !
                </p>
              </div>
              ` : ''}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f8fafc; padding:20px 32px; border-top:1px solid #e2e8f0; text-align:center;">
              <p style="font-size:12px; color:#94a3b8; margin:0; line-height:1.5;">
                Ceci est un message automatique envoyé par <strong>Trackflow</strong>.<br>
                Pour toute assistance, rendez-vous sur notre site.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
