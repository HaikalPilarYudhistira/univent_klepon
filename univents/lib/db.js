// lib/db.js
// Koneksi database MySQL/PlanetScale untuk Vercel Serverless Functions.
// Menggunakan mysql2/promise dengan connection pooling yang aman untuk serverless
// (cache koneksi antar invocation supaya tidak exhaust connection limit).

const mysql = require('mysql2/promise');

let pool;

function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: process.env.DB_SSL === 'false' ? undefined : { rejectUnauthorized: true },
      waitForConnections: true,
      connectionLimit: 5,
      queueLimit: 0,
    });
  }
  return pool;
}

async function query(sql, params = []) {
  const conn = getPool();
  const [rows] = await conn.execute(sql, params);
  return rows;
}

module.exports = { getPool, query };
