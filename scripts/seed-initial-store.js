const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedInitialStore() {
  console.log('Seeding initial store and default admin user...');

  // 1. Create or find default Store
  let mainStore = await prisma.store.findUnique({
    where: { slug: 'trackflow-main' },
  });

  if (!mainStore) {
    mainStore = await prisma.store.create({
      data: {
        name: 'Trackflow Express Logistique',
        slug: 'trackflow-main',
        email: 'contact@trackflow.com',
        phone: '+224620000000',
        country: 'Guinée',
        managerName: 'Idiatou Bah',
        subscriptionPlan: 'PRO',
        subscriptionStatus: 'ACTIVE',
      },
    });
    console.log(`+ Boutique principale créée: ${mainStore.name} (${mainStore.id})`);
  }

  // 2. Create default Owner user
  const passwordHash = await bcrypt.hash('admin123', 10);

  let defaultOwner = await prisma.user.findUnique({
    where: { email: 'bahidiatou38@gmail.com' },
  });

  if (!defaultOwner) {
    defaultOwner = await prisma.user.create({
      data: {
        storeId: mainStore.id,
        email: 'bahidiatou38@gmail.com',
        name: 'Idiatou Bah',
        passwordHash,
        role: 'OWNER',
      },
    });
    console.log(`+ Compte Propriétaire créé: ${defaultOwner.email} (mdp: admin123)`);
  }

  // 3. Attach all existing packages without storeId to mainStore
  const updatedPackages = await prisma.package.updateMany({
    where: { storeId: null },
    data: { storeId: mainStore.id },
  });

  console.log(`+ ${updatedPackages.count} colis attachés à la boutique principale ${mainStore.name}.`);

  // 4. Attach all templates without storeId to mainStore
  const updatedTemplates = await prisma.notificationTemplate.updateMany({
    where: { storeId: null },
    data: { storeId: mainStore.id },
  });

  console.log(`+ ${updatedTemplates.count} templates attachés à la boutique principale.`);
}

seedInitialStore()
  .catch((err) => {
    console.error('Erreur lors du seed initial store:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
