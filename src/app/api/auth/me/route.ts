import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    authenticated: true,
    user: {
      name: 'Idiatou Bah',
      email: 'bahidiatou38@gmail.com',
      role: 'OWNER',
    },
    store: {
      name: 'Trackflow Express Logistique',
      managerName: 'Idiatou Bah',
      email: 'contact@trackflow.com',
      phone: '+224620000000',
      country: 'Guinée',
    },
  });
}
