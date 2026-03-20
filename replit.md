# LucaGraphy — Site vitrine premium de calligraphie arabe

## Description
Site vitrine premium pour LucaGraphy, atelier de calligraphie arabe de Luca. Site haut de gamme, artistique et immersif, au croisement d'un portfolio d'artiste, d'une galerie d'art, d'un site culturel et d'une boutique.

## Stack technique
- **Next.js 14** (App Router)
- **React 18** (composants client)
- **Tailwind CSS v4** (avec `@tailwindcss/postcss`)
- **Framer Motion v12** (animations légères)
- **TypeScript**

## Structure du projet
```
app/
  layout.tsx          — Layout global (Navbar + Footer)
  globals.css         — Styles globaux, variables CSS, animations
  page.tsx            — Accueil (hero vidéo, sections)
  artiste/page.tsx    — L'Artiste (biographie, démarche, inspirations)
  ateliers/page.tsx   — Ateliers semestriels avec paiement PayPal
  expositions/page.tsx — Expositions (à venir + passées)
  evenements/page.tsx  — Événements (agenda + archives)
  galerie/page.tsx    — Galerie d'œuvres avec filtre + modal
  store/page.tsx      — Store avec achat via PayPal
  contact/page.tsx    — Formulaire de contact
  mentions-legales/page.tsx — Mentions légales

components/
  Navbar.tsx          — Navigation fixe avec transparence/scroll
  Footer.tsx          — Pied de page avec navigation + contact

lib/
  data.ts             — Toutes les données mock en français

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

## Workflow
- Démarrage : `npm run dev` (port 5000)
- Build : `npm run build`
- Production : `npm run start`
