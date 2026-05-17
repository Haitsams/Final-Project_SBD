const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

class UserController {
  // 1. REGISTER
  static async register(req, res) {
    const { username, email, password } = req.body;
    try {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const result = await pool.query(
        'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email, available_balance',
        [username, email, hashedPassword]
      );
      res.status(201).json({ success: true, message: 'Registrasi berhasil', user: result.rows[0] });
    } catch (error) {
      if (error.code === '23505') { 
        return res.status(400).json({ success: false, error: 'Username atau Email sudah terdaftar' });
      }
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // 2. LOGIN
  static async login(req, res) {
    const { email, password } = req.body;
    try {
      const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      const user = result.rows[0];

      if (!user) return res.status(400).json({ success: false, error: 'Email atau password salah' });
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) return res.status(400).json({ success: false, error: 'Email atau password salah' });

      const token = jwt.sign(
        { userId: user.id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.status(200).json({
        success: true,
        message: 'Login berhasil',
        token,
        user: { id: user.id, username: user.username, email: user.email }
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // 3. GET PROFILE
  static async getProfile(req, res) {
    const userId = req.user.userId; 
    try {
      const result = await pool.query(
        'SELECT id, username, email, available_balance, hold_balance FROM users WHERE id = $1',
        [userId]
      );
      res.status(200).json({ success: true, user: result.rows[0] });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // 4. TOP UP SALDO (Memakai ACID Transaction)
  static async topUp(req, res) {
    const userId = req.user.userId;
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, error: 'Jumlah top-up tidak valid' });
    }

    try {
      await pool.query('BEGIN'); 

      const updateRes = await pool.query(
        'UPDATE users SET available_balance = available_balance + $1 WHERE id = $2 RETURNING available_balance',
        [amount, userId]
      );

      await pool.query(
        "INSERT INTO transactions (user_id, type, amount) VALUES ($1, 'TOPUP', $2)",
        [userId, amount]
      );

      await pool.query('COMMIT'); 

      res.status(200).json({
        success: true,
        message: 'Top-up berhasil',
        new_balance: updateRes.rows[0].available_balance
      });
    } catch (error) {
      await pool.query('ROLLBACK'); 
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = UserController;