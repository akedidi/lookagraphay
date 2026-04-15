# LookaGraphy — Site vitrine premium de calligraphie arabe/japonaise

## Description
Site vitrine premium pour **LookaGraphy**, calligraphe Looka (Paris). Identité double arabo-française et japonaise, fusion calligraphique unique. Site haut de gamme, artistique et immersif : portfolio d'artiste, galerie d'art, boutique, ateliers.

## Stack technique
- **Next.js 14** (App Router)
- **React 18** (composants client)
- **Tailwind CSS v4** (avec `@tailwindcss/postcss`)
- **Framer Motion v12** (animations légères)
- **TypeScript**
- **MySQL2** (connexion à la DB Hostinger)

## Structure du projet
```
app/
  layout.tsx          — Layout global (utilise SiteShell pour isoler /admin)
  globals.css         — Styles globaux, variables CSS, animations
  page.tsx            — Accueil (hero vidéo, sections)
  artiste/page.tsx    — L'Artiste (biographie, démarche, inspirations)
  ateliers/page.tsx   — Ateliers semestriels avec paiement PayPal
  expositions/page.tsx — Expositions (dynamique, fetch /api/expositions)
  evenements/page.tsx  — Événements (dynamique, fetch /api/evenements)
  galerie/page.tsx    — Galerie d'œuvres avec filtre + modal
  store/page.tsx      — Store (dynamique, fetch /api/store)
  contact/page.tsx    — Formulaire de contact
  mentions-legales/page.tsx — Mentions légales
  admin/
    layout.tsx        — Layout isolé sans Navbar/Footer
    page.tsx          — Backoffice admin (login admin/mayyacine31, localStorage)
  api/
    store/route.ts          — GET/POST articles store
    store/[id]/route.ts     — PUT/DELETE article
    expositions/route.ts    — GET/POST expositions
    expositions/[id]/route.ts — PUT/DELETE exposition
    evenements/route.ts     — GET/POST événements
    evenements/[id]/route.ts  — PUT/DELETE événement
    admin/init/route.ts     — POST : init tables + seed données existantes

components/
  Navbar.tsx          — Navigation fixe avec transparence/scroll
  Footer.tsx          — Pied de page avec navigation + contact
  SiteShell.tsx       — Wrapper conditionnel (masque Navbar/Footer sur /admin)

lib/
  data.ts             — Données statiques (non utilisées pour store/expos/evts)
  db.ts               — Pool de connexion MySQL2 (Hostinger)

public/
  videos/             — Vidéos hero (video-hero-wide.mp4, video-hero-vertical.mp4)
  images/             — Images (œuvres, artiste, etc.)
```

## Palette de couleurs
- Ivoire : `#F5F0E8`
- Sable : `#E8DFC8`
- Brun encre : `#3D2B1F`
- Noir profond : `#1A1209`
- Or : `#C9A84C`
- Or clair : `#E4C97A`
- Charbon : `#2A2520`
- Crème : `#FAF7F2`

## Typographie
- Serif : Cormorant Garamond (titres, textes élégants)
- Sans-serif : Montserrat (corps, labels, nav)

## Pages incluses
- **Accueil** — Hero vidéo immersif + sections (artiste, ateliers, galerie, expositions, CTA)
- **L'Artiste** — Biographie, démarche, inspirations
- **Ateliers** — Cours semestriels avec paiement PayPal
- **Expositions** — Liste avec fiches (à venir + passées)
- **Événements** — Agenda (à venir + archives)
- **Galerie** — Grille filtrée + modal œuvre
- **Store** — Acheter œuvres et objets via PayPal
- **Contact** — Formulaire avec motifs de demande
- **Mentions légales**

## Paiement
- PayPal simple via liens directs
- Ateliers : "Réserver / Payer via PayPal"
- Store : "Acheter via PayPal"
- Email PayPal configurable dans `lib/data.ts`

## Vidéos hero
Placer les fichiers dans `/public/videos/` :
- `video-hero-wide.mp4` — pour desktop
- `video-hero-vertical.mp4` — pour mobile

## Gestion du contenu
Tout le contenu mock est dans `lib/data.ts` :
- `siteConfig` — infos générales (email, réseaux sociaux)
- `artistData` — biographie, inspirations, citation
- `ateliersData` — cours semestriels avec prix et liens PayPal
- `expositionsData` — expositions avec statut (à venir / passé)
- `evenementsData` — événements avec statut
- `galerieData` — œuvres avec prix et disponibilité
- `storeData` — produits avec liens PayPal

## Typographies (next/font/google)
Les polices sont chargées via `next/font/google` dans `app/layout.tsx` (download au build, servi localement — pas de requête externe Google à chaque rendu) :
- `cormorant` → variable CSS `--font-cormorant`
- `montserrat` → variable CSS `--font-montserrat`
Ces variables sont référencées dans `globals.css` via `@theme`.

## Correctifs importants appliqués
1. **Boucle de recompilation infinie** — root cause : `.local/state/` (fichiers Replit écrits en continu) surveillés par le webpack watcher. Fix : `watchOptions.ignored` dans `next.config.js` pour exclure `.local/**`, `.cache/**`, `.git/**`, `.next/**`, `node_modules/**`.
2. **tsconfig.tsbuildinfo** — déplacé vers `.next/cache/` via `"tsBuildInfoFile"` pour ne pas déclencher le watcher.
3. **Hydration mismatch `<link>`** — `@import url(https://fonts.google...)` retiré de `globals.css` ; `<link>` manuel retiré du layout. Remplacé par `next/font/google`.
4. **`import type { Metadata }` dans composant client** — retiré de `app/artiste/page.tsx`.

## Workflow
- Démarrage : `npm run dev` (port 5000)
- Build : `npm run build`
- Production : `npm run start`
