import "@stdlib/deploy";

// TonJam Marketplace Contract
// Allows users to list, buy, and cancel NFT sales using custodial pattern

struct Listing {
    owner: Address;
    price: Int as coins;
}

struct Auction {
    seller: Address;
    highestBidder: Address?;
    highestBid: Int as coins;
    endTime: Int as uint64;
}

struct NFTHistory {
    previous_owner: Address;
    forward_payload: Cell;
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

message StartAuction {
    query_id: Int as uint64;
    nft_address: Address;
    startPrice: Int as coins;
    duration: Int as uint64;
}

message PlaceBid {
    query_id: Int as uint64;
    nft_address: Address;
}

message ResolveAuction {
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
    auctions: map<Address, Auction>;
    nft_histories: map<Address, NFTHistory>;

    init(owner: Address, fee_destination: Address, fee_percentage: Int) {
        self.owner = owner;
        self.fee_destination = fee_destination;
        self.fee_percentage = fee_percentage;
    }

    // Custodial listing: NFT is transferred to the marketplace
    receive(msg: OwnershipAssigned) {
        let nft_address: Address = sender();
        let payload: Cell = beginCell().storeSlice(msg.forward_payload).endCell();
        self.nft_histories.set(nft_address, NFTHistory{previous_owner: msg.prev_owner, forward_payload: payload});

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
        
        // Base Price P = l.price
        // Buyer pays P + 5% = P * 105 / 100
        let required_value: Int = (l.price * 105) / 100;
        require(ctx.value >= required_value, "Insufficient funds including buyer fee");
        
        // Platform gets 10% (5% from buyer + 5% from seller)
        let platform_fee: Int = (l.price * 10) / 100;
        // Seller gets 95% (Price - 5% fee)
        let seller_amount: Int = (l.price * 95) / 100;

        // Transfer funds to seller
        send(SendParameters{
            to: l.owner,
            value: seller_amount,
            mode: SendPayGasSeparately
        });

        // Transfer fee to platform
        send(SendParameters{
            to: self.fee_destination,
            value: platform_fee,
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

    receive(msg: StartAuction) {
        let ctx: Context = context();
        let history: NFTHistory? = self.nft_histories.get(msg.nft_address);
        require(history != null, "NFT not held by marketplace");
        
        // Ensure not already listed
        require(self.listings.get(msg.nft_address) == null, "NFT already listed for sale");
        
        // Ensure not already an auction
        require(self.auctions.get(msg.nft_address) == null, "NFT already in auction");

        let h: NFTHistory = history!!;
        require(ctx.sender == h.previous_owner || ctx.sender == self.owner, "Unauthorized");

        self.auctions.set(msg.nft_address, Auction{
            seller: h.previous_owner,
            highestBidder: null,
            highestBid: msg.startPrice,
            endTime: now() + msg.duration
        });
    }

    receive(msg: PlaceBid) {
        let ctx: Context = context();
        let auction: Auction? = self.auctions.get(msg.nft_address);
        require(auction != null, "Auction not found");
        let a: Auction = auction!!;
        require(now() < a.endTime, "Auction ended");
        require(ctx.value > a.highestBid, "Bid too low");

        // Refund previous bidder
        if (a.highestBidder != null) {
            send(SendParameters{
                to: a.highestBidder!!,
                value: a.highestBid,
                mode: SendPayGasSeparately
            });
        }

        // Update auction
        self.auctions.set(msg.nft_address, Auction{
            seller: a.seller,
            highestBidder: ctx.sender,
            highestBid: ctx.value,
            endTime: a.endTime
        });
    }

    receive(msg: ResolveAuction) {
        let ctx: Context = context();
        let auction: Auction? = self.auctions.get(msg.nft_address);
        require(auction != null, "Auction not found");
        let a: Auction = auction!!;
        require(now() >= a.endTime, "Auction not ended");

        if (a.highestBidder == null) {
            // No bids, return to seller
            send(SendParameters{
                to: msg.nft_address,
                value: 0,
                mode: SendRemainingValue,
                body: Transfer{
                    query_id: msg.query_id,
                    new_owner: a.seller,
                    response_destination: a.seller,
                    custom_payload: null,
                    forward_amount: 0,
                    forward_payload: emptySlice()
                }.toCell()
            });
        } else {
            // Transfer to winner
            let b: Address = a.highestBidder!!;
            
            // For auctions, the highestBid is what the winner sent (including buyer fee if we treated it that way)
            // But usually the bidder sends exactly what they bid.
            // If bid = 100, we want 10 to platform and 90 to seller? No, prompt says 5% + 5% = 10%.
            // Let's stick to the same ratio.
            // If highestBid is T (Total), then Base P = T / 1.05
            // platform_fee = P * 0.10
            // seller_amount = P * 0.95
            
            let base_price: Int = (a.highestBid * 100) / 105;
            let platform_fee: Int = (base_price * 10) / 100;
            let seller_amount: Int = a.highestBid - platform_fee; 

            send(SendParameters{
                to: a.seller,
                value: seller_amount,
                mode: SendPayGasSeparately
            });
            send(SendParameters{
                to: self.fee_destination,
                value: platform_fee,
                mode: SendPayGasSeparately
            });
            
            send(SendParameters{
                to: msg.nft_address,
                value: 0,
                mode: SendRemainingValue,
                body: Transfer{
                    query_id: msg.query_id,
                    new_owner: b,
                    response_destination: b,
                    custom_payload: null,
                    forward_amount: 0,
                    forward_payload: emptySlice()
                }.toCell()
            });
        }
        
        // Remove auction
        self.auctions.set(msg.nft_address, null);
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
