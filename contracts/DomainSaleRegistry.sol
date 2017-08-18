pragma solidity ^0.4.11;

import './DomainSaleAgent.sol';

// The important bits of the ENS contract
contract ENS {
    enum Mode { Open, Auction, Owned, Forbidden, Reveal, NotYetAvailable }

    function setResolver(bytes32 node, address resolver);
    function entries(bytes32 _hash) constant returns (Mode, address, uint, uint, uint);
}

contract Deed {
    function owner() returns (bool);
}


contract DomainSaleRegistry {
    // namehash('eth')
    bytes32 constant rootNameHash = 0x93cdeb708b7545dc668eb9280176169d1c33cfd8ed6f04690a0bcc88a93fc4ae;

    struct Sale {
        // The reserve value for this sale (0 == no reserve)
        uint256 reserve;
        // The timestamp at which this sale finishes (0 == never)
        uint256 finishesAt;

        // The bids for the domain
        mapping(address => uint256) bids; // TODO make strut
        // The best bid for this sale
        uint256 bestBid;

        // The deed for the domain
        Deed deed;

        // The sales agent for the domain
        DomainSaleAgent agent;

        // The referer when a sale started
        address startReferer;
    }

    mapping(bytes32 => Sale) sales; // nameHash => Sale

    // The ENS contract
    ENS ens;

    // The domain sale process is as follows:
    //   1) The seller starts the domain sale.  To do this they must set ownership
    //      of the deed to this contract, choose an appropriate method for sale, and
    //      call startSale().
    //      At this point any resolver for the domain will be removed
    //   2) A buyer offers a price for the domain to the sale contract
    //      This might finish the sale immediately or it might not, depending on the
    //      type of process
    //   3) At the end of the auction a completeAuction() call is made that transfers
    //      the deed

    modifier ifBiddingOpen(bytes32 domainNameHash) {
        require(sales[domainNameHash].agent.bidding(domainNameHash) == DomainSaleAgent.Bidding.Open);
        _;
    }

    modifier ifSaleHasNoBids(bytes32 domainNameHash) {
        require(sales[domainNameHash].agent.hasBids(domainNameHash) == false);
        _;
    }

    function DomainSaleRegistry(ENS _ens) {
        ens = _ens;
    }

    /**
     * @dev Start a domain sale.
     * @param domain domain for sale (e.g. 'mydomain' if selling 'mydomain.eth')
     * @param salesagent the address of the sales agent to be used for the sale
     * @param referer a referer who can claim some of the sale value
     */
    function startSale(string domain, DomainSaleAgent salesagent, address referer) {
        bytes32 domainNameHash = sha3(rootNameHash, sha3(domain));

        // Ensure that this sale is not currently running
        require(sales[domainNameHash].reserve == 0 || sales[domainNameHash].finishesAt == 0);
        // Fetch the deed for the sale

        // var registry = ens.owner(rootNameHash);
        //  (mode, deed, registrationDate, value, highestBid)  = ens.entries(domainHash);
        
        // Ensure that the deed is owned by this contract
        // require(deed.owner == this);

        // Remove the resolver for the domain
        ens.setResolver(domainNameHash, 0);

        // TODO fix
        Deed deed = Deed(0);
        uint256 reserve = 1000000000000000000;
        uint256 finishesAt = 0;
        // Start the auction according to the sales agent's rules
        salesagent.start(domainNameHash, salesagent, deed, reserve, finishesAt);

        // Store details about the sale?
        sales[domainNameHash].agent = salesagent;
        sales[domainNameHash].startReferer = referer;

        // domainSale.setDomain(domainHash, domain);
        // domainSale.setDeed(domainHash, deed);

        // TODO event
    }

    /**
     * @dev Finish a domain sale
     * @param domain domain for sale (e.g. 'mydomain' if selling 'mydomain.eth')
     */
    function finishSale(string domain) { // TODO who can call this?
        bytes32 domainNameHash = sha3(rootNameHash, sha3(domain));

        DomainSaleAgent agent = sales[domainNameHash].agent;
        // Ensure that this sale is valid
        require(sales[domainNameHash].reserve != 0 || sales[domainNameHash].finishesAt != 0);
        // Ensure that this sale is closed
        require(agent.bidding(domainNameHash) == DomainSaleAgent.Bidding.Closed);

        // Hand ownership of the deed and domain to the winner
        // registrar.transfer(rootNameHash, winner);
        // registry = ens.owner(rootNameHash);
        // registry.setOwner(domainNameHash, winner);

        // Hand fee to the previous owner

        // Remove the sale
        sales[domainNameHash].reserve = 0;
        sales[domainNameHash].finishesAt = 0;
        sales[domainNameHash].bestBid = 0;

        // TODO event
    }

    /**
     * @dev Cancel a domain sale.  Only possible if there are
     *      no bids for the domain.
     * @param domain domain for sale (e.g. 'mydomain' if selling 'mydomain.eth')
     */
    function cancelSale(string domain) ifBiddingOpen(sha3(rootNameHash, sha3(domain))) ifSaleHasNoBids(sha3(rootNameHash, sha3(domain))) {

        // confirm correct ownership of the deed (via previousowner)
        // confirm auction has no bids
        // revert ownership of the deed
    }

    // Contracts:
    //   - DomainSaleRegistry:
    //     - contains the registry of domains for sale
    //     - single instance
    //     - created by Trust
    //   - IDomainSaleAgent
    //     - contains the methods for the domain sale
    //       - data methods
    //         - reserve(label) returns the reserve value for the sale (can be 0)
    //         - bestBid(label) returns the current best bid for the sale (can be 0)
    //         - allowsMultipleBids(label) returns true if the sale is multi-bid (i.e. doesn't stop after a single bid)
    //         - finishesAt(label) block the auction finishes - only if allowMultipleBids(label) is true and finishesWith
    //         - isFinished(label) returns true if the auction has finished
    //       - functional methods
    //         - start(label) initialises the sales process
    //         - bid(address, label) places a bid on the label
    //     - interface
    //   - SimpleDomainSaleAgent
    //   - VisibleAuctionDomainSaleAgent
    //   - BlindAuctionDomainSaleAgent
    //     - manages the sale of the domain
    //     - single instance
    //     - created by DomainSaleRegistry
}
