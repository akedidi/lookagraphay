export const siteConfig = {
  name: "LookaGraphy",
  tagline: "L'art de la calligraphie arabe",
  description:
    "LookaGraphy est l'atelier de calligraphie arabe de Looka — artiste, enseignante et passeure d'un art millénaire entre Orient et Occident.",
  email: "contact@lookagraphy.fr",
  instagram: "https://instagram.com/lookagraphy",
  paypalEmail: "contact@lookagraphy.fr",
};

export const artistData = {
  name: "Looka",
  fullName: "Looka — Calligraphe",
  bio: [
    "Née entre deux langues et deux rives, Looka a découvert la calligraphie arabe comme on découvre une langue secrète — par le geste, le silence, la répétition. Formée auprès de maîtres calligraphes au Maroc et en Orient, elle a fait de cette pratique le fil conducteur de sa vie artistique.",
    "Sa démarche est à la fois spirituelle et sensible : chaque lettre tracée est une méditation, chaque œuvre une conversation entre la tradition et la contemporanéité. Elle enseigne, crée et transmet avec la conviction que la calligraphie arabe est un art vivant, universel, qui parle à tous.",
    "Basée à Paris, son atelier est un espace de création et de transmission, ouvert à ceux qui souhaitent découvrir la beauté du geste calligraphique.",
  ],
  quote:
    "Chaque lettre arabe est un univers. La calligraphie n'est pas une écriture — c'est une danse de l'encre.",
  inspirations: [
    "Les manuscrits andalous du XIIIe siècle",
    "La lumière rasante du Sahara au crépuscule",
    "L'architecture de la mosquée de Cordoue",
    "La poésie de Rumi et d'Al-Mutanabbi",
    "Le geste du peintre gestural occidental",
  ],
  image: "/images/artist.jpg",
};

export const ateliersData = [
  {
    id: "semestre-1-2026",
    titre: "Calligraphie arabe — Niveau Fondation",
    niveau: "Débutants",
    semestre: "Printemps 2026",
    dates: "Du 15 mars au 21 juin 2026",
    horaires: "Samedi de 10h à 13h",
    lieu: "Atelier LookaGraphy, Paris 11e",
    places: 8,
    placesRestantes: 3,
    prix: 480,
    description:
      "Une initiation profonde à la calligraphie arabe classique. On commence par les fondations : tenir le calame, comprendre les proportions, maîtriser les lettres isolées du style Naskh avant d'aborder les liaisons et les premiers mots.",
    programme: [
      "Histoire et spiritualité de la calligraphie arabe",
      "Prise en main du calame et de l'encre",
      "L'alphabet en style Naskh — lettres isolées",
      "Les liaisons et la composition de mots",
      "Initiation à la composition artistique",
      "Réalisation d'une œuvre personnelle",
    ],
    materiel: "Fourni par l'atelier pour les 3 premières séances",
    paypalLink: "https://paypal.me/lookagraphy/480",
  },
  {
    id: "semestre-2-2026",
    titre: "Calligraphie arabe — Niveau Intermédiaire",
    niveau: "Intermédiaires",
    semestre: "Automne 2026",
    dates: "Du 12 septembre au 12 décembre 2026",
    horaires: "Samedi de 14h à 17h",
    lieu: "Atelier LookaGraphy, Paris 11e",
    places: 6,
    placesRestantes: 6,
    prix: 560,
    description:
      "Pour ceux qui maîtrisent les bases. On explore le style Thuluth et ses arabesques, la composition de textes poétiques, et on développe une sensibilité artistique propre.",
    programme: [
      "Approfondissement du style Naskh",
      "Introduction au style Thuluth",
      "Composition de versets et de poèmes",
      "Travail sur le format et la mise en page",
      "Dorure et rehaut à l'or",
      "Présentation d'un portfolio personnel",
    ],
    materiel: "Liste fournie à l'inscription",
    paypalLink: "https://paypal.me/lookagraphy/560",
  },
  {
    id: "stage-ete-2026",
    titre: "Stage Intensif d'Été",
    niveau: "Tous niveaux",
    semestre: "Été 2026",
    dates: "Du 6 au 10 juillet 2026",
    horaires: "Lundi au vendredi, 10h à 16h",
    lieu: "Atelier LookaGraphy, Paris 11e",
    places: 10,
    placesRestantes: 5,
    prix: 390,
    description:
      "Cinq jours d'immersion totale dans le geste calligraphique. Une expérience intense, contemplative et transformatrice.",
    programme: [
      "Immersion dans les fondamentaux",
      "Travaux pratiques quotidiens",
      "Visite d'une exposition calligraphique",
      "Séance de création libre",
      "Vernissage privé des œuvres réalisées",
    ],
    materiel: "Tout le matériel fourni",
    paypalLink: "https://paypal.me/lookagraphy/390",
  },
];

