# Déploiement Hostinger (Node.js Web App)

## Réglages hPanel (Build & Deploy)

| Champ | Valeur |
|--------|--------|
| **Install** | `npm ci` ou `npm install` |
| **Build** | `npm run build` |
| **Start** | `npm start` |
| **Node.js** | 20 |
| **Répertoire de sortie / Output directory** | **Laisser vide** ou racine du projet — **pas** `.next` seul |
| **Fichier d’entrée / Entry file** | **Vide** (utiliser `package.json` → `npm start`) — **pas** `.next/standalone/server.js` seul |

Ne pas utiliser `npm run start -- -p $PORT` : le port est déjà fourni par la variable d’environnement `PORT`.

## Après déploiement

1. Vérifier les logs : vous devez voir `[lookagraphy] PORT= …` puis **`✓ Ready`** (pas seulement `✓ Starting...`).
2. Tester : `https://votre-domaine/api/ping` → `{"status":"ok",...}`

## Si 503 ou boucle « Starting... »

- **Redéployer** après le dernier commit (patch `HOSTNAME` LiteSpeed).
- Dans les logs, si **Network** affiche `extapp-sock` sans ligne `[lookagraphy]`, le **Start command** n’est pas `npm start` → corriger dans hPanel.
- **Redémarrer** l’app (bouton Restart) sans rebuild complet si le build est déjà OK.

## Variables d’environnement

Configurer en production : `DB_*`, `ADMIN_PASSWORD`, `STRIPE_*`, `GMAIL_*`, `NEXT_PUBLIC_SITE_URL`, etc. (voir `.env.example`).
