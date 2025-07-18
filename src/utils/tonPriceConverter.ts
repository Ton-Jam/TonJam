// src/utils/tonPriceConverter.ts
export async function convertTonToUSD(tonAmount: number): Promise<string> {
  try {
    const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=the-open-network&vs_currencies=usd');
    const data = await res.json();
    const pricePerTon = data['the-open-network'].usd;
    const result = (tonAmount * pricePerTon).toFixed(2);
    return `$${result}`;
  } catch (error) {
    console.error("TON conversion failed:", error);
    return '$0.00';
  }
}