export const expositionsData = [
  {
    id: "expo-2026-silence",
    titre: "Silences Écrits",
    lieu: "Galerie Nour, Paris 4e",
    dates: "12 avril — 3 mai 2026",
    statut: "à venir",
    description:
      "Une série de douze grandes compositions en encre de chine sur papier aquarelle japonais. Looka explore les espaces vides entre les lettres — le silence comme élément central de la calligraphie.",
    image: "/images/expo-silence.jpg",
  },
  {
    id: "expo-2025-mouvement",
    titre: "Du Geste à la Lettre",
    lieu: "Institut du Monde Arabe, Paris",
    dates: "Octobre — Novembre 2025",
    statut: "passé",
    description:
      "Exposition collective réunissant douze calligraphes de la Méditerranée. Looka y présentait six œuvres monumentales en style Diwani sur soie.",
    image: "/images/expo-mouvement.jpg",
  },
  {
    id: "expo-2025-racines",
    titre: "Racines et Encres",
    lieu: "Maison de la Culture du Maroc, Paris",
    dates: "Mars — Avril 2025",
    statut: "passé",
    description:
      "Solo show explorant les liens entre calligraphie arabe et mémoire familiale. Une trentaine d'œuvres intimes et monumentales.",
    image: "/images/expo-racines.jpg",
  },
];

export const evenementsData = [
  {
    id: "evt-vernissage-2026",
    titre: "Vernissage — Silences Écrits",
    date: "12 avril 2026",
    heure: "18h30 — 21h00",
    lieu: "Galerie Nour, 14 rue des Blancs-Manteaux, Paris 4e",
    type: "Vernissage",
    statut: "à venir",
    description:
      "Soirée d'inauguration de l'exposition Silences Écrits. Looka sera présente pour partager sa démarche artistique autour d'un verre.",
  },
  {
    id: "evt-demo-2026",
    titre: "Démonstration de calligraphie en direct",
    date: "3 mai 2026",
    heure: "15h00 — 17h00",
    lieu: "Galerie Nour, Paris 4e",
    type: "Performance",
    statut: "à venir",
    description:
      "Looka réalise en direct une œuvre calligraphique devant le public. Un moment rare et contemplatif.",
  },
  {
    id: "evt-atelier-ouvert-2026",
    titre: "Portes Ouvertes de l'Atelier",
    date: "24 mai 2026",
    heure: "14h00 — 18h00",
    lieu: "Atelier LookaGraphy, Paris 11e",
    type: "Portes ouvertes",
    statut: "à venir",
    description:
      "Venez découvrir l'atelier, les outils, les encres, les papiers. Une initiation gratuite au calame est proposée toutes les heures.",
  },
  {
    id: "evt-ima-2025",
    titre: "Table ronde — Calligraphie contemporaine",
    date: "Novembre 2025",
    heure: "19h00",
    lieu: "Institut du Monde Arabe, Paris",
    type: "Conférence",
    statut: "passé",
    description:
      "Looka a participé à une table ronde sur la place de la calligraphie arabe dans l'art contemporain.",
  },
];

