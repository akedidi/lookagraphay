# Déploiement Hostinger (Node.js Web App)

## Réglages hPanel (Build & Deploy)

| Champ | Valeur |
|--------|--------|
| **Install** | `npm ci` ou `npm install` |
| **Build** | `npm run build` |
| **Start** | `npm start` |
| **Node.js** | 20 |
| **Répertoire de sortie / Output directory** | **Laisser vide** ou racine du projet — **pas** `.next` seul |
| **Fichier d’entrée / Entry file** | `server.js` (racine) **ou** laisser vide si Start = `npm start` — **ne pas** lancer en parallèle `.next/standalone/server.js` |

**Important :** l’ancien `standalone/server.js` généré par Next plante sous LiteSpeed (`listen()` appelé plusieurs fois). Le postbuild le remplace automatiquement.

Ne pas utiliser `npm run start -- -p $PORT` : le port est déjà fourni par la variable d’environnement `PORT`.

## MySQL (boutique vide / erreur store)

| Variable hPanel | Valeur |
|-----------------|--------|
| `DB_HOST` | **`localhost`** ou `127.0.0.1` — pas `srv….hstgr.io` (hôte phpMyAdmin distant) |
| `DB_NAME`, `DB_USER`, `DB_PASSWORD` | Identiques à phpMyAdmin |

Test : `https://votre-domaine/api/db-ping` → `ok: true` et `store_count` > 0.

**Init DB** (admin) : crée les tables et n’insère les données démo **que si** les tables sont vides — ne supprime pas un catalogue existant.

## Après déploiement

1. Vérifier les logs **au démarrage** (pas seulement le build) :
   - `[lookagraphy] Next standalone | Node …`
   - puis `✓ Starting...` puis **`✓ Ready in …ms`**
   - Si vous voyez seulement `▲ Next.js` sans `[lookagraphy]`, le mauvais fichier est lancé ou le deploy est ancien.
2. Tester : `https://votre-domaine/api/ping` → `{"status":"ok",...}`

## Si les logs affichent `Gate | flock` ou `Instance déjà active (flock)`

**Mauvais runtime** — ce n’est pas le code actuel (`lookagraphy-lock-v4`). Un ancien déploiement tourne encore.

1. hPanel → **Stop** l’app Node, attendre 30 s.
2. Vérifier que le **dernier build** affiche : `Patched standalone/server.js (lookagraphy-lock-v4)`.
3. **Start** (ou redeploy depuis Git `main`).
4. Logs attendus au démarrage :
   - `[lookagraphy] lookagraphy-lock-v4 | instance principale | …`
   - puis **`✓ Ready`**
   - **pas** `Gate | flock`.

Si le site marche au début du deploy puis **503** : le worker qui tenait flock/Next s’est arrêté et les nouveaux workers sortent sans démarrer Next.

## Si vous voyez plusieurs `✓ Ready` ou `Une instance tourne déjà`

LiteSpeed lance plusieurs workers Node. Un seul doit démarrer le serveur (fichier `.lookagraphy.pid.lock` dans `standalone/`). Les autres restent en attente — c’est normal.

Après le dernier correctif, vous ne devriez voir **qu’un seul** `✓ Ready` par redémarrage.

## Si 503 malgré `✓ Ready`

1. Tester `/api/ping` — si ça répond, le souci vient du cache LiteSpeed ou des assets.
2. **Redémarrer** l’app une fois dans hPanel.
3. L’URL `Network: …extapp-sock…` dans les logs est **normale** chez Hostinger (proxy socket) ; ce qui compte est `✓ Ready`.

## Variables d’environnement

Configurer en production : `DB_*`, `ADMIN_PASSWORD`, `STRIPE_*`, `GMAIL_*`, `NEXT_PUBLIC_SITE_URL`, etc. (voir `.env.example`).
