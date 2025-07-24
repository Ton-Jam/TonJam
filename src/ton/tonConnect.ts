// src/ton/tonConnect.ts
import { TonConnect } from '@tonconnect/sdk';

export const tonConnect = new TonConnect({
  manifestUrl: 'http://localhost:5173/tonconnect-manifest.json',
});
