import * as mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';

dotenv.config();

export const mysqlPool = mysql.createPool({
  host: 'srv1536.hstgr.io',
  user: 'u428551797_Anantam',
  password: 'Anantam413',
  database: 'u428551797_HRMS',
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
}); 