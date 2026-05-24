# Déploiement Hostinger (Node.js Web App)

## Réglages hPanel (Build & Deploy)

| Champ | Valeur |
|--------|--------|
| **Install** | `npm ci` ou `npm install` |
| **Build** | `npm run build` |
| **Start** | `npm start` |
| **Node.js** | 20 |
| **Répertoire de sortie / Output directory** | **Laisser vide** ou racine du projet — **pas** `.next` seul |
| **Fichier d’entrée / Entry file** | `server.js` (racine) **ou** `.next/standalone/server.js` (wrapper postbuild) — les deux fonctionnent après build |

**Important :** l’ancien `standalone/server.js` généré par Next plante sous LiteSpeed (`listen()` appelé plusieurs fois). Le postbuild le remplace automatiquement.

Ne pas utiliser `npm run start -- -p $PORT` : le port est déjà fourni par la variable d’environnement `PORT`.

## Après déploiement

1. Vérifier les logs **au démarrage** (pas seulement le build) :
   - `[lookagraphy] Next standalone | Node …`
   - puis `✓ Starting...` puis **`✓ Ready in …ms`**
   - Si vous voyez seulement `▲ Next.js` sans `[lookagraphy]`, le mauvais fichier est lancé ou le deploy est ancien.
2. Tester : `https://votre-domaine/api/ping` → `{"status":"ok",...}`

## Si vous voyez plusieurs `✓ Ready` ou `Une instance tourne déjà`

LiteSpeed lance plusieurs workers Node. Un seul doit démarrer le serveur (dossier `.lookagraphy.lock.d` dans `standalone/`). Les autres restent en attente — c’est normal.

Après le dernier correctif, vous ne devriez voir **qu’un seul** `✓ Ready` par redémarrage.

## Si 503 malgré `✓ Ready`

1. Tester `/api/ping` — si ça répond, le souci vient du cache LiteSpeed ou des assets.
2. **Redémarrer** l’app une fois dans hPanel.
3. L’URL `Network: …extapp-sock…` dans les logs est **normale** chez Hostinger (proxy socket) ; ce qui compte est `✓ Ready`.

## Variables d’environnement

Configurer en production : `DB_*`, `ADMIN_PASSWORD`, `STRIPE_*`, `GMAIL_*`, `NEXT_PUBLIC_SITE_URL`, etc. (voir `.env.example`).
