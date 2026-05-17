const pool = require('../config/db');
const redis = require('../config/redis');

class AuctionController {
  static async createAuction(req, res) {
    const userId = req.user.userId;
    //  Tambahkan category di req.body
    const { item_name, category, image_url, start_price, duration_minutes } = req.body;

    try {
      // Validasi input kategori 
      if (!category) {
        return res.status(400).json({ success: false, error: 'Kategori barang wajib diisi.' });
      }

      const endTime = new Date(Date.now() + duration_minutes * 60000);

      // Masukkan kolom category ke query INSERT
      const result = await pool.query(
        `INSERT INTO auctions (user_id, item_name, category, image_url, start_price, current_highest_bid, end_time) 
         VALUES ($1, $2, $3, $4, $5, $5, $6) RETURNING *`,
        [userId, item_name, category, image_url, start_price, endTime]
      );

      res.status(201).json({ success: true, message: 'Lelang berhasil dibuat', auction: result.rows[0] });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getAllAuctions(req, res) {
    // Ambil category dari req.query berdampingan dengan search
    const { search, category } = req.query; 
    
    try {
      let queryText = 'SELECT * FROM auctions WHERE 1=1'; 
      let queryParams = [];

      // Search Nama Item
      if (search) {
        queryParams.push(`%${search}%`);
        queryText += ` AND item_name ILIKE $${queryParams.length}`;
      }

      // Filter Kategori 
      if (category) {
        queryParams.push(category); // Menggunakan "=" tepat jika input kategori fix (e.g., 'Elektronik')
        queryText += ` AND category ILIKE $${queryParams.length}`; // ILIKE digunakan agar case-insensitive ('elektronik' / 'Elektronik')
      }

      queryText += ' ORDER BY created_at DESC'; 

      const result = await pool.query(queryText, queryParams);
      res.status(200).json({ success: true, auctions: result.rows });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getAuctionDetails(req, res) {
    const { id } = req.params;
    try {
      const auctionRes = await pool.query('SELECT * FROM auctions WHERE id = $1', [id]);
      if (auctionRes.rows.length === 0) return res.status(404).json({ error: 'Lelang tidak ditemukan' });

      const bidsRes = await pool.query(
        `SELECT b.*, u.username FROM bids b 
         JOIN users u ON b.user_id = u.id 
         WHERE auction_id = $1 ORDER BY bid_amount DESC`,
        [id]
      );

      res.status(200).json({ success: true, auction: auctionRes.rows[0], bids: bidsRes.rows });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async placeBid(req, res) {
    const userId = req.user.userId;
    const auctionId = req.params.id;
    const { bid_amount } = req.body;

    const lockKey = `lock:auction:${auctionId}`;
    const acquiredLock = await redis.set(lockKey, 'LOCKED', 'NX', 'EX', 5);

    if (!acquiredLock) {
      return res.status(409).json({ success: false, error: 'Sistem sibuk karena banyak yang menawar. Silakan coba lagi.' });
    }

    try {
      await pool.query('BEGIN'); 

      const auctionRes = await pool.query('SELECT * FROM auctions WHERE id = $1 FOR UPDATE', [auctionId]);
      const auction = auctionRes.rows[0];

      if (!auction) throw new Error('Lelang tidak ditemukan');
      if (new Date() > new Date(auction.end_time)) throw new Error('Waktu lelang sudah habis!');
      if (bid_amount <= auction.current_highest_bid) throw new Error(`Bid harus lebih besar dari Rp ${auction.current_highest_bid}`);

      const userRes = await pool.query('SELECT available_balance FROM users WHERE id = $1 FOR UPDATE', [userId]);
      const userBalance = userRes.rows[0].available_balance;

      if (userBalance < bid_amount) throw new Error('Saldo Anda tidak cukup.');

      await pool.query(
        'UPDATE users SET available_balance = available_balance - $1, hold_balance = hold_balance + $1 WHERE id = $2',
        [bid_amount, userId]
      );

      const prevBidRes = await pool.query(
        'SELECT user_id, bid_amount FROM bids WHERE auction_id = $1 ORDER BY bid_amount DESC LIMIT 1',
        [auctionId]
      );

      if (prevBidRes.rows.length > 0) {
        const prevBidder = prevBidRes.rows[0];
        await pool.query(
          'UPDATE users SET hold_balance = hold_balance - $1, available_balance = available_balance + $1 WHERE id = $2',
          [prevBidder.bid_amount, prevBidder.user_id]
        );
      }

      await pool.query('INSERT INTO bids (auction_id, user_id, bid_amount) VALUES ($1, $2, $3)', [auctionId, userId, bid_amount]);
      await pool.query('UPDATE auctions SET current_highest_bid = $1 WHERE id = $2', [bid_amount, auctionId]);

      await pool.query('COMMIT');
      res.status(200).json({ success: true, message: 'Berhasil melakukan Bid!' });

    } catch (error) {
      await pool.query('ROLLBACK');
      res.status(400).json({ success: false, error: error.message });
    } finally {
      await redis.del(lockKey);
    }
  }
}

module.exports = AuctionController;