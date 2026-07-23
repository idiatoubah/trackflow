import { describe, it, expect } from 'vitest';
import { TemplateEngine } from '../lib/notifications/templates/engine';
import { PackageNotificationPayload } from '../lib/notifications/types';

describe('TemplateEngine - Interpolation & Thank You Message', () => {
  it('doit interpoler correctement les variables dynamiques', async () => {
    const payload: PackageNotificationPayload = {
      packageId: 'pkg_999',
      trackingNumber: 'TRK-999',
      clientName: 'Mamadou Diallo',
      clientEmail: 'mamadou@example.com',
      clientPhone: '+224620000000',
      previousStatus: 'PREPARATION',
      newStatus: 'IN_TRANSIT',
      carrier: 'DHL',
      destination: 'Conakry',
      weight: 4.5,
    };

    const rendered = await TemplateEngine.render('SMS', payload);

    expect(rendered.bodyText).toContain('Mamadou Diallo');
    expect(rendered.bodyText).toContain('TRK-999');
    expect(rendered.bodyText).toContain('EN TRANSIT');
  });

  it('doit générer un sujet et corps HTML valide pour le canal EMAIL', async () => {
    const payload: PackageNotificationPayload = {
      packageId: 'pkg_100',
      trackingNumber: 'TRK-100',
      clientEmail: 'client@example.com',
      newStatus: 'SHIPPED',
    };

    const rendered = await TemplateEngine.render('EMAIL', payload);

    expect(rendered.subject).toBeDefined();
    expect(rendered.subject).toContain('TRK-100');
    expect(rendered.bodyHtml).toBeDefined();
    expect(rendered.bodyHtml).toContain('Expédié');
    expect(rendered.bodyHtml).not.toContain('Merci d’avoir choisi');
  });

  it('doit ajouter automatiquement le message de remerciement et le nom de boutique uniquement lors du statut DELIVERED', async () => {
    const payload: PackageNotificationPayload = {
      packageId: 'pkg_delivered',
      trackingNumber: 'TRK-DELIVERED-001',
      clientName: 'Fatima Bah',
      clientEmail: 'fatima@example.com',
      storeName: 'Express Guinean Cargo',
      newStatus: 'DELIVERED',
    };

    const rendered = await TemplateEngine.render('EMAIL', payload);

    expect(rendered.bodyHtml).toBeDefined();
    expect(rendered.bodyHtml).toContain('Merci d’avoir choisi');
    expect(rendered.bodyHtml).toContain('Express Guinean Cargo');
    expect(rendered.bodyHtml).toContain('Nous espérons que vous êtes satisfait(e) de notre service');
  });
});
