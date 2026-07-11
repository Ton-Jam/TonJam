import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

interface TonPriceContextType {
  price: number | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

const TonPriceContext = createContext<TonPriceContextType>({
  price: null,
  loading: true,
  error: null,
  lastUpdated: null,
});

export const useTonPrice = () => useContext(TonPriceContext);

export const TonPriceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [price, setPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchPrice = async () => {
    try {
      // Fetch from our server-side proxy to avoid CORS/Network issues
      const response = await axios.get('/api/ton-price', { timeout: 10000 });
      const tonPrice = response.data.price;
      
      if (tonPrice) {
        setPrice(tonPrice);
        setLastUpdated(new Date());
        setError(null);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message;
      console.error('Failed to fetch TON price:', errorMessage);
      
      // If we don't have a price yet, use a realistic fallback for UI purposes
      if (price === null) {
        setPrice(7.50); 
        setError(`Using fallback price (${errorMessage === 'Network Error' ? 'Server Unreachable' : errorMessage})`);
      } else {
        setError('Failed to update price');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrice();
    // Refresh every 5 minutes
    const interval = setInterval(fetchPrice, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <TonPriceContext.Provider value={{ price, loading, error, lastUpdated }}>
      {children}
    </TonPriceContext.Provider>
  );
};
