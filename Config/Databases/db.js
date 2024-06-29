import mysql from "mysql2/promise";

export const pool = mysql.createPool({
    host: 'afyung.shop',
    user: 'afyungs2_perpus',
    password: 'Genta456',
    database: 'afyungs2_perpus',
  });
  