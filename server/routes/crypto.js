
import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

router.get('/top', async (req, res) => {
  console.log("📡 GET /api/crypto/top called");

  console.log("🔑 Using API key:", process.env.COINMARKETCAP_API_KEY);
  
  try {
    const response = await axios.get('https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest', {
      headers: {
        'X-CMC_PRO_API_KEY': process.env.COINMARKETCAP_API_KEY,
      },
      params: {
        start: 1,
        limit: 10,
        convert: 'USD',
      },
    });

    console.log("✅ CoinMarketCap raw response:");
    console.dir(response.data, { depth: null });

    res.json(response.data.data);
  } catch (error) {
    console.error('❌ Error fetching crypto prices:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch crypto prices' });
  }
});


export default router;
