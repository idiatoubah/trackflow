import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Trackflow - Suivi de Colis & Convois',
  description: 'Plateforme moderne et intelligente de gestion et suivi de colis et convois.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="antialiased selection:bg-blue-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
