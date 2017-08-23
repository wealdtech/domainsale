pragma solidity ^0.4.2;


// Interesting parts of the ENS deed
contract Deed {
    address public owner;
    address public previousOwner;
}

// Interesting parts of the ENS registrar
contract Registrar {
    function transfer(bytes32 _hash, address newOwner);
    function entries(bytes32 _hash) constant returns (uint, Deed, uint, uint, uint);
}

contract DomainSale {
    Registrar public registrar;
    mapping (string => Sale) private sales;
    mapping (address => uint256) private balances;
    
    struct Sale {
        // The lowest auction bid that will be accepted
        uint256 reserve;
        // The lowest outright purchase price that will be accepted
        uint256 price;
        // The last bid on the auction.  0 if no bid has been made
        uint256 lastBid;
        // The address of the last bider on the auction.  0 if no bid has been made
        address lastBidder;
        // The timestamp at which this auction ends
        uint256 auctionEnds;
        // The address of the referrer who started the sale
        address startReferrer;
        // The address of the referrer who supplied the winning bid
        address bidReferrer;
    }

    //
    // Events
    //
    
    // Sent when prices are set for a name
    event Prices(string name, uint256 reserve, uint256 price);
    // Sent when a bid is placed for a name
    event Bid(string name, uint256 bid);
    // Sent when a name is transferred to a new owner
    event Transfer(string name, address from, address to, uint256 value);
    // Sent when a sale for a name is cancelled
    event Cancel(string name);

    //
    // Modifiers
    //

    // Actions that can only be undertaken by the seller of the name.
    // The owner of the name is this contract, so we use the address that
    // gave us the name to sell
    modifier onlyNameSeller(string _name) {
        Deed deed;
        (,deed,,,) = registrar.entries(sha3(_name));
        require(deed.owner() == address(this));
        require(deed.previousOwner() == msg.sender);
        _;
    }
    
    // Actions that can only be undertaken if the name sale has attracted
    // no bids.
    modifier auctionNotStarted(string _name) {
        require(sales[_name].lastBid == 0);
        _;
    }

    /**
     * @dev Constructor takes the address of a registrar,
     *      usually the .eth registrar
     */
    function DomainSale(address _registrar) {
        registrar = Registrar(_registrar);
    }
    
    //
    // Accessors for struct information
    //

    function auctionStarted(string _name) public constant returns (bool) {
        return sales[_name].lastBid != 0;
    }

    function auctionEnds(string _name) public constant returns (uint256) {
        return sales[_name].auctionEnds;
    }

    function balance() public constant returns (uint256) {
        return balances[msg.sender];
    }

    /**
     * @dev minimumBid is the greater of the minimum bid or the last bid + 10%
     */
    function minimumBid(string _name) public constant returns (uint256 minBid) {
        Sale storage s = sales[_name];
        // reserve == 0 means that there is no auction for this name
        // TODO is there a better way of showing this?
        require(s.reserve > 0);

        return s.lastBid == 0 ?
            s.reserve : 
            s.lastBid + s.lastBid / 10;
    }
    
    //
    // Operations
    //

    /**
     * @dev start (or restart) a sale for a domain.
     *      The reserve is the initial lowest price for which a bid can be made.
     *      The price is the price at which a domain can be purchased outright.
     */
    function sell(string _name, uint256 price, uint256 reserve, address referrer) onlyNameSeller(_name) auctionNotStarted(_name) public {
        require(price >= reserve);
        require(price != 0 || reserve != 0);
        Sale storage s = sales[_name];
        s.reserve = reserve; 
        s.price = price; 
        s.startReferrer = referrer; 
        Prices(_name, reserve, price);
    }
    
    /**
     * @dev cancel a sale for a domain.
     *      This can only happen if there have been no bids for the name.
     */
    function cancel(string _name) onlyNameSeller(_name) auctionNotStarted(_name) {
        registrar.transfer(sha3(_name), msg.sender);
        Cancel(_name);
    }

    /**
     * @dev buy a domain outright
     */
    function buy(string _name, address bidReferrer) payable {
        Sale storage s = sales[_name];
        require(s.price > 0 && msg.value >= s.price);
        require(s.lastBid == 0); // Cannot buy if bidding is in progress (TODO: relax this?)

        // Obtain the previous owner from the deed
        Deed deed;
        (,deed,,,) = registrar.entries(sha3(_name));
        address previousOwner = deed.previousOwner();
        
        // Transfer the name
        registrar.transfer(sha3(_name), msg.sender);
        Transfer(_name, previousOwner, msg.sender, msg.value);

        // Distribute funds to referrers
        transferFunds(msg.value, previousOwner, s.startReferrer, bidReferrer);
        clearStorage(_name);
    }

    /**
     * @dev bid for a domain
     */
    function bid(string _name, address bidReferrer) payable {
        require(msg.value > minimumBid(_name));

        Sale storage s = sales[_name];
        require(now < s.auctionEnds);
        
        // Try to return previous bid to its owner
        tryWithdraw();
        
        // TODO what does this do?  Why is it here?
        balances[s.lastBidder] += s.lastBid;

        s.lastBidder = msg.sender;
        s.lastBid = msg.value;
        s.auctionEnds = now + 24 hours;
        s.bidReferrer = bidReferrer;
        Bid(_name, msg.value);
    }
    
    function finalizeAuction(string _name) public {
        Sale storage s = sales[_name];
        require(now > s.auctionEnds);

        // Obtain the previous owner from the deed
        Deed deed;
        (,deed,,,) = registrar.entries(sha3(_name));
        address previousOwner = deed.previousOwner();
        
        registrar.transfer(sha3(_name), s.lastBidder);
        Transfer(_name, previousOwner, s.lastBidder, s.lastBid);

        // Distribute funds to referrers
        transferFunds(s.lastBid, previousOwner, s.startReferrer, s.bidReferrer);
        clearStorage(_name);
    }
    
    // TODO is this internal?  Public?
    function tryWithdraw() {
        uint256 withdrawalAmount = balances[msg.sender];
        balances[msg.sender] = 0;
        // If it cannot withdraw, then revert the change
        if (!msg.sender.send(withdrawalAmount)) balances[msg.sender] = withdrawalAmount;
    }

    //
    // Internal functions
    //

    /**
     * @dev transfer funds for a sale to the relevant parties
     */
    function transferFunds(uint256 amount, address seller, address startReferrer, address bidReferrer) internal {
        // TODO check for either referrer being 0 and redistribute accordingly
        // TODO or should we refuse 0-address referrers?  Would be simpler...
        seller.transfer(amount * 90 / 100);
        startReferrer.transfer(amount * 5 / 100);
        bidReferrer.transfer(amount * 5 / 100);
    }
    
    /**
     * @dev clear the storage for a name
     */
    function clearStorage(string _name) internal {
        // Clear name records
        sales[_name] = Sale({
            reserve: 0, 
            price: 0, 
            lastBid:0, 
            lastBidder:0,
            auctionEnds:0,
            startReferrer: 0,
            bidReferrer: 0
        });
    }
    
}
