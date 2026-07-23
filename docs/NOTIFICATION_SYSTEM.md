# Manuel du Système de Notifications Trackflow

Ce manuel détaille l'utilisation de l'interface d'administration des notifications, les variables dynamiques et la gestion des réessais.

---

## 1. Interface d'Administration (`/admin`)

L'interface `/admin` comporte trois onglets principaux :

### 1. 📦 Colis
Permet de créer et de gérer les colis.
* **Préférences de Notification Client :** Lors de la création d'un envoi, vous pouvez cocher/décocher les canaux autorisés (`Email`, `SMS`, `WhatsApp`).
* **Format Téléphone E.164 :** Saisissez les numéros au format international (ex: `+224620000000`, `+33612345678`).

### 2. 🔔 Notifications
Journal temps réel répertoriant tous les envois effectués et leur statut réel.
* **Badges de Statut :**
  * `Délivré` / `Envoyé` (Vert) : Notification transmise au destinataire.
  * `BOUNCED` / `UNDELIVERED` / `FAILED` (Rouge) : Échec de remise (survoler le badge pour lire le message d'erreur détaillé de l'opérateur).
  * `Ignoré` (Gris) : Notification sautée car le canal a été désactivé dans les préférences du client.
* **Bouton Renvoyer (Retry) :** Permet de relancer immédiatement un envoi échoué. La tentative est enregistrée et incrémente le compteur d'essais.

### 3. 📄 Templates DB
Permet d'éditer et de versionner les messages d'emails et de SMS envoyés aux clients.
* Cliquez sur **"Nouveau Template"** pour créer une nouvelle version d'un message.
* L'enregistrement en base de données active automatiquement la nouvelle version sans redémarrer le serveur.

---

## 2. Référence des Variables Dynamiques dans les Templates

Les variables suivantes sont automatiquement remplacées lors de l'envoi :

| Variable | Description | Exemple de rendu |
|---|---|---|
| `{{trackingNumber}}` | Numéro de suivi unique | `TRK-8X9A21` |
| `{{clientName}}` | Nom complet du client | `Mamadou Diallo` |
| `{{clientEmail}}` | Adresse email du client | `client@mail.com` |
| `{{clientPhone}}` | Téléphone au format E.164 | `+224620000000` |
| `{{newStatusLabel}}` | Libellé en français du nouveau statut | `En transit` |
| `{{previousStatusLabel}}` | Libellé du statut précédent | `Expédié` |
| `{{trackingUrl}}` | Lien sécurisé vers la page de suivi client | `https://trackflow.app/track/TRK-8X9A21` |
| `{{carrier}}` | Nom du transporteur | `DHL Express` |
| `{{destination}}` | Ville / Destination | `Conakry` |
| `{{weight}}` | Poids du colis en kilos | `3.5 kg` |
| `{{date}}` | Date de la mise à jour | `22 juillet 2026` |
| `{{time}}` | Heure de la mise à jour | `15:30` |

---

## 3. Webhooks & Cycle de Vie des Notifications

1. **Envoi initial :** Le processeur transmet le message à Resend ou Twilio et obtient un `providerMessageId` (ex: `re_12345` ou `SMxxxx`). La notification enregistrée porte le statut `SUCCESS` ou `PENDING`.
2. **Callback Webhook :** Lorsque l'opérateur réseau du destinataire confirme la remise réelle (ou le rejet) :
   - Resend appelle `/api/webhooks/resend`
   - Twilio appelle `/api/webhooks/twilio`
3. **Mise à jour en temps réel :** Le webhook recherche le log via `providerMessageId` et bascule le statut vers `DELIVERED`, `BOUNCED` ou `UNDELIVERED`.
