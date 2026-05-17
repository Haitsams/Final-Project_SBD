const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false }
});

const initTables = async () => {
  try {
    console.log('Memulai inisialisasi tabel di PostgreSQL...');

    // Tabel Users
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        available_balance BIGINT DEFAULT 0,
        hold_balance BIGINT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('  -> Tabel "users"');

    // Tabel Auctions (bergantung pada users)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS auctions (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        item_name VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        image_url TEXT,
        start_price BIGINT NOT NULL,
        current_highest_bid BIGINT DEFAULT 0,
        end_time TIMESTAMP NOT NULL,
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('  -> Tabel "auctions"');

    // Tabel Bids (bergantung pada auctions & users)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS bids (
        id SERIAL PRIMARY KEY,
        auction_id INT REFERENCES auctions(id) ON DELETE CASCADE,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        bid_amount BIGINT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Tabel "bids"');

    // Transactions (bergantung pada users)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        amount BIGINT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Tabel "transactions"');

    // Tabel Watchlists (bergantung pada users & auctions)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS watchlists (
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        auction_id INT REFERENCES auctions(id) ON DELETE CASCADE,
        PRIMARY KEY (user_id, auction_id)
      );
    `);
    console.log('Tabel "watchlists"');

    console.log('PostgreSQL: Semua tabel berhasil dibuat!');
  } catch (error) {
    console.error('Error PostgreSQL saat initTables:', error);
  }
};

initTables();

module.exports = pool;