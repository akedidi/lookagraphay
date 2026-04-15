import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST() {
  try {
    const conn = await pool.getConnection();

    await conn.execute(`
      CREATE TABLE IF NOT EXISTS store_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        titre VARCHAR(500) NOT NULL,
        sous_titre VARCHAR(500),
        categorie VARCHAR(100) DEFAULT 'Tableau',
        description TEXT,
        citation TEXT,
        technique VARCHAR(500),
        dimensions VARCHAR(200),
        annee VARCHAR(10),
        prix DECIMAL(10,2),
        images JSON,
        disponible TINYINT(1) DEFAULT 1,
        paypal_link VARCHAR(500),
        ordre INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await conn.execute(`
      CREATE TABLE IF NOT EXISTS expositions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        titre VARCHAR(500) NOT NULL,
        lieu VARCHAR(500),
        dates VARCHAR(200),
        statut VARCHAR(50) DEFAULT 'passé',
        description TEXT,
        image VARCHAR(500),
        images JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await conn.execute(`
      CREATE TABLE IF NOT EXISTS evenements (
        id INT AUTO_INCREMENT PRIMARY KEY,
        titre VARCHAR(500) NOT NULL,
        date VARCHAR(100),
        heure VARCHAR(100),
        lieu VARCHAR(500),
        type VARCHAR(100) DEFAULT 'Vernissage',
        statut VARCHAR(50) DEFAULT 'à venir',
        description TEXT,
        images JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    const [storeRows] = await conn.execute('SELECT COUNT(*) as count FROM store_items') as any;
    if (storeRows[0].count === 0) {
      const storeItems = [
        ['Chawq al-Hayat — شوق الحياة','Désir ardent de la vie','Tableau','Ce vers du poète tunisien Abou el-Kassem el-Chebbi exprime la force vitale sans laquelle l\'existence se fane. La couleur bleue évoque les sources de la vie — le ciel et la mer. Les points dorés sont autant de lumières vers lesquelles notre esprit peut tendre.','« Celui que le désir ardent de la vie n\'enlace pas, se dissipera dans son ciel et disparaîtra en poussière. »','Acrylique sur toile de lin','60 × 90 cm','2024',500,JSON.stringify(['/images/tableau-chawq-2.jpg','/images/tableau-chawq-1.jpg']),1,'https://paypal.me/lookagraphy/500',1],
        ['Fîhâ liman sâlamoûna — وفيها لمن سالمونا','La paix à ceux qui viennent en paix','Tableau','Cette œuvre rend hommage à la fraternité et à l\'hospitalité. La calligraphie ample et lumineuse célèbre la paix offerte à ceux qui nous approchent avec de bonnes intentions. Le losange d\'or symbolise la préciosité du lien humain.','« Trouvera la paix celui qui nous approche avec un cœur de paix. »','Acrylique sur toile de lin','60 × 80 cm','2024',450,JSON.stringify(['/images/tableau-salam-1.jpg','/images/tableau-salam-2.jpg']),1,'https://paypal.me/lookagraphy/450',2],
        ['Da\' al-Hayat — دع الحياة','Laisse la vie vivre en toi','Tableau','Extrait de Rumi : le mot « vivre » sort du cadre doré, qui symbolise notre cage d\'or, notre zone de confort. Sortir de cette cage est la seule voie pour retrouver la paix intérieure.','« Ne cherche pas à résister aux changements qui se dressent sur ton chemin. Laisse la vie vivre en toi. »','Toile de coton, feuille d\'or, acrylique et encre japonaise','Toile originale','2005',400,JSON.stringify(['/images/tableau-laisse-vie-2.jpg','/images/tableau-laisse-vie-1.jpg']),1,'https://paypal.me/lookagraphy/400',3],
        ['Haq — حق','Vérité & Justice','Tableau','Haq désigne à la fois justice et droit en un seul mot. Au centre du tableau, ce mot est calligraphié avec une partie estompée et l\'autre manifeste — symbolisant que la vérité finit toujours par apparaître.','« Peu importe nos efforts pour estomper, cacher ou faire taire la vérité, elle finit toujours par apparaître au grand jour. »','Acrylique sur toile','Toile originale','2015',350,JSON.stringify(['/images/tableau-haq-1.jpg','/images/tableau-haq-2.jpg']),1,'https://paypal.me/lookagraphy/350',4],
        ['Howa al-Mahabba — هو المحبة','L\'amour dont on ne saisit l\'essence qu\'à travers la souffrance','Tableau','Hommage à la vision de l\'amour selon Ibn Hazm al-Andalousî. La composition circulaire en noir et blanc rayonne autour d\'un cœur d\'or.','« C\'est l\'amour dont on ne saisit la véritable essence qu\'à travers la souffrance. »','Acrylique sur toile de lin','60 × 80 cm','2015',300,JSON.stringify(['/images/tableau-mahabba-1.jpg','/images/tableau-mahabba-2.jpg']),1,'https://paypal.me/lookagraphy/300',5],
        ['Adînu bi-dîn al-hubb — أدين بدين الحب','L\'amour est ma croyance','Tableau','Ibn al-Arabi exprime une vision universelle de la spiritualité. Le texte est composé en cercle — symbole de la planète Terre. Les différentes couleurs représentent la diversité des peuples.','« L\'amour est ma croyance et m\'incline devant ses enseignements. Mon cœur serait ouvert à toute forme. »','Acrylique sur toile de lin','60 × 90 cm','2024',300,JSON.stringify(['/images/tableau-amour-3.jpg','/images/tableau-amour-1.jpg','/images/tableau-amour-2.jpg']),1,'https://paypal.me/lookagraphy/300',6],
      ];
      for (const item of storeItems) {
        await conn.execute(
          'INSERT INTO store_items (titre,sous_titre,categorie,description,citation,technique,dimensions,annee,prix,images,disponible,paypal_link,ordre) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)',
          item
        );
      }
    }

    const [expoRows] = await conn.execute('SELECT COUNT(*) as count FROM expositions') as any;
    if (expoRows[0].count === 0) {
      const expos = [
        ['Élégance Encrée','Paris 5e','Paris Ve arrondissement','passé','L\'exposition « Élégance Encrée » honore la beauté intemporelle des traits tracés par l\'encre et le calame, deux outils de l\'art de la calligraphie arabe, sublimant ainsi les paroles émouvantes de poésie et les valeurs humaines.\n\nIl s\'agit d\'une célébration de l\'art et de la tradition, une fusion harmonieuse entre l\'esthétique et le spirituel.','/images/expo-elegance.jpg',JSON.stringify(['/images/expo-elegance.jpg'])],
        ['Looka et ses élèves','La Curiosité, Paris 5e','Vernissage — samedi 7 septembre','passé','Looka expose ses œuvres et invite ses élèves à présenter leurs progrès au cours de l\'année précédente de cours de calligraphie. Venez découvrir leurs créations lors de ce vernissage à « La Curiosité », Paris Ve.','/images/expo-eleves.jpg',JSON.stringify(['/images/expo-eleves.jpg'])],
      ];
      for (const expo of expos) {
        await conn.execute(
          'INSERT INTO expositions (titre,lieu,dates,statut,description,image,images) VALUES (?,?,?,?,?,?,?)',
          expo
        );
      }
    }

    const [evtRows] = await conn.execute('SELECT COUNT(*) as count FROM evenements') as any;
    if (evtRows[0].count === 0) {
      const evts = [
        ['Vernissage — Silences Écrits','12 avril 2026','18h30 — 21h00','Galerie Nour, 14 rue des Blancs-Manteaux, Paris 4e','Vernissage','à venir','Soirée d\'inauguration de l\'exposition Silences Écrits. Looka sera présente pour partager sa démarche artistique autour d\'un verre.',JSON.stringify([])],
        ['Démonstration de calligraphie en direct','3 mai 2026','15h00 — 17h00','Galerie Nour, Paris 4e','Performance','à venir','Looka réalise en direct une œuvre calligraphique devant le public. Un moment rare et contemplatif.',JSON.stringify([])],
        ['Portes Ouvertes de l\'Atelier','24 mai 2026','14h00 — 18h00','Atelier LookaGraphy, Paris 11e','Portes ouvertes','à venir','Venez découvrir l\'atelier, les outils, les encres, les papiers. Une initiation gratuite au calame est proposée toutes les heures.',JSON.stringify([])],
        ['Table ronde — Calligraphie contemporaine','Novembre 2025','19h00','Institut du Monde Arabe, Paris','Conférence','passé','Looka a participé à une table ronde sur la place de la calligraphie arabe dans l\'art contemporain.',JSON.stringify([])],
      ];
      for (const evt of evts) {
        await conn.execute(
          'INSERT INTO evenements (titre,date,heure,lieu,type,statut,description,images) VALUES (?,?,?,?,?,?,?,?)',
          evt
        );
      }
    }

    conn.release();
    return NextResponse.json({ ok: true, message: 'DB initialisée et données migrées' });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
