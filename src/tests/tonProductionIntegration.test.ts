import { describe, it, expect, vi } from 'vitest';
import { 
  getActiveTonNetwork,
  validateTonAddress,
  validateMainnetAddress,
  getTonEndpoint,
  getTonViewerUrl,
  getTonScanUrl,
  TON_MAINNET_CONFIG,
  TON_TESTNET_CONFIG,
  PARTNERSHIP_TREASURY_MAINNET,
  PARTNERSHIP_TREASURY_TESTNET,
  verifyWalletNetwork,
  extractTxHashFromBoc,
  createTransactionLifecycleRecord,
  updateTransactionLifecycleState
} from '../services/tonService';
import { PLATFORM_FEE_PERCENTAGE, calculatePlatformFee, calculateArtistRoyalty } from '../services/royaltyService';
import { Cell, toNano, beginCell } from '@ton/ton';

describe('TON Production Integration Phase 2 Unit Tests', () => {
  describe('1. TON Network Configuration & Separation', () => {
    it('provides distinct configurations for Mainnet and Testnet', () => {
      expect(TON_MAINNET_CONFIG.chainId).toBe(-239);
      expect(TON_TESTNET_CONFIG.chainId).toBe(-3);
      
      expect(TON_MAINNET_CONFIG.treasuryAddress).toBe(PARTNERSHIP_TREASURY_MAINNET);
      expect(TON_TESTNET_CONFIG.treasuryAddress).toBe(PARTNERSHIP_TREASURY_TESTNET);
      expect(TON_MAINNET_CONFIG.treasuryAddress).not.toBe(TON_TESTNET_CONFIG.treasuryAddress);

      expect(TON_MAINNET_CONFIG.explorerUrl).toBe('https://tonviewer.com');
      expect(TON_TESTNET_CONFIG.explorerUrl).toBe('https://testnet.tonviewer.com');
      
      expect(TON_MAINNET_CONFIG.endpoint).toContain('toncenter.com/api/v2/jsonRPC');
      expect(TON_TESTNET_CONFIG.endpoint).toContain('testnet.toncenter.com/api/v2/jsonRPC');
    });

    it('generates correct explorer URLs for addresses and transactions per network', () => {
      const mockAddr = 'EQB3ncyBUTjZUA5EnFKR5_EnOMI9V1tTEAAPaiU71gc4TiUt';
      const mockTx = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';

      // Mainnet
      expect(getTonViewerUrl(mockAddr, false, 'mainnet')).toBe(`https://tonviewer.com/${mockAddr}`);
      expect(getTonViewerUrl(mockTx, true, 'mainnet')).toBe(`https://tonviewer.com/transaction/${mockTx}`);
      expect(getTonScanUrl(mockAddr, false, 'mainnet')).toBe(`https://tonscan.org/address/${mockAddr}`);
      expect(getTonScanUrl(mockTx, true, 'mainnet')).toBe(`https://tonscan.org/tx/${mockTx}`);

      // Testnet
      expect(getTonViewerUrl(mockAddr, false, 'testnet')).toBe(`https://testnet.tonviewer.com/${mockAddr}`);
      expect(getTonViewerUrl(mockTx, true, 'testnet')).toBe(`https://testnet.tonviewer.com/transaction/${mockTx}`);
      expect(getTonScanUrl(mockAddr, false, 'testnet')).toBe(`https://testnet.tonscan.org/address/${mockAddr}`);
      expect(getTonScanUrl(mockTx, true, 'testnet')).toBe(`https://testnet.tonscan.org/tx/${mockTx}`);
    });
  });

  describe('2. Address Validation', () => {
    it('validates standard TON addresses', () => {
      const validAddress = 'EQB3ncyBUTjZUA5EnFKR5_EnOMI9V1tTEAAPaiU71gc4TiUt';
      expect(validateTonAddress(validAddress)).toBe(true);
      expect(validateMainnetAddress(validAddress)).toBe(true);
    });

    it('rejects invalid or empty address strings safely without throwing', () => {
      expect(validateTonAddress('')).toBe(false);
      expect(validateTonAddress('not-an-address')).toBe(false);
      expect(validateTonAddress(null as any)).toBe(false);
      expect(validateTonAddress(undefined as any)).toBe(false);
    });
  });

  describe('3. Transaction Hash Extraction from Signed BOC', () => {
    it('correctly calculates 64-character hex transaction hash from Cell BOC', () => {
      // Build a realistic test cell to simulate signed transaction BOC
      const testCell = beginCell()
        .storeUint(0x12345678, 32)
        .storeUint(100, 64)
        .endCell();
      
      const bocBase64 = testCell.toBoc().toString('base64');
      
      // Parse BOC root Cell and derive hash
      const parsedCell = Cell.fromBase64(bocBase64);
      const txHash = parsedCell.hash().toString('hex');

      expect(typeof txHash).toBe('string');
      expect(txHash.length).toBe(64);
      expect(/^[0-9a-f]{64}$/i.test(txHash)).toBe(true);
    });
  });

  describe('4. Marketplace & Royalty Fee Calculations', () => {
    it('standardizes platform fee to exactly 5% across marketplace', () => {
      expect(PLATFORM_FEE_PERCENTAGE).toBe(0.05);

      const price = 100; // 100 TON
      const fee = calculatePlatformFee(price);
      expect(fee).toBe(5); // 5% of 100 = 5 TON
    });

    it('calculates artist royalty accurately with bps precision', () => {
      const price = 50; // 50 TON
      const royaltyBps = 1000; // 10%
      const royaltyAmount = calculateArtistRoyalty(price, royaltyBps);
      expect(royaltyAmount).toBe(5); // 10% of 50 = 5 TON
    });

    it('splits payout correctly between seller, artist royalty, and platform fee', () => {
      const price = 100;
      const platformFee = calculatePlatformFee(price); // 5 TON
      const artistRoyalty = calculateArtistRoyalty(price, 1000); // 10 TON (10%)
      const sellerPayout = price - platformFee - artistRoyalty; // 85 TON

      expect(platformFee).toBe(5);
      expect(artistRoyalty).toBe(10);
      expect(sellerPayout).toBe(85);
      expect(platformFee + artistRoyalty + sellerPayout).toBe(price);
    });
  });

  describe('5. Nanoton Conversion Accuracy', () => {
    it('accurately converts TON to nanotons for on-chain precision', () => {
      const ton1 = 1;
      const nano1 = toNano(ton1.toString());
      expect(nano1.toString()).toBe('1000000000'); // 1e9 nanotons

      const tonHalf = 0.5;
      const nanoHalf = toNano(tonHalf.toString());
      expect(nanoHalf.toString()).toBe('500000000'); // 5e8 nanotons
    });
  });

  describe('6. Wallet Network Mismatch Guards', () => {
    it('rejects Mainnet wallet when app is in Testnet mode', () => {
      const mockMainnetTonConnect: any = {
        wallet: { account: { address: 'EQB3ncyBUTjZUA5EnFKR5_EnOMI9V1tTEAAPaiU71gc4TiUt', chain: '-239' } }
      };
      expect(() => verifyWalletNetwork(mockMainnetTonConnect, 'testnet')).toThrow(/Network mismatch.*Testnet/);
    });

    it('rejects Testnet wallet when app is in Mainnet mode', () => {
      const mockTestnetTonConnect: any = {
        wallet: { account: { address: 'kQB3ncyBUTjZUA5EnFKR5_EnOMI9V1tTEAAPaiU71gc4TiU_', chain: '-3' } }
      };
      expect(() => verifyWalletNetwork(mockTestnetTonConnect, 'mainnet')).toThrow(/Network mismatch.*Mainnet/);
    });

    it('passes when wallet chain matches expected network mode', () => {
      const mockMainnetTonConnect: any = {
        wallet: { account: { address: 'EQB3ncyBUTjZUA5EnFKR5_EnOMI9V1tTEAAPaiU71gc4TiUt', chain: '-239' } }
      };
      expect(() => verifyWalletNetwork(mockMainnetTonConnect, 'mainnet')).not.toThrow();

      const mockTestnetTonConnect: any = {
        wallet: { account: { address: 'kQB3ncyBUTjZUA5EnFKR5_EnOMI9V1tTEAAPaiU71gc4TiU_', chain: '-3' } }
      };
      expect(() => verifyWalletNetwork(mockTestnetTonConnect, 'testnet')).not.toThrow();
    });
  });

  describe('7. Genuine BOC Hash Extraction & Error Handling', () => {
    it('throws descriptive error on missing or empty BOC', () => {
      expect(() => extractTxHashFromBoc('')).toThrow(/valid BOC payload/);
      expect(() => extractTxHashFromBoc(undefined)).toThrow(/valid BOC payload/);
    });

    it('extracts genuine hash from cell BOC', () => {
      const testCell = beginCell().storeUint(42, 32).endCell();
      const boc = testCell.toBoc().toString('base64');
      const hash = extractTxHashFromBoc(boc);
      expect(hash).toBe(testCell.hash().toString('hex'));
      expect(hash.length).toBe(64);
    });
  });

  describe('8. Blockchain Transaction State Lifecycle Management', () => {
    it('creates record with initial "created" state and preserves attributes', () => {
      const record = createTransactionLifecycleRecord('nft_mint', {
        amount: '1.5',
        recipientAddress: 'EQB3ncyBUTjZUA5EnFKR5_EnOMI9V1tTEAAPaiU71gc4TiUt'
      });

      expect(record.status).toBe('created');
      expect(record.type).toBe('nft_mint');
      expect(record.amount).toBe('1.5');
      expect(record.id).toMatch(/^tx_/);
    });

    it('transitions through lifecycle states to confirmed with explorer URLs', () => {
      let record = createTransactionLifecycleRecord('nft_sale', { amount: '5.0' });

      record = updateTransactionLifecycleState(record, 'awaiting_wallet_approval');
      expect(record.status).toBe('awaiting_wallet_approval');

      record = updateTransactionLifecycleState(record, 'submitted');
      expect(record.status).toBe('submitted');

      const mockHash = 'a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0';
      record = updateTransactionLifecycleState(record, 'confirmed', { txHash: mockHash });
      expect(record.status).toBe('confirmed');
      expect(record.txHash).toBe(mockHash);
      expect(record.explorerUrl).toContain(mockHash);
      expect(record.scanUrl).toContain(mockHash);
    });
  });
});
