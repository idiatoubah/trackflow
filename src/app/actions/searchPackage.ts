"use server"
import { prisma } from '@/lib/prisma';

export async function searchPackage(query: string) {
  if (!query || query.trim() === '') {
    return { error: 'Veuillez entrer une recherche valide.' };
  }

  const cleanQuery = query.trim();

  // Search by tracking number first
  let pkg = await prisma.package.findUnique({
    where: { trackingNumber: cleanQuery.toUpperCase() }
  });

  // If not found, search by email
  if (!pkg) {
    pkg = await prisma.package.findFirst({
      where: { clientEmail: { equals: cleanQuery, mode: 'insensitive' } },
      orderBy: { createdAt: 'desc' }
    });
  }

  // If not found, search by phone
  if (!pkg) {
    pkg = await prisma.package.findFirst({
      where: { clientPhone: cleanQuery },
      orderBy: { createdAt: 'desc' }
    });
  }

  if (!pkg) {
    return { error: 'Aucun colis trouvé avec ces informations.' };
  }

  return { trackingNumber: pkg.trackingNumber };
}
