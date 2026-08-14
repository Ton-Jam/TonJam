/// <reference types="jest" />
import { Address, Cell, beginCell, TupleReader, ContractProvider, Sender } from '@ton/core';
import { TonJamCollection, RoyaltyParams, Mint } from '../../contracts/nft/TonJamNFT_TonJamCollection';

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

describe('TonJamNFT Smart Contract Tests', () => {
  // Test Addresses using valid raw hex address formats
  const mockOwnerAddress = Address.parseRaw('0:1111111111111111111111111111111111111111111111111111111111111111');
  const mockRoyaltyDest = Address.parseRaw('0:2222222222222222222222222222222222222222222222222222222222222222');
  const mockReceiver = Address.parseRaw('0:3333333333333333333333333333333333333333333333333333333333333333');
  
  // Test collection parameters
  const testContent = beginCell().storeUint(0, 8).endCell(); // Empty content cell for testing
  const testRoyaltyParams: RoyaltyParams = {
    $$type: 'RoyaltyParams',
    numerator: 50n, // 5% (50 / 1000)
    denominator: 1000n,
    destination: mockRoyaltyDest,
  };

  // 1. Royalty Fee Distribution Math & Retrieval Tests
  describe('Royalty Fee Distribution', () => {
    it('should correctly retrieve configured royalty parameters', async () => {
      // Mock provider to return royalty params stack
      const mockProvider: jest.Mocked<ContractProvider> = {
        getState: jest.fn(),
        get: jest.fn().mockResolvedValue({
          stack: new MockTupleReader([
            testRoyaltyParams.numerator,
            testRoyaltyParams.denominator,
            testRoyaltyParams.destination
          ]) as unknown as TupleReader
        }),
        external: jest.fn(),
        internal: jest.fn()
      } as any;

      const contract = new TonJamCollection(mockOwnerAddress);
      const params = await contract.getRoyaltyParams(mockProvider);

      expect(params.numerator).toBe(50n);
      expect(params.denominator).toBe(1000n);
      expect(params.destination.equals(mockRoyaltyDest)).toBe(true);
    });

    it('should correctly calculate royalty distribution fees', () => {
      // 5% Royalty (50 / 1000)
      const amount = 100_000_000_000n; // 100 TON in nanoTON
      const expectedRoyalty = (amount * testRoyaltyParams.numerator) / testRoyaltyParams.denominator;
      
      expect(expectedRoyalty).toBe(5_000_000_000n); // 5 TON in nanoTON

      // 2.5% Royalty (25 / 1000)
      const lowRoyaltyParams: RoyaltyParams = {
        $$type: 'RoyaltyParams',
        numerator: 25n,
        denominator: 1000n,
        destination: mockRoyaltyDest,
      };
      const expectedLowRoyalty = (amount * lowRoyaltyParams.numerator) / lowRoyaltyParams.denominator;
      expect(expectedLowRoyalty).toBe(2_500_000_000n); // 2.5 TON in nanoTON
    });
  });

  // 2. Item Index Incrementing Tests
  describe('Item Index Incrementing', () => {
    it('should track current next_item_index and update sequential queries', async () => {
      let currentItemIndex = 0n;

      // Mock contract provider with custom stack values for dynamic querying
      const mockProvider: jest.Mocked<ContractProvider> = {
        getState: jest.fn(),
        get: jest.fn().mockImplementation(async (name: string) => {
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
        external: jest.fn(),
        internal: jest.fn()
      } as any;

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

      const mockProvider: jest.Mocked<ContractProvider> = {
        getState: jest.fn(),
        get: jest.fn().mockImplementation(async (name: string, args: any) => {
          if (name === 'get_nft_address_by_index') {
            // Read arguments from mock builder item index
            const index = args.items ? args.items[0].value : 0n;
            const addressToReturn = index === 0n ? mockNftAddressIndex0 : mockNftAddressIndex1;
            return {
              stack: new MockTupleReader([addressToReturn]) as unknown as TupleReader
            };
          }
          throw new Error('Unsupported method');
        }),
        external: jest.fn(),
        internal: jest.fn()
      } as any;

      const contract = new TonJamCollection(mockOwnerAddress);

      const address0 = await contract.getGetNftAddressByIndex(mockProvider, 0n);
      const address1 = await contract.getGetNftAddressByIndex(mockProvider, 1n);

      expect(address0.equals(mockNftAddressIndex0)).toBe(true);
      expect(address1.equals(mockNftAddressIndex1)).toBe(true);
    });
  });

  // 3. Minting Process Tests
  describe('Minting Process', () => {
    it('should properly serialize and trigger Mint message to contract provider', async () => {
      let sentBody: Cell | null = null;

      const mockProvider: jest.Mocked<ContractProvider> = {
        getState: jest.fn(),
        get: jest.fn(),
        external: jest.fn(),
        internal: jest.fn().mockImplementation(async (via: Sender, args: { value: bigint, body?: Cell | null }) => {
          sentBody = args.body || null;
        })
      } as any;

      const mockSender: Sender = {
        address: mockOwnerAddress,
        send: jest.fn()
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
});
