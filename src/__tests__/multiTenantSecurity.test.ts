import { describe, it, expect, beforeAll } from 'vitest';
import { prisma } from '@/lib/prisma';
import { hashPassword, comparePassword } from '@/lib/auth/password';

describe('Multi-Tenant Security & Store Isolation Tests', () => {
  let storeA: any;
  let storeB: any;
  let ownerA: any;
  let packageA: any;

  beforeAll(async () => {
    // 1. Create Store A
    storeA = await prisma.store.create({
      data: {
        name: 'Boutique Alpha Express',
        slug: `alpha-${Date.now()}`,
        email: `alpha_${Date.now()}@store.com`,
        phone: '+224620000001',
        country: 'Guinée',
        managerName: 'Gérant Alpha',
      },
    });

    // 2. Create Store B
    storeB = await prisma.store.create({
      data: {
        name: 'Boutique Beta Cargo',
        slug: `beta-${Date.now()}`,
        email: `beta_${Date.now()}@store.com`,
        phone: '+33600000002',
        country: 'France',
        managerName: 'Gérant Beta',
      },
    });

    // 3. Create Owner for Store A
    const passwordHash = await hashPassword('Secret123!');
    ownerA = await prisma.user.create({
      data: {
        storeId: storeA.id,
        email: `owner_alpha_${Date.now()}@store.com`,
        name: 'Propriétaire Alpha',
        passwordHash,
        role: 'OWNER',
      },
    });

    // 4. Create Package for Store A
    packageA = await prisma.package.create({
      data: {
        storeId: storeA.id,
        trackingNumber: `TRK-ALPHA-${Date.now()}`,
        clientEmail: 'client.alpha@gmail.com',
        clientName: 'Client Alpha',
        destination: 'Conakry',
      },
    });
  });

  it('devrait créer deux boutiques distinctes et isolées', () => {
    expect(storeA.id).toBeDefined();
    expect(storeB.id).toBeDefined();
    expect(storeA.id).not.toBe(storeB.id);
  });

  it('devrait sécuriser les mots de passe avec le hachage bcrypt', async () => {
    expect(ownerA.passwordHash).not.toBe('Secret123!');
    const isValid = await comparePassword('Secret123!', ownerA.passwordHash);
    expect(isValid).toBe(true);

    const isInvalid = await comparePassword('WrongPassword', ownerA.passwordHash);
    expect(isInvalid).toBe(false);
  });

  it('ne devrait jamais renvoyer les colis de la Boutique A lors d\'une requête filtrée sur la Boutique B', async () => {
    const packagesStoreB = await prisma.package.findMany({
      where: { storeId: storeB.id },
    });

    const foundPackageInB = packagesStoreB.find((p) => p.id === packageA.id);
    expect(foundPackageInB).toBeUndefined();
  });

  it('devrait isoler les employés strictement au sein de leur boutique', async () => {
    const employeeA = await prisma.user.create({
      data: {
        storeId: storeA.id,
        email: `agent_alpha_${Date.now()}@store.com`,
        name: 'Agent Alpha 1',
        passwordHash: await hashPassword('AgentPass123'),
        role: 'AGENT',
      },
    });

    const employeesStoreB = await prisma.user.findMany({
      where: { storeId: storeB.id },
    });

    expect(employeesStoreB.some((u) => u.id === employeeA.id)).toBe(false);
  });
});
