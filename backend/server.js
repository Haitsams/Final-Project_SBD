const express = require('express');
const cors = require('cors');
require('dotenv').config();

require('./config/db');
require('./config/redis');

const userRoutes = require('./routes/user.routes');
const auctionRoutes = require('./routes/auction.routes');
const app = express();

app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use('/api/users', userRoutes);
app.use('/api/auctions', auctionRoutes);

app.get('/', (req, res) => {
  res.send('Backend success');
});

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
  });
}

module.exports = app;