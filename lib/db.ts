import mysql from 'mysql2/promise';
import { getMysqlPoolOptions } from '@/lib/db-config';

declare global {
  // eslint-disable-next-line no-var
  var _mysqlPool: mysql.Pool | undefined;
}

function getPool(): mysql.Pool {
  if (!global._mysqlPool) {
    global._mysqlPool = mysql.createPool(getMysqlPoolOptions());
  }
  return global._mysqlPool;
}

export default getPool();
