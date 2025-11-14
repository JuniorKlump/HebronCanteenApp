// Interface with a database (PostgreSQL)
import pkg from "pg";
const { Pool } = pkg;

const flush = process.env.FLUSH || "false";

// Create a connection pool using DATABASE_URL from environment
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Initialise DB
export async function initDB() {
  console.log("Connecting to PostgreSQL…");

  if (flush === "true") {
    console.log("Flushing database…");

    await pool.query(`DROP TABLE IF EXISTS data`);

    await pool.query(`
      CREATE TABLE data (
        id SERIAL PRIMARY KEY,
        name TEXT,
        balance BIGINT
      )
    `);

    await pool.query(
      `INSERT INTO data (name, balance) VALUES ($1, $2)`,
      ["Bill Gates", 139000000000]
    );
  }

  console.log("PostgreSQL ready.");
  return pool; // return the pool instead of a sqlite database object
}
