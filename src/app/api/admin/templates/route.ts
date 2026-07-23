import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const templateSchema = z.object({
  channel: z.enum(['EMAIL', 'SMS', 'WHATSAPP']),
  statusKey: z.enum([
    'PREPARATION',
    'SHIPPED',
    'IN_TRANSIT',
    'ARRIVED',
    'AVAILABLE',
    'DELIVERED',
    'DELAYED',
    'INCIDENT',
  ]),
  subject: z.string().optional(),
  bodyHtml: z.string().optional(),
  bodyText: z.string().min(1, 'Le corps du texte est requis'),
  isActive: z.boolean().optional().default(true),
});

export async function GET() {
  try {
    const templates = await prisma.notificationTemplate.findMany({
      orderBy: [{ channel: 'asc' }, { statusKey: 'asc' }, { version: 'desc' }],
    });
    return NextResponse.json(templates);
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la récupération des templates' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = templateSchema.parse(body);

    // Find current highest version for this channel and statusKey
    const lastTemplate = await prisma.notificationTemplate.findFirst({
      where: { channel: data.channel, statusKey: data.statusKey },
      orderBy: { version: 'desc' },
    });

    const newVersion = (lastTemplate?.version || 0) + 1;

    // Deactivate previous active templates for this channel + statusKey
    await prisma.notificationTemplate.updateMany({
      where: { channel: data.channel, statusKey: data.statusKey },
      data: { isActive: false },
    });

    // Create new versioned template
    const newTemplate = await prisma.notificationTemplate.create({
      data: {
        channel: data.channel,
        statusKey: data.statusKey,
        subject: data.subject,
        bodyHtml: data.bodyHtml,
        bodyText: data.bodyText,
        version: newVersion,
        isDefault: false,
        isActive: data.isActive,
      },
    });

    return NextResponse.json(newTemplate, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: (error as any).errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Erreur serveur lors de la création du template' }, { status: 500 });
  }
}
