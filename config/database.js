const mysql = require("mysql2/promise");
require("dotenv").config();

// Configurazione del pool di connessioni
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "meditactive",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test della connessione al database
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log("Database connection established successfully");
    connection.release();
    return true;
  } catch (error) {
    console.error("Error connecting to database:", error.message);
    return false;
  }
}

// Esecuzione di query con parametri (prepared statement)
async function query(sql, params) {
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error("Database query error:", error.message);
    throw error;
  }
}

// Esportazione delle funzioni
module.exports = {
  pool,
  query,
  testConnection,
};