export const galerieData = [
  {
    id: "oeuvre-1",
    titre: "Bismillah — Grand Format",
    technique: "Encre de chine sur papier Fabriano",
    dimensions: "100 × 70 cm",
    annee: "2025",
    style: "Thuluth",
    disponible: true,
    prix: 1800,
    image: "/images/oeuvre-1.jpg",
    description:
      "La Basmala tracée en style Thuluth classique avec des rehauts dorés. Une œuvre de méditation.",
  },
  {
    id: "oeuvre-2",
    titre: "L'Eau — Composition Diwani",
    technique: "Encre et aquarelle sur papier japonais",
    dimensions: "80 × 60 cm",
    annee: "2025",
    style: "Diwani",
    disponible: true,
    prix: 2200,
    image: "/images/oeuvre-2.jpg",
    description:
      "Le mot 'Maa' — l'eau — décliné en vingt variations gestuelles sur un fond aquarellé bleu.",
  },
  {
    id: "oeuvre-3",
    titre: "Lumière — Séquence de 3",
    technique: "Encre dorée sur papier Canson noir",
    dimensions: "Triptyque 40 × 30 cm chaque",
    annee: "2026",
    style: "Naskh",
    disponible: true,
    prix: 1400,
    image: "/images/oeuvre-3.jpg",
    description:
      "Triptyque lumineux : Nur (lumière), Qamar (lune), Shams (soleil). Encre dorée sur fond nuit.",
  },
  {
    id: "oeuvre-4",
    titre: "Silence — Grande composition",
    technique: "Encre de chine sur toile de lin",
    dimensions: "120 × 90 cm",
    annee: "2026",
    style: "Diwani Jali",
    disponible: false,
    prix: 3200,
    image: "/images/oeuvre-4.jpg",
    description:
      "Œuvre monumentale représentant le mot 'Samt' (silence) en style Diwani Jali. Collection privée.",
  },
  {
    id: "oeuvre-5",
    titre: "Amour — Poème calligraphié",
    technique: "Encre et feuille d'or sur papier Arches",
    dimensions: "60 × 40 cm",
    annee: "2024",
    style: "Naskh classique",
    disponible: true,
    prix: 950,
    image: "/images/oeuvre-5.jpg",
    description:
      "Extrait du poème de Rumi calligraphié en style Naskh classique avec finitions à la feuille d'or.",
  },
  {
    id: "oeuvre-6",
    titre: "Infini — Composition circulaire",
    technique: "Encre sur papier marouflé",
    dimensions: "Ø 50 cm",
    annee: "2025",
    style: "Koufi géométrique",
    disponible: true,
    prix: 1600,
    image: "/images/oeuvre-6.jpg",
    description:
      "Composition circulaire en style Koufi géométrique — la lettre 'Alif' répétée à l'infini.",
  },
];

export const storeData = [
  {
    id: "store-1",
    categorie: "Œuvre originale",
    titre: "Bismillah — Grand Format",
    prix: 1800,
    image: "/images/oeuvre-1.jpg",
    disponible: true,
    paypalLink: "https://paypal.me/lookagraphy/1800",
    description:
      "Œuvre originale unique sur papier Fabriano, encadrée sur demande.",
  },
  {
    id: "store-2",
    categorie: "Œuvre originale",
    titre: "L'Eau — Composition Diwani",
    prix: 2200,
    image: "/images/oeuvre-2.jpg",
    disponible: true,
    paypalLink: "https://paypal.me/lookagraphy/2200",
    description: "Encre et aquarelle sur papier japonais. Œuvre unique, certificat inclus.",
  },
  {
    id: "store-3",
    categorie: "Œuvre originale",
    titre: "Amour — Poème calligraphié",
    prix: 950,
    image: "/images/oeuvre-5.jpg",
    disponible: true,
    paypalLink: "https://paypal.me/lookagraphy/950",
    description: "Encre et feuille d'or sur papier Arches. Format 60 × 40 cm.",
  },
  {
    id: "store-4",
    categorie: "Estampe",
    titre: "Estampe Bismillah — Tirage limité",
    prix: 120,
    image: "/images/oeuvre-1.jpg",
    disponible: true,
    paypalLink: "https://paypal.me/lookagraphy/120",
    description:
      "Reproduction fine art sur papier Hahnemühle, tirage numéroté à 30 exemplaires, signée.",
  },
  {
    id: "store-5",
    categorie: "Objet d'art",
    titre: "Carnet calligraphié — Couverture cuir",
    prix: 65,
    image: "/images/objet-carnet.jpg",
    disponible: true,
    paypalLink: "https://paypal.me/lookagraphy/65",
    description:
      "Carnet artisanal à couverture en cuir gravée d'une calligraphie originale. Papier vergé 120g.",
  },
  {
    id: "store-6",
    categorie: "Objet d'art",
    titre: "Marque-pages calligraphiés — Set de 5",
    prix: 35,
    image: "/images/objet-marque.jpg",
    disponible: true,
    paypalLink: "https://paypal.me/lookagraphy/35",
    description:
      "Set de 5 marque-pages en papier aquarelle, calligraphiés à la main. Mots : Nur, Sabr, Hubb, Hilm, Shukr.",
  },
];
