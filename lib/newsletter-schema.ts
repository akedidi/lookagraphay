import type { PoolConnection } from 'mysql2/promise';

export async function ensureNewsletterTables(conn: PoolConnection): Promise<void> {
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS newsletter_subscribers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) NOT NULL,
      prenom VARCHAR(120) NULL,
      nom VARCHAR(120) NULL,
      active TINYINT(1) NOT NULL DEFAULT 1,
      unsubscribe_token VARCHAR(64) NOT NULL,
      source VARCHAR(32) DEFAULT 'checkout',
      subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      unsubscribed_at TIMESTAMP NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uk_newsletter_email (email),
      UNIQUE KEY uk_newsletter_token (unsubscribe_token)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await conn.execute(`
    CREATE TABLE IF NOT EXISTS newsletter_campaigns (
      id INT AUTO_INCREMENT PRIMARY KEY,
      subject VARCHAR(500) NOT NULL,
      body_html MEDIUMTEXT NOT NULL,
      sent_count INT NOT NULL DEFAULT 0,
      failed_count INT NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
}
