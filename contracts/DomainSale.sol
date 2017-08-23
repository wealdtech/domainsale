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
    mapping (string => name) private names;
    mapping (address => uint256) private balances;
    
    // Sent when prices are set for a name
    event Prices(string name, uint256 reserve, uint256 price);
    // Sent when a bid is placed for a name
    event Bid(string name, uint256 bid);
    // Sent when a name is transferred to a new owner
    event Transfer(string name, address from, address to, uint256 value);
    // Sent when a sale for a name is cancelled
    event Cancel(string name);
    
    struct name {
        uint256 instantPrice;
        uint256 reserve;
        uint256 biddingStarted;
        uint256 lastBid;
        address lastBidder;
        uint256 biddingEnds;
        address startReferrer;
        address bidReferrer;
    }
    
    modifier onlyNameSeller(string _name) {
        Deed deed;
        (,deed,,,) = registrar.entries(sha3(_name));
        require(deed.owner() == address(this));
        require(deed.previousOwner() == msg.sender);
        _;
    }
    
    modifier biddingNotStarted(string _name) {
        require(names[_name].biddingStarted == 0);
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
    // Accessors for structure information
    //

    function biddingStarted(string _name) public constant returns(uint256) {
        return names[_name].biddingStarted;
    }

    function balance() public constant returns (uint256) {
        return balances[msg.sender];
    }

    /**
     * @dev minimumBid is the greater of the minimum bid or the last bid + 10%
     */
    function minimumBid(string _name) constant returns (uint256 minBid) {
        name storage n = names[_name];

        // TODO require(n.reserve > 0)?
        // otherwise a sale without an auction component will return 0

        return n.biddingStarted == 0 ?
            n.reserve : 
            n.lastBid + n.lastBid / 10;
    }
    
    /**
     * @dev start (or restart) a sale for a domain.
     *      The reserve is the initial lowest price for which a bid can be made.
     *      The price is the price at which a domain can be purchased outright.
     */
    function startSale(string _name, uint256 reserve, uint256 price, address referrer) onlyNameSeller(_name) biddingNotStarted(_name) public {
        require(price >= reserve);
        name storage n = names[_name];
        n.reserve = reserve; 
        n.instantPrice = price; 
        n.startReferrer = referrer; 
        Prices(_name, reserve, price);
    }
    
    function cancel(string _name) onlyNameSeller(_name) biddingNotStarted(_name) {
        registrar.transfer(sha3(_name), msg.sender);
        Cancel(_name);
    }

    /**
     * @dev buy a domain outright
     */
    function buy(string _name, address bidReferrer) payable {
        require(msg.value >= names[_name].instantPrice);
        name storage n = names[_name];
        require(n.biddingStarted == 0); // Cannot buy if bidding is in progress (TODO: why not?)

        // Obtain the previous owner from the deed
        Deed deed;
        (,deed,,,) = registrar.entries(sha3(_name));
        address previousOwner = deed.previousOwner();
        
        registrar.transfer(sha3(_name), msg.sender);
        Transfer(_name, previousOwner, msg.sender, msg.value);

        // Distribute funds to referrers
        transferFunds(msg.value, previousOwner, n.startReferrer, bidReferrer);
        clearStorage(_name);
    }

    /**
     * @dev bid for a domain
     */
    function bid(string _name, address bidReferrer) payable {
        require(msg.value > minimumBid(_name));

        name storage n = names[_name];
        require(now < n.biddingEnds);
        
        // Try to return previous bid to its owner
        tryWithdraw();
        
        // TODO what does this do?  Why is it here?
        balances[n.lastBidder] += n.lastBid;

        if (n.biddingStarted == 0) n.biddingStarted = now;
        n.lastBidder = msg.sender;
        n.lastBid = msg.value;
        n.biddingEnds = now + 24 hours;
        n.bidReferrer = bidReferrer;
        Bid(_name, msg.value);
    }
    
    function finalizeAuction(string _name) public {
        name storage n = names[_name];
        require(now > n.biddingEnds);

        // Obtain the previous owner from the deed
        Deed deed;
        (,deed,,,) = registrar.entries(sha3(_name));
        address previousOwner = deed.previousOwner();
        
        registrar.transfer(sha3(_name), n.lastBidder);
        Transfer(_name, previousOwner, n.lastBidder, n.lastBid);

        // Distribute funds to referrers
        transferFunds(n.lastBid, previousOwner, n.startReferrer, n.bidReferrer);
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
        seller.transfer(amount * 90 / 100);
        startReferrer.transfer(amount * 5 / 100);
        bidReferrer.transfer(amount * 5 / 100);
    }
    
    /**
     * @dev clear the storage for a name
     */
    function clearStorage(string _name) internal {
        // Clear name records
        names[_name] = name({
            instantPrice: 0, 
            reserve: 0, 
            biddingStarted: 0, 
            lastBid:0, 
            lastBidder:0,
            biddingEnds:0,
            startReferrer: 0,
            bidReferrer: 0
        });
    }
    
}
