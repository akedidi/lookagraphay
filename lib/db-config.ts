import type { PoolOptions } from 'mysql2/promise';

/** Sur Hostinger Node, MySQL est local — pas l’hôte distant phpMyAdmin (hstgr.io). */
export function resolveMysqlHost(raw?: string): string {
  const host = (raw ?? process.env.DB_HOST ?? '').trim() || '127.0.0.1';
  if (process.env.NODE_ENV === 'production' && /hstgr\.io/i.test(host)) {
    return '127.0.0.1';
  }
  return host;
}

export function getMysqlPoolOptions(): PoolOptions {
  const host = resolveMysqlHost();
  const port = parseInt(process.env.DB_PORT ?? '3306', 10);
  return {
    host,
    port: Number.isFinite(port) ? port : 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 3,
    queueLimit: 0,
    connectTimeout: 10_000,
    timezone: '+00:00',
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
  };
}
