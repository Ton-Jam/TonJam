import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTonPrice } from './TonPriceContext';

interface GramPriceContextType {
  localCurrencyEnabled: boolean;
  setLocalCurrencyEnabled: (enabled: boolean) => void;
  fiatCurrency: string;
  setFiatCurrency: (currency: string) => void;
  convertPrice: (tonVal: string | number, hideLabel?: boolean) => string;
  fiatSymbol: string;
}

const GramPriceContext = createContext<GramPriceContextType>({
  localCurrencyEnabled: false,
  setLocalCurrencyEnabled: () => {},
  fiatCurrency: 'USD',
  setFiatCurrency: () => {},
  convertPrice: (val) => String(val),
  fiatSymbol: '$',
});

export const useGramPrice = () => useContext(GramPriceContext);

export const GramPriceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { price: tonUsdPrice } = useTonPrice();
  
  const [localCurrencyEnabled, setLocalCurrencyEnabledState] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('tonjam_local_currency_enabled');
      return stored ? JSON.parse(stored) : false;
    } catch {
      return false;
    }
  });

  const [fiatCurrency, setFiatCurrencyState] = useState<string>(() => {
    try {
      return localStorage.getItem('tonjam_preferred_fiat') || 'USD';
    } catch {
      return 'USD';
    }
  });

  const setLocalCurrencyEnabled = (enabled: boolean) => {
    try {
      localStorage.setItem('tonjam_local_currency_enabled', JSON.stringify(enabled));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
    setLocalCurrencyEnabledState(enabled);
  };

  const setFiatCurrency = (currency: string) => {
    try {
      localStorage.setItem('tonjam_preferred_fiat', currency);
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
    setFiatCurrencyState(currency);
  };

  // Realistic fallback of $7.50 per TON/GRAM if API is loading or rate-limited
  const currentTonUsd = tonUsdPrice || 7.50;

  // Simple exchange rates relative to USD
  const rates: Record<string, { rate: number; symbol: string }> = {
    USD: { rate: 1.0, symbol: '$' },
    EUR: { rate: 0.92, symbol: '€' },
    GBP: { rate: 0.78, symbol: '£' },
    RUB: { rate: 90.0, symbol: '₽' },
  };

  const activeRateInfo = rates[fiatCurrency] || rates.USD;
  const fiatSymbol = activeRateInfo.symbol;

  const convertPrice = (tonVal: string | number, hideLabel: boolean = false): string => {
    if (!tonVal && tonVal !== 0) return '';
    
    let numericValue = 0;
    let originalSuffix = ' TON';

    if (typeof tonVal === 'number') {
      numericValue = tonVal;
    } else {
      // Clean string, e.g., "15.0 TON" or "2.5 GRAM" or "342,850 TON"
      const cleanStr = tonVal.replace(/,/g, '').trim();
      const match = cleanStr.match(/^([\d.]+)\s*([a-zA-Z]*)$/);
      if (match) {
        numericValue = parseFloat(match[1]);
        if (match[2]) {
          originalSuffix = ' ' + match[2];
        }
      } else {
        const parsed = parseFloat(cleanStr);
        if (!isNaN(parsed)) {
          numericValue = parsed;
        } else {
          return tonVal; // Cannot parse, return original
        }
      }
    }

    if (!localCurrencyEnabled) {
      if (hideLabel) {
        return numericValue.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 2 });
      }
      return `${numericValue.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 2 })}${originalSuffix}`;
    }

    // Convert: TON -> USD -> target fiat
    const usdVal = numericValue * currentTonUsd;
    const targetVal = usdVal * activeRateInfo.rate;

    const formattedNum = targetVal.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    if (fiatCurrency === 'RUB') {
      return `${formattedNum} ${fiatSymbol}`;
    }
    return `${fiatSymbol}${formattedNum}`;
  };

  return (
    <GramPriceContext.Provider
      value={{
        localCurrencyEnabled,
        setLocalCurrencyEnabled,
        fiatCurrency,
        setFiatCurrency,
        convertPrice,
        fiatSymbol,
      }}
    >
      {children}
    </GramPriceContext.Provider>
  );
};
