const express = require('express');
const router = express.Router();
const AuctionController = require('../controllers/auction.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.get('/', AuctionController.getAllAuctions); 
router.get('/:id', AuctionController.getAuctionDetails);

router.post('/', authenticate, AuctionController.createAuction);
router.post('/:id/bid', authenticate, AuctionController.placeBid);

module.exports = router;