pragma solidity ^0.4.11;

import './DomainSaleAgent.sol';
import './AbstractENS.sol';
import './HashRegistrarSimplified.sol'; // For Deed


contract DomainSaleRegistry {
    // namehash('eth')
    bytes32 constant rootNameHash = 0x93cdeb708b7545dc668eb9280176169d1c33cfd8ed6f04690a0bcc88a93fc4ae;

    struct Sale {
        // The sales agent for the domain
        DomainSaleAgent agent;

        // The referer when a sale started
        address startReferer;
    }

    mapping(bytes32 => Sale) public sales; // nameHash => Sale

    // Sale events
    event Start(string domain);
    event Bid(string domain, uint256 amount);
    event Finish(string domain);
    event Cancel(string domain);

    // The ENS contract
    AbstractENS registry;

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

    modifier ifBiddingOpen(string domain) {
        bytes32 domainNameHash = sha3(rootNameHash, sha3(domain));
        require(sales[domainNameHash].agent.bidding(domainNameHash) == DomainSaleAgent.Bidding.Open);
        _;
    }

    modifier ifSaleHasNoBids(string domain) {
        bytes32 domainNameHash = sha3(rootNameHash, sha3(domain));
        require(sales[domainNameHash].agent.hasBids(domainNameHash) == false);
        _;
    }

    function DomainSaleRegistry(AbstractENS ens) {
        registry = ens;
    }

    /**
     * @dev See if a domain sale is accepting bids.
     */
    function acceptingBids(string domain) constant returns (bool) {
        bytes32 domainNameHash = sha3(rootNameHash, sha3(domain));

        return (sales[domainNameHash].agent != address(0) && sales[domainNameHash].agent.bidding(domainNameHash) == DomainSaleAgent.Bidding.Open);
    }

    /**
     * @dev Start a domain sale.
     * @param domain domain for sale (e.g. 'mydomain' if selling 'mydomain.eth')
     * @param salesagent the address of the sales agent to be used for the sale
     * @param referer a referer who can claim some of the sale value
     */
    function startSale(string domain, DomainSaleAgent salesagent, address referer, uint256 reserve, uint256 finishesAt) {
        bytes32 domainNameHash = sha3(rootNameHash, sha3(domain));

        // Ensure that this sale is not currently running
        // TODO 
        //require(salesagent.isActive == false);

        // Obtain the deed for the name
        var registrar = Registrar(registry.owner(rootNameHash));
        var (, deed, , , )  = registrar.entries(sha3(domain));
        
        // Ensure that the deed is owned by this contract
        require(Deed(deed).owner() == address(this));

        // Remove the resolver for the domain
        registry.setResolver(domainNameHash, 0);

        // Start the auction according to the sales agent's rules
        salesagent.start(domainNameHash, reserve, finishesAt);

        // Store details about the sale?
        sales[domainNameHash].agent = salesagent;
        sales[domainNameHash].startReferer = referer;

        // domainSale.setDomain(domainHash, domain);
        // domainSale.setDeed(domainHash, deed);

        Start(domain);
    }

    /**
     * @dev Bid on a domain
     */
    function bid(string domain) public payable ifBiddingOpen(domain) {
        bytes32 domainNameHash = sha3(rootNameHash, sha3(domain));
        
        DomainSaleAgent agent = sales[domainNameHash].agent;
        agent.bid.value(msg.value)(domainNameHash);

        Bid(domain, msg.value);
    }

    /**
     * @dev Finish a domain sale
     * @param domain domain for sale (e.g. 'mydomain' if selling 'mydomain.eth')
     */
    function finishSale(string domain) public { // TODO who can call this?
        bytes32 domainNameHash = sha3(rootNameHash, sha3(domain));

        // DomainSaleAgent agent = sales[domainNameHash].agent;
        // Ensure that this sale is valid
        // TODO
        // require(agent.isActive() == true);
        // require(agent.HasBids() == false);
        // Ensure that this sale is closed
        // require(agent.bidding() == DomainSaleAgent.Bidding.Closed);

        // Hand ownership of the deed and domain to the winner

        // Hand fee to the previous owner

        // Remove the sale
        sales[domainNameHash].agent = DomainSaleAgent(0);
        sales[domainNameHash].startReferer = 0;

        Finish(domain);
    }

    /**
     * @dev Cancel a domain sale.  Only possible if there are
     *      no bids for the domain.
     * @param domain domain for sale (e.g. 'mydomain' if selling 'mydomain.eth')
     */
    function cancelSale(string domain) ifBiddingOpen(domain) ifSaleHasNoBids(domain) {

        // confirm correct ownership of the deed (via previousowner)
        // confirm auction has no bids
        // revert ownership of the deed
        Cancel(domain);
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
