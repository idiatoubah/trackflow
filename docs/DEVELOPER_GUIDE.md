# Guide Développeur Trackflow - Notifications & Événements

Ce guide est destiné aux développeurs travaillant sur le projet **Trackflow**.

---

## 1. Installation et Configuration

### Prérequis
- Node.js v18 ou supérieur
- npm ou bun

### Étapes d'installation

1. **Cloner et installer les dépendances :**
   ```bash
   npm install
   ```

2. **Variables d'environnement (`.env.local` / `.env`) :**
   ```env
   # Email Provider (Resend)
   RESEND_API_KEY="re_..."
   NOTIFICATION_EMAIL_FROM="Trackflow <notifications@votre-domaine.com>"

   # SMS Provider (Twilio)
   TWILIO_ACCOUNT_SID="AC..."
   TWILIO_AUTH_TOKEN="..."
   TWILIO_PHONE_NUMBER="+1..."

   # Simulation Mode (Mettre à 'false' pour activer les vraies clés API)
   NOTIFICATION_SIMULATION_MODE="true"

   # URL de l'application
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

3. **Synchroniser la base de données et lancer le Seed des templates :**
   ```bash
   npx prisma db push
   npx tsx prisma/seed.ts
   ```

4. **Lancer le serveur de développement :**
   ```bash
   npm run dev
   ```

---

## 2. Exécution des Tests Automatisés

Le projet contient une suite de tests unitaires et d'intégration couvrant l'EventBus, la validation E.164, le moteur de templates et l'idempotence.

Pour exécuter les tests :
```bash
npm test
```

---

## 3. Guide Pas à Pas : Ajouter un Nouveau Fournisseur (ex: Telegram / Push)

Grâce à l'architecture découplée **Provider Pattern** et **EventBus**, ajouter un nouveau fournisseur ne nécessite que 3 étapes simples :

### Étape 1 : Créer la classe du Provider
Créer un fichier `src/lib/notifications/providers/telegram/telegramProvider.ts` implémentant `INotificationProvider` :

```typescript
import { INotificationProvider, NotificationResult, SendNotificationOptions } from '../../types';

export class TelegramProvider implements INotificationProvider {
  name = 'TELEGRAM';
  channel: 'SMS' | 'EMAIL' | 'WHATSAPP' = 'SMS'; // ou nouveau canal

  async send(options: SendNotificationOptions): Promise<NotificationResult> {
    const startTime = Date.now();
    try {
      // Logique d'appel API Telegram Bot API
      const res = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: options.recipient,
          text: options.bodyText,
        }),
      });

      const data = await res.json();
      return {
        success: res.ok,
        provider: this.name,
        providerMessageId: data?.result?.message_id?.toString(),
        responseTimeMs: Date.now() - startTime,
        status: res.ok ? 'SUCCESS' : 'FAILED',
      };
    } catch (err: any) {
      return {
        success: false,
        provider: this.name,
        errorMessage: err.message,
        responseTimeMs: Date.now() - startTime,
        status: 'FAILED',
      };
    }
  }
}
```

### Étape 2 : Instancier le Provider dans `NotificationQueue`
Dans `src/lib/notifications/queue.ts`, instancier votre nouveau provider et l'appeler pour le canal désiré.

### Étape 3 : (Optionnel) S'abonner à un nouvel événement
Si le nouveau canal doit réagir à de nouveaux événements, s'abonner simplement via `eventBus.subscribe('NONT_EVENT', handler)` dans `src/lib/notifications/subscribers.ts`. Aucun impact sur le reste de l'application !
