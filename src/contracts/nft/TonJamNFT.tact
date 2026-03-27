import "@stdlib/deploy";

// NFT Collection Contract
// Based on TON NFT Standard (TEP-62)

struct RoyaltyParams {
    numerator: Int as uint16;
    denominator: Int as uint16;
    destination: Address;
}

message(0x693d3950) GetRoyaltyParams {
    query_id: Int as uint64;
}

message(0xa8981987) ReportRoyaltyParams {
    query_id: Int as uint64;
    numerator: Int as uint16;
    denominator: Int as uint16;
    destination: Address;
}

message Mint {
    query_id: Int as uint64;
    receiver: Address;
    content: Cell;
    royalty_params: RoyaltyParams;
}

contract TonJamCollection with Deployable {
    owner: Address;
    next_item_index: Int as uint64;
    content: Cell;
    royalty_params: RoyaltyParams;

    init(owner: Address, content: Cell, royalty_params: RoyaltyParams) {
        self.owner = owner;
        self.next_item_index = 0;
        self.content = content;
        self.royalty_params = royalty_params;
    }

    receive(msg: Mint) {
        let ctx: Context = context();
        require(ctx.sender == self.owner, "Only owner can mint");
        
        // Mint logic
        let nft_init: StateInit = self.getNftItemInit(self.next_item_index);
        send(SendParameters{
            to: contractAddress(nft_init),
            value: 0,
            bounce: false,
            mode: SendRemainingValue,
            body: beginCell()
                .storeUint(0x5fcc3d14, 32) // Transfer opcode
                .storeUint(msg.query_id, 64)
                .storeAddress(msg.receiver) // New owner
                .storeAddress(self.owner) // Response destination
                .storeBit(false) // Custom payload
                .storeCoins(0) // Forward amount
                .storeBit(false) // Forward payload
                .endCell(),
            code: nft_init.code,
            data: nft_init.data
        });

        self.next_item_index = self.next_item_index + 1;
    }

    get fun get_collection_data(): Cell {
        return beginCell()
            .storeUint(self.next_item_index, 64)
            .storeRef(self.content)
            .storeAddress(self.owner)
            .endCell();
    }

    get fun get_nft_address_by_index(item_index: Int): Address {
        let init: StateInit = self.getNftItemInit(item_index);
        return contractAddress(init);
    }

    fun getNftItemInit(item_index: Int): StateInit {
        return initOf TonJamNFTItem(self.owner, self.owner, item_index, self.content);
    }

    get fun royalty_params(): RoyaltyParams {
        return self.royalty_params;
    }

    receive(msg: GetRoyaltyParams) {
        send(SendParameters{
            to: sender(),
            value: 0,
            mode: SendRemainingValue,
            body: ReportRoyaltyParams{
                query_id: msg.query_id,
                numerator: self.royalty_params.numerator,
                denominator: self.royalty_params.denominator,
                destination: self.royalty_params.destination
            }.toCell()
        });
    }
}

contract TonJamNFTItem {
    owner: Address;
    collection_address: Address;
    item_index: Int as uint64;
    content: Cell;

    init(owner: Address, collection_address: Address, item_index: Int, content: Cell) {
        self.owner = owner;
        self.collection_address = collection_address;
        self.item_index = item_index;
        self.content = content;
    }

    receive(msg: Slice) {
        // Handle transfers and other NFT logic
    }

    get fun get_nft_data(): Cell {
        return beginCell()
            .storeBit(true) // Initialized
            .storeUint(self.item_index, 64)
            .storeAddress(self.collection_address)
            .storeAddress(self.owner)
            .storeRef(self.content)
            .endCell();
    }
}
