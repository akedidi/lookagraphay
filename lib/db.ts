import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'srv2073.hstgr.io',
  user: process.env.DB_USER || 'u376353647_root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'u376353647_lookagraphy',
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
  timezone: '+00:00',
});

export default pool;
