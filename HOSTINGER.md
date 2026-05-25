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

## Redémarrer Node sur Hostinger (pas de bouton Stop)

Hostinger **n’a pas** de bouton « Stop » / « Delete » pour une app Node.js seule. Ne supprimez **pas** tout le site sauf si vous voulez tout effacer (irréversible).

Pour **forcer un nouveau démarrage** après un deploy Git :

1. **Redeploy** / **Rebuild** depuis hPanel (Websites → votre site → Node.js → Deploy / Redeploy).
2. Ou pousser un **commit vide** sur `main` pour déclencher le pipeline auto.
3. Ou modifier une variable d’environnement (ex. ajouter `DEPLOY_TS=1`), **Save** — souvent ça relance les workers.
4. Attendre la fin du **build** (`lookagraphy-lock-v4` dans les logs build), puis ouvrir les logs **runtime**.

## Dossier réellement exécuté par LiteSpeed

Hostinger lance l’app via **Passenger** depuis :

`~/domains/VOTRE-SITE.hostingersite.com/nodejs/`

(voir `public_html/.htaccess` : `PassengerAppRoot …/nodejs`)

À chaque **`npm run build`**, le **postbuild** copie automatiquement `.next/standalone/` vers le dossier **`nodejs/`** (runtime Passenger) et écrit `nodejs/tmp/restart.txt` pour relancer l’app.

Dans les **logs de build** Hostinger, vous devez voir :

```
[postbuild] Sync standalone → /home/…/domains/…/nodejs
[postbuild]   → nodejs/server.js
[postbuild]   → nodejs/.next
[postbuild]   → nodejs/tmp/restart.txt (redémarrage Passenger)
```

Si la sync est absente, le build tourne peut‑être hors de `public_html/` : ajoutez dans hPanel une variable d’environnement :

`HOSTINGER_NODEJS_DIR` = `/home/u376353647/domains/VOTRE-SITE.hostingersite.com/nodejs`

(ajustez le chemin exact affiché dans File Manager).

Sync manuelle après build (SSH) : `npm run sync:nodejs` depuis `public_html/`.

**Patch actuel : `lookagraphy-passenger-v5`** — pas de verrou PID (Passenger gère l’instance ; un lock provoquait 503/504).

Logs attendus :

```
[lookagraphy] lookagraphy-passenger-v5 | Node v20… | PORT=3000
✓ Ready in …ms
```

**Pas** `Gate | flock` ni `Worker secondaire — exit`.

**SSH** (port `65002`, user `u376353647`) — depuis votre Mac, **avec votre mot de passe SSH** :

```bash
ssh -p 65002 u376353647@82.29.191.162 'sh -s' < scripts/hostinger-ssh-fix.sh
```

Le script cherche le projet, supprime les verrous flock/PID obsolètes, affiche le patch `server.js` et les processus sur le port 3000. Puis **Redeploy** depuis hPanel.

Mot de passe : ne le collez pas dans le chat ; saisissez-le uniquement dans le terminal quand SSH le demande.

## Si les logs affichent `Gate | flock` ou `Instance déjà active (flock)`

**Mauvais runtime** — ce n’est pas le code actuel (`lookagraphy-lock-v4`). Un ancien `server.js` ou des workers zombies tournent encore.

1. **Redeploy** complet depuis Git `main` (voir ci-dessus — pas de Stop).
2. Vérifier le log **build** : `Patched standalone/server.js (lookagraphy-lock-v4)`.
3. Logs **runtime** attendus :
   - `[lookagraphy] lookagraphy-lock-v4 | instance principale | …`
   - puis **`✓ Ready`**
   - **pas** `Gate | flock`.

Si le site marche au début du deploy puis **503** : le worker qui tenait flock/Next s’est arrêté ; les nouveaux workers sortent sans démarrer Next → redeploy + suppression des fichiers `.lock` si possible.

## Si vous voyez plusieurs `✓ Ready` ou `Une instance tourne déjà`

LiteSpeed lance plusieurs workers Node. Un seul doit démarrer le serveur (fichier `.lookagraphy.pid.lock` dans `standalone/`). Les autres restent en attente — c’est normal.

Après le dernier correctif, vous ne devriez voir **qu’un seul** `✓ Ready` par redémarrage.

## 504 Gateway Timeout sur `/api/ping`

Cause fréquente avec **v4** : les workers LiteSpeed **secondaires** restaient vivants (`setInterval`) sans servir HTTP — Passenger leur envoyait les requêtes → timeout.

**Correctif** (dans `postbuild` v4+) : les secondaires font `process.exit(0)`. Puis sur le serveur :

```bash
touch ~/domains/VOTRE-SITE.hostingersite.com/nodejs/tmp/restart.txt
```

Si **503** après ça : verrou PID obsolète ou processus Next orphelin — en SSH :

```bash
kill $(cat ~/domains/.../nodejs/.lookagraphy.pid.lock) 2>/dev/null
rm -f ~/domains/.../nodejs/.lookagraphy.pid.lock
touch ~/domains/.../nodejs/tmp/restart.txt
```

## Si 503 malgré `✓ Ready`

1. Tester `/api/ping` — si ça répond, le souci vient du cache LiteSpeed ou des assets.
2. **Redeploy** (Hostinger n’a pas de bouton Stop dédié Node).
3. L’URL `Network: …extapp-sock…` dans les logs est **normale** chez Hostinger (proxy socket) ; ce qui compte est `✓ Ready`.

## Variables d’environnement

Configurer en production : `DB_*`, `ADMIN_PASSWORD`, `STRIPE_*`, `GMAIL_*`, `NEXT_PUBLIC_SITE_URL`, etc. (voir `.env.example`).
