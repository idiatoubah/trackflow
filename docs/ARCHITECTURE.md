# Architecture du Système de Notifications Automatiques Trackflow

Ce document décrit l'architecture technique, les principes de conception et les flux de données du système de notifications automatique de Trackflow.

---

## 1. Principes Fondamentaux de Conception

1. **Architecture Event-Driven (`EventBus`)** :
   Le domaine métier (gestion des colis et événements de statut) ne dépend pas des services de notification. Lors de la création d'un colis ou d'un changement de statut, un événement domaine (`PACKAGE_CREATED`, `PACKAGE_STATUS_CHANGED`) est publié sur l'EventBus.
   
2. **Couche d'Abstraction Provider Pattern (`INotificationProvider`)** :
   Les fournisseurs externalisés (Resend pour l'Email, Twilio pour les SMS, Meta Cloud API pour WhatsApp) sont tous masqués derrière une interface TypeScript commune.

3. **Templates Versionnés en Base de Données (`NotificationTemplate`)** :
   Le contenu des messages n'est plus codé en dur. Les templates sont stockés en base de données avec gestion des versions et d'activations à chaud depuis l'Administration.

4. **Idempotence Stricte (`idempotencyKey`)** :
   Chaque envoi génère une clé d'idempotence unique (`${packageId}_${newStatus}_${channel}`). Cela empêche tout envoi en double en cas de réémission d'événement, de double-clic ou de webhooks dupliqués.

5. **Exécution Asynchrone & Non-Bloquante (`NotificationQueue`)** :
   L'envoi s'effectue dans un processeur de queue asynchrone sans ralentir l'exécution HTTP de l'API utilisateur ou d'administration.

---

## 2. Diagramme des Flux d'Événements

```
[ API POST /api/packages ou /events ]
                 │
                 ▼
     [ Publication EventBus ] ◄── (Événement domaine métier)
                 │
                 ▼
   [ Subscriber Notification ]
                 │
                 ▼
  [ Idempotence Key Check (DB) ] ──(Déjà envoyé ?)──► [ Annulé / Ignoré ]
                 │ (Non)
                 ▼
    [ TemplateEngine (DB/Code) ]
                 │
                 ▼
     [ Validation E.164 & Email ] ──(Invalide ?)─────► [ Log FAILED/SKIPPED ]
                 │ (Valide)
                 ▼
     [ NotificationQueue Worker ]
                 │
      ┌──────────┴──────────┐
      ▼                     ▼
Resend Email           Twilio SMS
  Provider              Provider
      │                     │
      └──────────┬──────────┘
                 ▼
      [ Enregistrement DB Log ]
                 │
                 ▼
   [ Callback Webhooks Provider ] ──► [ Update Log: DELIVERED/BOUNCED ]
```

---

## 3. Schéma de Base de Données (`prisma/schema.prisma`)

### Modèle `NotificationLog`
| Champ | Type | Description |
|---|---|---|
| `id` | String (UUID) | Identifiant unique du log |
| `idempotencyKey` | String (Unique) | Clé d'idempotence unique `${packageId}_${status}_${channel}` |
| `trackingNumber` | String | Numéro de suivi du colis |
| `packageId` | String | Référence vers le colis |
| `type` | String | Canal : `EMAIL`, `SMS`, `WHATSAPP` |
| `recipient` | String | Destinataire (Email ou téléphone E.164) |
| `provider` | String | Nom du fournisseur (`RESEND`, `TWILIO`, `CONSOLE_EMAIL`, etc.) |
| `providerMessageId`| String | ID unique renvoyé par le fournisseur |
| `status` | String | Statut : `PENDING`, `SUCCESS`, `DELIVERED`, `FAILED`, `BOUNCED`, `UNDELIVERED`, `SKIPPED` |
| `responseTimeMs` | Int | Temps de réponse du fournisseur en millisecondes |
| `attempts` | Int | Nombre de tentatives d'envoi effectuées |

### Modèle `NotificationTemplate`
| Champ | Type | Description |
|---|---|---|
| `id` | String (UUID) | Identifiant unique du template |
| `channel` | String | `EMAIL`, `SMS`, `WHATSAPP` |
| `statusKey` | String | Statut colis concerné (`PREPARATION`, `SHIPPED`, `IN_TRANSIT`, etc.) |
| `subject` | String? | Sujet pour les emails |
| `bodyText` | String | Message texte avec variables `{{...}}` |
| `bodyHtml` | String? | HTML avec variables pour les emails |
| `version` | Int | Numéro de version (ex: 1, 2, 3) |
| `isActive` | Boolean | Indique si cette version est active |
