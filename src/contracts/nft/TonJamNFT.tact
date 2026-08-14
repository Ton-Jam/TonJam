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

message(0x5fcc3d14) Transfer {
    query_id: Int as uint64;
    new_owner: Address;
    response_destination: Address?;
    custom_payload: Cell?;
    forward_amount: Int as coins;
    forward_payload: Slice as remaining;
}

message(0x05138d91) OwnershipAssigned {
    query_id: Int as uint64;
    prev_owner: Address;
    forward_payload: Slice as remaining;
}

message(0xd53276db) Excesses {
    query_id: Int as uint64;
}

message(0x2fcb26a2) GetStaticData {
    query_id: Int as uint64;
}

message(0x8b771345) ReportStaticData {
    query_id: Int as uint64;
    index_id: Int as uint256;
    collection: Address;
}

message Mint {
    query_id: Int as uint64;
    receiver: Address;
    content: Cell;
}

message(0x5a2d67ef) StakeNFT {
    query_id: Int as uint64;
    lock_period: Int as uint32;
}

message(0x738d22ef) UnstakeNFT {
    query_id: Int as uint64;
}

message(0x3a19e8fc) ClaimStakingRewards {
    query_id: Int as uint64;
}

struct StakingInfo {
    is_staked: Bool;
    staked_at: Int;
    lock_period: Int;
    staked_owner: Address?;
}

struct CollectionData {
    next_item_index: Int;
    collection_content: Cell;
    owner_address: Address;
}

struct GetNftData {
    is_initialized: Bool;
    index: Int;
    collection_address: Address;
    owner_address: Address;
    individual_content: Cell;
    original_owner: Address;
    previous_owner: Address?;
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
        
        let nft_init: StateInit = self.getNftItemInit(self.next_item_index);
        send(SendParameters{
            to: contractAddress(nft_init),
            value: 0,
            bounce: false,
            mode: SendRemainingValue,
            body: Transfer{
                query_id: msg.query_id,
                new_owner: msg.receiver,
                response_destination: self.owner,
                custom_payload: emptyCell(),
                forward_amount: 0,
                forward_payload: emptySlice()
            }.toCell(),
            code: nft_init.code,
            data: nft_init.data
        });

        self.next_item_index = self.next_item_index + 1;
    }

    get fun get_collection_data(): CollectionData {
        return CollectionData{
            next_item_index: self.next_item_index,
            collection_content: self.content,
            owner_address: self.owner
        };
    }

    get fun get_nft_address_by_index(item_index: Int): Address {
        let init: StateInit = self.getNftItemInit(item_index);
        return contractAddress(init);
    }

    fun getNftItemInit(item_index: Int): StateInit {
        return initOf TonJamNFTItem(self.owner, myAddress(), item_index, self.content);
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
    original_owner: Address;
    previous_owner: Address?;
    collection_address: Address;
    item_index: Int as uint64;
    content: Cell;
    is_initialized: Bool;
    is_staked: Bool;
    staked_at: Int as uint64;
    lock_period: Int as uint32;
    staked_owner: Address?;

    init(owner: Address, collection_address: Address, item_index: Int, content: Cell) {
        self.owner = owner;
        self.original_owner = owner;
        self.previous_owner = null;
        self.collection_address = collection_address;
        self.item_index = item_index;
        self.content = content;
        self.is_initialized = false;
        self.is_staked = false;
        self.staked_at = 0;
        self.lock_period = 0;
        self.staked_owner = null;
    }

    receive(msg: Transfer) {
        let ctx: Context = context();
        
        if (!self.is_initialized) {
            require(ctx.sender == self.collection_address, "Only collection can initialize");
            self.is_initialized = true;
            self.owner = msg.new_owner;
        } else {
            require(ctx.sender == self.owner, "Only owner can transfer");
            self.previous_owner = self.owner;
            self.owner = msg.new_owner;
        }

        if (msg.forward_amount > 0) {
            send(SendParameters{
                to: msg.new_owner,
                value: msg.forward_amount,
                mode: SendPayGasSeparately,
                body: OwnershipAssigned{
                    query_id: msg.query_id,
                    prev_owner: ctx.sender,
                    forward_payload: msg.forward_payload
                }.toCell()
            });
        }

        if (msg.response_destination != null) {
            send(SendParameters{
                to: msg.response_destination!!,
                value: 0,
                mode: SendRemainingValue,
                body: Excesses{query_id: msg.query_id}.toCell()
            });
        }
    }

    get fun get_nft_data(): GetNftData {
        return GetNftData{
            is_initialized: self.is_initialized,
            index: self.item_index,
            collection_address: self.collection_address,
            owner_address: self.owner,
            individual_content: self.content,
            original_owner: self.original_owner,
            previous_owner: self.previous_owner
        };
    }

    receive(msg: GetStaticData) {
        send(SendParameters{
            to: sender(),
            value: 0,
            mode: SendRemainingValue,
            body: ReportStaticData{
                query_id: msg.query_id,
                index_id: self.item_index,
                collection: self.collection_address
            }.toCell()
        });
    }

    receive(msg: StakeNFT) {
        let ctx: Context = context();
        require(ctx.sender == self.owner, "Only owner can stake NFT");
        require(!self.is_staked, "NFT is already staked");
        
        self.is_staked = true;
        self.staked_at = now();
        self.lock_period = msg.lock_period;
        self.staked_owner = ctx.sender;
    }

    receive(msg: UnstakeNFT) {
        let ctx: Context = context();
        require(self.is_staked, "NFT is not staked");
        require(ctx.sender == self.owner || (self.staked_owner != null && ctx.sender == self.staked_owner!!), "Only staker can unstake");

        self.is_staked = false;
        self.staked_at = 0;
        self.lock_period = 0;
        self.staked_owner = null;
    }

    get fun get_staking_info(): StakingInfo {
        return StakingInfo{
            is_staked: self.is_staked,
            staked_at: self.staked_at,
            lock_period: self.lock_period,
            staked_owner: self.staked_owner
        };
    }
}
