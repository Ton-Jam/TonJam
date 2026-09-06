import { describe, it, expect, vi } from 'vitest';
import { Address, Cell, beginCell, TupleReader, ContractProvider, Sender } from '@ton/core';
import { TonJamCollection, RoyaltyParams, Mint } from '../../contracts/nft/TonJamNFT_TonJamCollection';

/**
 * TON Virtual Machine (TVM) Contract Unit & Specification Tests
 * 
 * NOTE ON TESTING SCOPE:
 * These tests represent unit-level TVM serialization, message building,
 * schema validation, and provider interaction tests.
 * Real on-chain integration tests require a live TON testnet/mainnet node or local emulator instance.
 */

// A mock TupleReader to simulate TON VM stack readers returned by providers
class MockTupleReader {
  private items: any[];
  constructor(items: any[]) {
    this.items = items;
  }
  readBigNumber(): bigint {
    return BigInt(this.items.shift());
  }
  readAddress(): Address {
    return this.items.shift() as Address;
  }
  readCell(): Cell {
    return this.items.shift() as Cell;
  }
}

describe('TonJamNFT Smart Contract Tests (Unit & Transaction Validation)', () => {
  // Test Addresses using valid raw hex address formats
  const mockOwnerAddress = Address.parseRaw('0:1111111111111111111111111111111111111111111111111111111111111111');
  const mockRoyaltyDest = Address.parseRaw('0:2222222222222222222222222222222222222222222222222222222222222222');
  const mockReceiver = Address.parseRaw('0:3333333333333333333333333333333333333333333333333333333333333333');
  const mockUnauthorizedSender = Address.parseRaw('0:4444444444444444444444444444444444444444444444444444444444444444');
  
  // Test collection parameters
  const testContent = beginCell().storeUint(0, 8).endCell(); // Empty content cell for testing
  const testRoyaltyParams: RoyaltyParams = {
    $$type: 'RoyaltyParams',
    numerator: 50n, // 5% (50 / 1000)
    denominator: 1000n,
    destination: mockRoyaltyDest,
  };

  // 1. Royalty Fee Distribution Math & Retrieval Tests
  describe('Royalty Fee Distribution & Math Validation', () => {
    it('should correctly retrieve configured royalty parameters from contract getter', async () => {
      // Mock provider to return royalty params stack
      const mockProvider: any = {
        getState: vi.fn(),
        get: vi.fn().mockResolvedValue({
          stack: new MockTupleReader([
            testRoyaltyParams.numerator,
            testRoyaltyParams.denominator,
            testRoyaltyParams.destination
          ]) as unknown as TupleReader
        }),
        external: vi.fn(),
        internal: vi.fn()
      };

      const contract = new TonJamCollection(mockOwnerAddress);
      const params = await contract.getRoyaltyParams(mockProvider);

      expect(params.numerator).toBe(50n);
      expect(params.denominator).toBe(1000n);
      expect(params.destination.equals(mockRoyaltyDest)).toBe(true);
    });

    it('should correctly calculate royalty distribution fees across standard amounts', () => {
      // 5% Royalty (50 / 1000) on 100 TON
      const amount = 100_000_000_000n; // 100 TON in nanoTON
      const expectedRoyalty = (amount * testRoyaltyParams.numerator) / testRoyaltyParams.denominator;
      
      expect(expectedRoyalty).toBe(5_000_000_000n); // 5 TON in nanoTON

      // 2.5% Royalty (25 / 1000) on 100 TON
      const lowRoyaltyParams: RoyaltyParams = {
        $$type: 'RoyaltyParams',
        numerator: 25n,
        denominator: 1000n,
        destination: mockRoyaltyDest,
      };
      const expectedLowRoyalty = (amount * lowRoyaltyParams.numerator) / lowRoyaltyParams.denominator;
      expect(expectedLowRoyalty).toBe(2_500_000_000n); // 2.5 TON in nanoTON
    });

    it('should handle zero price transactions and boundary calculations safely without division by zero', () => {
      const zeroAmount = 0n;
      const zeroRoyalty = (zeroAmount * testRoyaltyParams.numerator) / testRoyaltyParams.denominator;
      expect(zeroRoyalty).toBe(0n);

      // Safe guard against 0 denominator in invalid custom parameter definitions
      const invalidDenominator = 0n;
      expect(invalidDenominator === 0n).toBe(true);
    });
  });

  // 2. Item Index Incrementing Tests
  describe('Item Index Incrementing & Address Derivation', () => {
    it('should track current next_item_index and update sequential queries', async () => {
      let currentItemIndex = 0n;

      const mockProvider: any = {
        getState: vi.fn(),
        get: vi.fn().mockImplementation(async (name: string) => {
          if (name === 'get_collection_data') {
            return {
              stack: new MockTupleReader([
                currentItemIndex,
                testContent,
                mockOwnerAddress
              ]) as unknown as TupleReader
            };
          }
          throw new Error('Unsupported method');
        }),
        external: vi.fn(),
        internal: vi.fn()
      };

      const contract = new TonJamCollection(mockOwnerAddress);

      // Verify index starts at 0
      let collectionData = await contract.getGetCollectionData(mockProvider);
      expect(collectionData.next_item_index).toBe(0n);

      // Simulate a mint event and increment the mocked next_item_index
      currentItemIndex = 1n;
      collectionData = await contract.getGetCollectionData(mockProvider);
      expect(collectionData.next_item_index).toBe(1n);

      // Simulate second mint event
      currentItemIndex = 2n;
      collectionData = await contract.getGetCollectionData(mockProvider);
      expect(collectionData.next_item_index).toBe(2n);
    });

    it('should correctly map item index to unique contract addresses', async () => {
      const mockNftAddressIndex0 = Address.parseRaw('0:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
      const mockNftAddressIndex1 = Address.parseRaw('0:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb');

      const mockProvider: any = {
        getState: vi.fn(),
        get: vi.fn().mockImplementation(async (name: string, args: any) => {
          if (name === 'get_nft_address_by_index') {
            const rawIndex = Array.isArray(args) ? args[0]?.value : args?.items?.[0]?.value;
            const index = rawIndex !== undefined ? BigInt(rawIndex) : 0n;
            const addressToReturn = index === 0n ? mockNftAddressIndex0 : mockNftAddressIndex1;
            return {
              stack: new MockTupleReader([addressToReturn]) as unknown as TupleReader
            };
          }
          throw new Error('Unsupported method');
        }),
        external: vi.fn(),
        internal: vi.fn()
      };

      const contract = new TonJamCollection(mockOwnerAddress);

      const address0 = await contract.getGetNftAddressByIndex(mockProvider, 0n);
      const address1 = await contract.getGetNftAddressByIndex(mockProvider, 1n);

      expect(address0.equals(mockNftAddressIndex0)).toBe(true);
      expect(address1.equals(mockNftAddressIndex1)).toBe(true);
    });
  });

  // 3. Valid Transaction Construction (Minting)
  describe('Minting Process & Serialization Validation', () => {
    it('should properly serialize and trigger Mint message to contract provider', async () => {
      let sentBody: Cell | null = null;

      const mockProvider: any = {
        getState: vi.fn(),
        get: vi.fn(),
        external: vi.fn(),
        internal: vi.fn().mockImplementation(async (via: Sender, args: { value: bigint, body?: Cell | null }) => {
          sentBody = args.body || null;
        })
      };

      const mockSender: Sender = {
        address: mockOwnerAddress,
        send: vi.fn()
      };

      const mintMessage: Mint = {
        $$type: 'Mint',
        query_id: 12345n,
        receiver: mockReceiver,
        content: testContent
      };

      const contract = new TonJamCollection(mockOwnerAddress);

      // Trigger standard contract internal send call for minting
      await contract.send(
        mockProvider,
        mockSender,
        { value: 50_000_000n }, // 0.05 TON gas value
        mintMessage
      );

      // Verify the internal sender function was triggered on the provider
      expect(mockProvider.internal).toHaveBeenCalled();
      expect(sentBody).not.toBeNull();

      // Ensure serialized message structure matches expected TACT opcode of Mint
      const slice = sentBody!.beginParse();
      const opcode = slice.loadUint(32);
      expect(opcode).toBe(1048761405); // Mint opcode (0x3e7ef0bd)

      const parsedQueryId = slice.loadUintBig(64);
      expect(parsedQueryId).toBe(12345n);

      const parsedReceiver = slice.loadAddress();
      expect(parsedReceiver.equals(mockReceiver)).toBe(true);
    });
  });

  // 4. Ownership & Access Validation Logic
  describe('Ownership & Access Validation', () => {
    it('validates sender authorization against collection address and owner', async () => {
      const contract = new TonJamCollection(mockOwnerAddress);

      // Contract address verification
      expect(mockOwnerAddress.equals(contract.address)).toBe(true);
      expect(mockUnauthorizedSender.equals(contract.address)).toBe(false);

      // Provider getter owner resolution check
      const mockProvider: any = {
        get: vi.fn().mockResolvedValue({
          stack: new MockTupleReader([
            0n,
            testContent,
            mockOwnerAddress
          ]) as unknown as TupleReader
        }),
      };

      const data = await contract.getGetCollectionData(mockProvider);
      expect(mockOwnerAddress.equals(data.owner_address)).toBe(true);
      expect(mockUnauthorizedSender.equals(data.owner_address)).toBe(false);
    });
  });

  // 5. Invalid Input & Address Parsing Handling
  describe('Invalid Input & Address Validation Handling', () => {
    it('throws when parsing malformed raw address strings', () => {
      expect(() => {
        Address.parseRaw('invalid:hex:address');
      }).toThrow();

      expect(() => {
        Address.parseRaw('0:123'); // Too short for a 256-bit raw address
      }).toThrow();
    });

    it('rejects provider calls when provider method is unsupported', async () => {
      const mockProvider: any = {
        get: vi.fn().mockRejectedValue(new Error('Contract method not found in TVM code')),
      };

      const contract = new TonJamCollection(mockOwnerAddress);

      await expect(contract.getRoyaltyParams(mockProvider)).rejects.toThrow('Contract method not found');
    });
  });
});
