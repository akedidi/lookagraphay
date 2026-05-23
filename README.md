# LookaGraphy

Site vitrine et boutique en ligne pour **LookaGraphy** — calligraphie arabe contemporaine (Next.js 14, MySQL, Stripe, Gmail API).

## Prérequis

- Node.js 18+
- MySQL (Hostinger ou local)
- Compte Stripe (mode test puis live)
- Compte Google Cloud avec Gmail API (emails transactionnels)

## Installation locale

```bash
npm install
cp .env.example .env.local
```

Renseigner `.env.local` (voir section Variables). Générer les secrets admin :

```bash
openssl rand -base64 24   # ADMIN_PASSWORD
openssl rand -base64 32   # ADMIN_SESSION_SECRET
openssl rand -base64 24   # HEALTH_CHECK_SECRET (optionnel en dev)
```

```bash
npm run dev          # http://localhost:5000
npm run check-secrets
```

Première utilisation : ouvrir `/admin`, se connecter avec `ADMIN_PASSWORD`, cliquer **Initialiser la base**.

## Variables d'environnement

| Variable | Obligatoire | Description |
|----------|-------------|-------------|
| `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | prod | MySQL |
| `NEXT_PUBLIC_SITE_URL` | oui | URL publique du site (sans slash final) |
| `ADMIN_PASSWORD` | prod | Mot de passe backoffice `/admin` |
| `ADMIN_SESSION_SECRET` | prod | Clé de signature cookie session (min. 16 car.) |
| `ADMIN_EMAIL` | oui | Destinataire alertes commandes |
| `PAYMENT_PROVIDER` | oui | `stripe` ou `paypal` |
| `STRIPE_SECRET_KEY` | si Stripe | Clé secrète Stripe |
| `STRIPE_WEBHOOK_SECRET` | si Stripe | Secret endpoint webhook |
| `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET`, `GMAIL_REFRESH_TOKEN`, `GMAIL_SENDER` | emails | Gmail API |
| `HEALTH_CHECK_SECRET` | prod | Protège `/api/health` |

Voir `.env.example` pour Gmail OAuth et PayPal.

## Données (source unique)

| Contenu | Source | Gestion |
|---------|--------|---------|
| Boutique `/store` | MySQL `store_items` | `/admin` → Store |
| Galerie `/galerie` | MySQL `store_items` où `in_galerie = 1` | `/admin` → Store (case « Afficher dans la galerie ») |
| Expositions, événements | MySQL | `/admin` |
| Commandes | MySQL `orders` | `/admin` → Commandes |
| Accueil (aperçus galerie) | API `/api/galerie` | Idem store |
| Artiste, ateliers, accueil (textes) | `lib/data.ts` | Édition code / déploiement |

La galerie et la boutique partagent les mêmes articles : un tableau peut être en vente **et** visible en galerie via `in_galerie`. Les bijoux peuvent rester boutique-only (`in_galerie = 0`).

`lib/data.ts` → `galerieData` sert uniquement de **repli** si la base est vide.

## Sécurité admin

- Authentification **serveur** : cookie httpOnly signé (HMAC), 7 jours
- `middleware.ts` + `requireAdmin()` sur les routes sensibles
- Routes protégées : mutations `/api/store`, `GET/PUT /api/orders`, `/api/admin/*`, mutations expositions/événements
- Routes publiques : `GET /api/store`, `POST /api/orders` (checkout), `GET /api/orders/[n°]?email=`

**Ne jamais** committer `ADMIN_PASSWORD` ni l'ancien mot de passe hardcodé. Exécuter `npm run check-secrets` avant chaque déploiement.

## Déploiement Hostinger

### 1. Build

```bash
npm ci
npm run build
npm run check-secrets
```

Démarrage prod : `npm start` (serveur standalone Next.js, port `PORT` ou 3000). Le dossier `.next/standalone` doit exister après le build.

Dans hPanel → **Websites → Node.js** (ou Git deploy), vérifier :

| Champ | Valeur |
|-------|--------|
| Build command | `npm run build` |
| Start command | `npm start` |
| Node version | 18 ou 20 |

**Ne pas** utiliser `next start` — le build produit un serveur standalone (`node .next/standalone/server.js` via `npm start`).

### 2. Variables hPanel

Dans **Advanced → Environment variables**, définir toutes les variables listées ci-dessus.

```
NEXT_PUBLIC_SITE_URL=https://blue-squirrel-716769.hostingersite.com
PAYMENT_PROVIDER=stripe
ADMIN_PASSWORD=<généré>
ADMIN_SESSION_SECRET=<généré>
HEALTH_CHECK_SECRET=<généré>
```

### 3. Base MySQL

1. Créer la base et l'utilisateur dans hPanel
2. Renseigner `DB_*`
3. `/admin` → **Initialiser la base**

### 4. Stripe

1. Dashboard Stripe → **Developers → Webhooks**
2. Endpoint : `https://VOTRE-DOMAINE/api/webhook`
3. Événement : `checkout.session.completed`
4. Signing secret → `STRIPE_WEBHOOK_SECRET`

Alias : `/api/webhooks/stripe` (même handler).

### 5. Gmail (emails commande)

1. Google Cloud → activer **Gmail API**
2. OAuth client **Application Web** → redirection : `{NEXT_PUBLIC_SITE_URL}/auth/google/callback`
3. Une fois : `https://VOTRE-DOMAINE/api/auth/gmail?key=VOTRE_GMAIL_OAUTH_SETUP_KEY`
4. Copier `GMAIL_REFRESH_TOKEN`, puis retirer `GMAIL_OAUTH_SETUP_KEY`

### 6. Santé

En production, `/api/health` renvoie 404 sans secret :

```bash
curl -H "x-health-secret: VOTRE_HEALTH_CHECK_SECRET" \
  https://VOTRE-DOMAINE/api/health
```

### 7. Cache LiteSpeed

Les en-têtes anti-cache HTML sont dans `next.config.js`.

## Scripts

| Commande | Rôle |
|----------|------|
| `npm run dev` | Dev sur port 5000 |
| `npm run build` | Build production |
| `npm start` | `node server.js` |
| `npm run check-secrets` | Détecte clés commitées par erreur |
