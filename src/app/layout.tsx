import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Trackflow - Suivi de Colis',
  description: 'Suivez facilement l\'état de votre livraison avec Trackflow.',
  themeColor: '#2563eb',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
