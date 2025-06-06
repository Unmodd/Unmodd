import { useEffect, useState, useRef } from 'react'; 
import axios from 'axios';
import Marquee from 'react-fast-marquee';
import './CryptoTicker.css';

const TopCrypto = () => {
  const [cryptoData, setCryptoData] = useState([]);
  const [loading, setLoading] = useState(true);
  const prevPrices = useRef({}); 

  useEffect(() => {
    const fetchCrypto = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/crypto/top`);

        const newData = response.data;

        setCryptoData(prevData => {
          const updatedData = newData.map(coin => {
            const currentPrice = coin.quote?.USD?.price;
            const prevPrice = prevPrices.current[coin.id];
            
            let priceChangeClass = '';
            if (prevPrice !== undefined) {
              if (currentPrice > prevPrice) {
                priceChangeClass = 'price-up';
              } else if (currentPrice < prevPrice) {
                priceChangeClass = 'price-down';
              }
            }
            
            prevPrices.current[coin.id] = currentPrice;

            return { ...coin, priceChangeClass }; 
          });

          return updatedData;
        });
      } catch (error) {
        console.error('Error fetching crypto data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCrypto();

    const interval = setInterval(fetchCrypto, 15000); 

    return () => clearInterval(interval); 
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60px', color: '#E0E0E0', background: 'rgba(18, 18, 18, 0.4)', borderRadius: '50px', padding: '0 20px', margin: '20px 0' }}>
      Loading Crypto Data...
    </div>
  );

  return (
    <Marquee speed={50} gradient={false} pauseOnHover>
      {cryptoData.map((coin) => {
        const change = coin.quote?.USD?.percent_change_24h;
        const isPositive = change >= 0;
        const changeClass = isPositive ? 'positive' : 'negative';
        const arrow = isPositive ? '▲' : '▼';

        return (
          <div key={coin.id} className={`crypto-item ${coin.priceChangeClass || ''}`}>
            <span className="crypto-symbol">{coin.symbol}</span>
            <span className="crypto-price">${coin.quote?.USD?.price?.toFixed(2)}</span>
            <span className={`crypto-change ${changeClass}`}>
              ({arrow} {Math.abs(change).toFixed(2)}%)
            </span>
          </div>
        );
      })}
    </Marquee>
  );
};

export default TopCrypto;