import mysql from "mysql2/promise";

export const pool = mysql.createPool({
    host: 'afyung.shop',
    user: 'afyungs2_perpus',
    password: 'Genta456',
    database: 'afyungs2_perpus',
    port: 3306, 
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 10000 
    

  });
  