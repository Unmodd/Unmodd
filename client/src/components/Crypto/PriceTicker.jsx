import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Marquee from 'react-fast-marquee';

const PriceTicker = () => {
  const [prices, setPrices] = useState([]);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await axios.get(
          'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest',
          {
            headers: {
              'X-CMC_PRO_API_KEY': 'YOUR_API_KEY', 
            },
            params: {
              start: 1,
              limit: 10,
              convert: 'USD',
            },
          }
        );
        setPrices(response.data.data);
      } catch (error) {
        console.error('Error fetching prices:', error);
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 60000); 
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="price-ticker">
      <Marquee gradient={false} speed={50}>
        {prices.map((coin) => (
          <div key={coin.id} className="ticker-item">
            {coin.name} (${coin.quote.USD.price.toFixed(2)})
          </div>
        ))}
      </Marquee>
    </div>
  );
};

export default PriceTicker;
