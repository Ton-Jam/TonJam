import { describe, it, expect, vi } from 'vitest';
import { 
  verifyPartnershipContributionOnChain, 
  getTonEndpoint, 
  validateMainnetAddress, 
  TON_NETWORK_MODE, 
  PARTNERSHIP_TREASURY_ADDRESS 
} from '../services/tonService';
import { CACHE_CONFIG, CORE_UI_ASSETS } from '../registerServiceWorker';

// Mock TonClient and Address from @ton/ton
vi.mock('@ton/ton', async () => {
  function MockTonClient() {
    return {
      getTransactions: vi.fn().mockImplementation(async (addr: any) => {
        return [
          {
            hash: () => ({ toString: () => 'mock_tx_hash_1234567890' }),
            description: { type: 'generic', aborted: false },
            inMessage: {
              info: {
                type: 'internal',
                src: 'EQB3ncyBUTjZUA5EnFKR5_EnOMI9V1tTEAAPaiU71gc4TiUt',
                dest: 'UQD_VZD-zU7IQ4nLBDPssEzApiFbWpV6lSmkmybWxgzLFkEr',
                value: { coins: BigInt(25000000000) } // 25 TON in nanotons
              },
              body: {
                beginParse: () => ({
                  remainingBits: 64,
                  loadUint: () => 0, // opcode 0 for text comment
                  loadStringTail: () => 'TonJam Treasury Partnership: TJ-PARTNER-VALID-123'
                }),
                toBoc: () => ({ toString: () => 'TonJam Treasury Partnership: TJ-PARTNER-VALID-123' })
              }
            }
          }
        ];
      })
    };
  }

  return {
    Address: {
      parse: (addrStr: string) => {
        if (!addrStr || typeof addrStr !== 'string' || addrStr.includes('INVALID')) {
          throw new Error("Invalid address format");
        }
        return {
          equals: (other: any) => {
            if (!other) return false;
            const otherStr = typeof other === 'string' ? other : (other.toRawString ? other.toRawString() : String(other));
            return otherStr === addrStr;
          },
          toRawString: () => addrStr,
          toString: () => addrStr
        };
      }
    },
    TonClient: MockTonClient
  };
});

// Mock firebase firestore
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  doc: vi.fn(),
  getDoc: vi.fn(),
  runTransaction: vi.fn().mockImplementation(async (db, cb) => {
    return cb({
      get: vi.fn().mockResolvedValue({ exists: () => false }),
      set: vi.fn()
    });
  }),
  getDocs: vi.fn().mockResolvedValue({ docs: [] })
}));

vi.mock('../lib/firebase', () => ({
  db: {}
}));

describe('TON Partnership Transaction Verification Unit Tests', () => {
  const treasuryAddr = PARTNERSHIP_TREASURY_ADDRESS;
  const validSender = 'EQB3ncyBUTjZUA5EnFKR5_EnOMI9V1tTEAAPaiU71gc4TiUt';
  const nanotons25 = '25000000000';

  it('1. verifies a valid mainnet transaction with matching sender, recipient, nanotons, and memo', async () => {
    const res = await verifyPartnershipContributionOnChain(
      'TJ-PARTNER-VALID-123',
      nanotons25,
      treasuryAddr,
      validSender
    );

    expect(res.verified).toBe(true);
    expect(res.status).toBe('verified');
    expect(res.txHash).toBe('mock_tx_hash_1234567890');
  });

  it('2. confirms TON network mode is mainnet exclusively', () => {
    expect(TON_NETWORK_MODE).toBe('mainnet');
    expect(getTonEndpoint()).toContain('toncenter.com/api/v2/jsonRPC');
  });

  it('3. rejects verification if expected sender address parameter is missing', async () => {
    const res = await verifyPartnershipContributionOnChain(
      'TJ-PARTNER-VALID-123',
      nanotons25,
      treasuryAddr,
      ''
    );

    expect(res.verified).toBe(false);
    expect(res.status).toBe('unverified');
    expect(res.message).toContain('Expected sender wallet address is required');
  });

  it('4. rejects verification if expected sender address does not match', async () => {
    const wrongSender = 'EQD_WRONG_SENDER_ADDRESS_1234567890';
    const res = await verifyPartnershipContributionOnChain(
      'TJ-PARTNER-VALID-123',
      nanotons25,
      treasuryAddr,
      wrongSender
    );

    expect(res.verified).toBe(false);
    expect(res.status).toBe('pending');
  });

  it('5. rejects verification if treasury receiving address format is invalid', async () => {
    const res = await verifyPartnershipContributionOnChain(
      'TJ-PARTNER-VALID-123',
      nanotons25,
      'INVALID_ADDRESS_FORMAT',
      validSender
    );

    expect(res.verified).toBe(false);
    expect(res.status).toBe('unverified');
    expect(res.message).toContain('Invalid treasury receiving address');
  });

  it('6. rejects verification if nanotons amount does not match exactly', async () => {
    const wrongAmount = '10000000000'; // 10 TON instead of 25 TON
    const res = await verifyPartnershipContributionOnChain(
      'TJ-PARTNER-VALID-123',
      wrongAmount,
      treasuryAddr,
      validSender
    );

    expect(res.verified).toBe(false);
    expect(res.status).toBe('pending');
  });

  it('7. rejects verification if payment reference memo does not match', async () => {
    const wrongRef = 'TJ-PARTNER-WRONG-REF';
    const res = await verifyPartnershipContributionOnChain(
      wrongRef,
      nanotons25,
      treasuryAddr,
      validSender
    );

    expect(res.verified).toBe(false);
    expect(res.status).toBe('pending');
  });

  it('8. validates mainnet address format helper', () => {
    expect(validateMainnetAddress(PARTNERSHIP_TREASURY_ADDRESS)).toBe(true);
    expect(validateMainnetAddress('INVALID_ADDRESS')).toBe(false);
  });
});

describe('Service Worker Configuration Unit Tests', () => {
  it('defines valid core UI assets for precaching', () => {
    expect(CORE_UI_ASSETS).toContain('/index.html');
    expect(CORE_UI_ASSETS).toContain('/manifest.json');
    expect(CACHE_CONFIG.strategy).toBe('network-first-shell');
  });
});
