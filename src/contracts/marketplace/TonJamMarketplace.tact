import "@stdlib/deploy";

// TonJam Marketplace Contract
// Allows users to list, buy, and cancel NFT sales using custodial pattern

struct Listing {
    owner: Address;
    price: Int as coins;
}

message ListNFT {
    query_id: Int as uint64;
    nft_address: Address;
    price: Int as coins;
}

message BuyNFT {
    query_id: Int as uint64;
    nft_address: Address;
}

message CancelSale {
    query_id: Int as uint64;
    nft_address: Address;
}

message OwnershipAssigned {
    query_id: Int as uint64;
    prev_owner: Address;
    forward_payload: Slice as remaining;
}

message Transfer {
    query_id: Int as uint64;
    new_owner: Address;
    response_destination: Address?;
    custom_payload: Cell?;
    forward_amount: Int as coins;
    forward_payload: Slice as remaining;
}

contract TonJamMarketplace with Deployable {
    owner: Address;
    fee_destination: Address;
    fee_percentage: Int as uint16; // e.g., 250 for 2.5%
    listings: map<Address, Listing>;

    init(owner: Address, fee_destination: Address, fee_percentage: Int) {
        self.owner = owner;
        self.fee_destination = fee_destination;
        self.fee_percentage = fee_percentage;
    }

    // Custodial listing: NFT is transferred to the marketplace
    receive(msg: OwnershipAssigned) {
        let nft_address: Address = sender();
        let slice: Slice = msg.forward_payload;
        
        // We expect the price to be in the forward_payload
        if (slice.bits() >= 32) {
            let price: Int = slice.loadCoins();
            self.listings.set(nft_address, Listing{owner: msg.prev_owner, price: price});
        } else {
            // If no price or invalid payload, return the NFT to the previous owner
            send(SendParameters{
                to: nft_address,
                value: 0,
                mode: SendRemainingValue,
                body: Transfer{
                    query_id: msg.query_id,
                    new_owner: msg.prev_owner,
                    response_destination: msg.prev_owner,
                    custom_payload: null,
                    forward_amount: 0,
                    forward_payload: emptySlice()
                }.toCell()
            });
        }
    }

    receive(msg: BuyNFT) {
        let ctx: Context = context();
        let listing: Listing? = self.listings.get(msg.nft_address);
        require(listing != null, "NFT not listed");
        let l: Listing = listing!!;
        require(ctx.value >= l.price, "Insufficient funds");
        
        let fee: Int = (l.price * self.fee_percentage) / 10000;
        let seller_amount: Int = l.price - fee;

        // Transfer funds to seller
        send(SendParameters{
            to: l.owner,
            value: seller_amount,
            mode: SendPayGasSeparately
        });

        // Transfer fee to platform
        send(SendParameters{
            to: self.fee_destination,
            value: fee,
            mode: SendPayGasSeparately
        });

        // Transfer NFT to buyer
        send(SendParameters{
            to: msg.nft_address,
            value: 0,
            mode: SendRemainingValue,
            body: Transfer{
                query_id: msg.query_id,
                new_owner: ctx.sender,
                response_destination: ctx.sender,
                custom_payload: null,
                forward_amount: 0,
                forward_payload: emptySlice()
            }.toCell()
        });
        
        // Remove listing
        self.listings.set(msg.nft_address, null);
    }

    receive(msg: CancelSale) {
        let ctx: Context = context();
        let listing: Listing? = self.listings.get(msg.nft_address);
        require(listing != null, "NFT not listed");
        let l: Listing = listing!!;
        require(ctx.sender == l.owner || ctx.sender == self.owner, "Unauthorized");

        // Return NFT to owner
        send(SendParameters{
            to: msg.nft_address,
            value: 0,
            mode: SendRemainingValue,
            body: Transfer{
                query_id: msg.query_id,
                new_owner: l.owner,
                response_destination: l.owner,
                custom_payload: null,
                forward_amount: 0,
                forward_payload: emptySlice()
            }.toCell()
        });

        // Remove listing
        self.listings.set(msg.nft_address, null);
    }

    get fun get_listing(nft_address: Address): Listing? {
        return self.listings.get(nft_address);
    }

    get fun get_marketplace_data(): Cell {
        return beginCell()
            .storeAddress(self.owner)
            .storeAddress(self.fee_destination)
            .storeUint(self.fee_percentage, 16)
            .endCell();
    }
}
