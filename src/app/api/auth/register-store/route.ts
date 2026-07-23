import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { hashPassword } from '@/lib/auth/password';
import { createSession } from '@/lib/auth/session';

const registerStoreSchema = z.object({
  storeName: z.string().min(2, 'Le nom de la boutique doit contenir au moins 2 caractères'),
  logoUrl: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Email de boutique invalide'),
  country: z.string().optional().default('Guinée'),
  managerName: z.string().min(2, 'Le nom du responsable est requis'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
});

function generateSlug(name: string): string {
  const clean = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
  return `${clean}-${Math.random().toString(36).substring(2, 6)}`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = registerStoreSchema.parse(body);

    // 1. Check if store email or user email already exists
    const existingStore = await prisma.store.findUnique({
      where: { email: data.email },
    });
    if (existingStore) {
      return NextResponse.json({ error: 'Une boutique avec cet email existe déjà' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existingUser) {
      return NextResponse.json({ error: 'Un utilisateur avec cet email existe déjà' }, { status: 400 });
    }

    // 2. Hash password & generate slug
    const passwordHash = await hashPassword(data.password);
    const slug = generateSlug(data.storeName);

    // 3. Create Store + User (OWNER) in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const store = await tx.store.create({
        data: {
          name: data.storeName,
          slug,
          logoUrl: data.logoUrl,
          address: data.address,
          phone: data.phone,
          email: data.email,
          country: data.country,
          managerName: data.managerName,
          subscriptionPlan: 'FREE',
          subscriptionStatus: 'ACTIVE',
        },
      });

      const user = await tx.user.create({
        data: {
          storeId: store.id,
          email: data.email,
          name: data.managerName,
          passwordHash,
          role: 'OWNER',
        },
      });

      // Seed default notification templates for the new store
      const defaultTemplates = [
        { channel: 'EMAIL', statusKey: 'PREPARATION', subject: 'Colis {{trackingNumber}} : En préparation', bodyText: 'Bonjour {{clientName}}, votre colis {{trackingNumber}} vers {{destination}} est en préparation. Suivi : {{trackingUrl}}' },
        { channel: 'EMAIL', statusKey: 'SHIPPED', subject: 'Colis {{trackingNumber}} : Expédié', bodyText: 'Bonjour {{clientName}}, votre colis {{trackingNumber}} vers {{destination}} a été expédié. Suivi : {{trackingUrl}}' },
        { channel: 'EMAIL', statusKey: 'IN_TRANSIT', subject: 'Colis {{trackingNumber}} : En transit', bodyText: 'Bonjour {{clientName}}, votre colis {{trackingNumber}} vers {{destination}} est actuellement en transit. Suivi : {{trackingUrl}}' },
        { channel: 'EMAIL', statusKey: 'DELIVERED', subject: 'Colis {{trackingNumber}} : Livré', bodyText: 'Bonjour {{clientName}}, votre colis {{trackingNumber}} vers {{destination}} a été livré avec succès. Suivi : {{trackingUrl}}' },
        { channel: 'SMS', statusKey: 'PREPARATION', bodyText: 'Trackflow: Votre colis {{trackingNumber}} est en préparation. Suivi: {{trackingUrl}}' },
        { channel: 'SMS', statusKey: 'IN_TRANSIT', bodyText: 'Trackflow: Votre colis {{trackingNumber}} est en transit vers {{destination}}. Suivi: {{trackingUrl}}' },
        { channel: 'WHATSAPP', statusKey: 'PREPARATION', bodyText: 'Bonjour {{clientName}}, votre colis {{trackingNumber}} est : EN PRÉPARATION. Suivi : {{trackingUrl}}' },
        { channel: 'WHATSAPP', statusKey: 'IN_TRANSIT', bodyText: 'Bonjour {{clientName}}, votre colis {{trackingNumber}} est : EN TRANSIT vers {{destination}}. Suivi : {{trackingUrl}}' },
      ];

      for (const t of defaultTemplates) {
        await tx.notificationTemplate.create({
          data: {
            storeId: store.id,
            channel: t.channel,
            statusKey: t.statusKey,
            subject: t.subject || null,
            bodyText: t.bodyText,
          },
        });
      }

      return { store, user };
    });

    // 4. Create Session Cookie
    await createSession({
      userId: result.user.id,
      storeId: result.store.id,
      email: result.user.email,
      role: result.user.role,
      name: result.user.name,
      storeName: result.store.name,
      storeSlug: result.store.slug,
    });

    return NextResponse.json({
      success: true,
      store: result.store,
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        role: result.user.role,
      },
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: (error as any).errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Erreur lors de la création de la boutique' }, { status: 500 });
  }
}
