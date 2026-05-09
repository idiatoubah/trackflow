import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{ textAlign: 'center', marginTop: '10vh', padding: '2rem' }}>
      <h1 style={{ fontSize: '4rem', color: 'var(--color-primary)', marginBottom: '1rem' }}>404</h1>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Colis introuvable</h2>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
        Le numéro de suivi indiqué n'existe pas ou le colis a été supprimé.
      </p>
      <Link href="/" className="btn btn-primary">
        Retour à l'accueil
      </Link>
    </div>
  );
}
