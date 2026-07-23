import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DEFAULT_TEMPLATES = [
  {
    channel: 'EMAIL',
    statusKey: 'PREPARATION',
    subject: '[Trackflow] Votre colis {{trackingNumber}} est en préparation',
    bodyText: 'Bonjour {{clientName}}, votre colis {{trackingNumber}} est en cours de préparation. Suivez-le sur : {{trackingUrl}}',
    bodyHtml: `<div style="font-family:sans-serif; padding:20px; color:#333;"><h2 style="color:#0284c7;">Trackflow - Colis En Préparation</h2><p>Bonjour <strong>{{clientName}}</strong>,</p><p>Votre colis <strong>{{trackingNumber}}</strong> est en cours d'emballage.</p><p><a href="{{trackingUrl}}" style="background-color:#0284c7; color:#fff; padding:10px 20px; text-decoration:none; border-radius:6px;">Suivre mon colis</a></p></div>`,
  },
  {
    channel: 'EMAIL',
    statusKey: 'SHIPPED',
    subject: '[Trackflow] Votre colis {{trackingNumber}} a été expédié !',
    bodyText: 'Bonjour {{clientName}}, votre colis {{trackingNumber}} a été expédié. Suivez-le sur : {{trackingUrl}}',
    bodyHtml: `<div style="font-family:sans-serif; padding:20px; color:#333;"><h2 style="color:#2563eb;">Trackflow - Colis Expédié</h2><p>Bonjour <strong>{{clientName}}</strong>,</p><p>Votre colis <strong>{{trackingNumber}}</strong> a été remis au transporteur <strong>{{carrier}}</strong>.</p><p><a href="{{trackingUrl}}" style="background-color:#2563eb; color:#fff; padding:10px 20px; text-decoration:none; border-radius:6px;">Suivre mon colis</a></p></div>`,
  },
  {
    channel: 'SMS',
    statusKey: 'PREPARATION',
    bodyText: 'Bonjour {{clientName}}, votre colis {{trackingNumber}} est en préparation. Suivi : {{trackingUrl}}',
  },
  {
    channel: 'SMS',
    statusKey: 'SHIPPED',
    bodyText: 'Bonjour {{clientName}}, votre colis {{trackingNumber}} est EXPÉDIÉ. Suivi : {{trackingUrl}}',
  },
  {
    channel: 'SMS',
    statusKey: 'DELIVERED',
    bodyText: 'Bonjour {{clientName}}, votre colis {{trackingNumber}} a été LIVRÉ avec succès ! Merci d\'utiliser Trackflow.',
  },
];

async function main() {
  console.log('Seeding notification templates...');

  for (const t of DEFAULT_TEMPLATES) {
    const existing = await prisma.notificationTemplate.findFirst({
      where: { channel: t.channel, statusKey: t.statusKey },
    });

    if (!existing) {
      await prisma.notificationTemplate.create({
        data: {
          channel: t.channel,
          statusKey: t.statusKey,
          subject: t.subject || null,
          bodyHtml: t.bodyHtml || null,
          bodyText: t.bodyText,
          version: 1,
          isDefault: true,
          isActive: true,
        },
      });
      console.log(`Created default template for ${t.channel}:${t.statusKey}`);
    }
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
