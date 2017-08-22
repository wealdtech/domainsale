pragma solidity ^0.4.11;

import './DomainSaleAgent.sol';
import './AbstractENS.sol';
import './HashRegistrarSimplified.sol'; // For Deed


contract DomainSaleRegistry {
    // namehash('eth')
    bytes32 private constant ROOT_NAME_HASH = 0x93cdeb708b7545dc668eb9280176169d1c33cfd8ed6f04690a0bcc88a93fc4ae;

    address private contractOwner;

    mapping(bytes32 => DomainSaleAgent) private sales; // nameHash => DomainSaleAgent

    // Sale events
    event Start(string domain, uint256 reserve);
    event Bid(string domain, uint256 amount);
    event Finish(string domain);
    event Cancel(string domain);

    // The ENS contract
    AbstractENS private registry;

    // The domain sale process is as follows:
    //   1) The seller starts the domain sale.  To do this they must set ownership
    //      of the deed to this registry, choose an appropriate method for sale, and
    //      call startSale().
    //      At this point any resolver for the domain will be removed
    //   2) A buyer offers a price for the domain to the sale contract
    //      This might finish the sale immediately or it might not, depending on the
    //      type of process.  The agent holds the bid money.
    //   3) At the end of a successful sale a finishSale() call is made to the agent
    //      that transfers the funds, 
    //   4) At the end of an unsuccessful sale the original owner of the domain can call
    //      cancelSale() to retrieve their deed

    modifier ifBiddingOpen(string domain) {
        bytes32 domainNameHash = sha3(ROOT_NAME_HASH, sha3(domain));
        require(sales[domainNameHash].bidding(domainNameHash) == DomainSaleAgent.Bidding.Open);
        _;
    }

    modifier ifSaleHasNoBids(string domain) {
        bytes32 domainNameHash = sha3(ROOT_NAME_HASH, sha3(domain));
        require(sales[domainNameHash].hasBids(domainNameHash) == false);
        _;
    }

    function DomainSaleRegistry(AbstractENS ens) {
        registry = ens;
        contractOwner = msg.sender;
    }

    /**
     * @dev See if a domain sale is accepting bids.
     */
    function acceptingBids(string domain) public constant returns (bool) {
        bytes32 domainNameHash = sha3(ROOT_NAME_HASH, sha3(domain));

        return (sales[domainNameHash] != address(0) && sales[domainNameHash].bidding(domainNameHash) == DomainSaleAgent.Bidding.Open);
    }

    /**
     * @dev Start a domain sale.
     * @param domain domain for sale (e.g. 'mydomain' if selling 'mydomain.eth')
     * @param saleAgent the address of the sale agent to be used for the sale
     * @param referrer a referrer who can claim some of the sale value
     */
    function startSale(string domain, DomainSaleAgent saleAgent, address referrer, uint256 reserve, uint256 finishesAt) public {
        bytes32 domainNameHash = sha3(ROOT_NAME_HASH, sha3(domain));

        // Ensure that this sale is not already active
        require(!saleAgent.active(domainNameHash));

        // Obtain the deed for the name
        var registrar = Registrar(registry.owner(ROOT_NAME_HASH));
        var (, deed, , , )  = registrar.entries(sha3(domain));
        
        // Ensure that the deed is owned by this contract
        require(Deed(deed).owner() == address(this));

        // Ensure tht the deed's previous owner is the message sender
        require(Deed(deed).previousOwner() == msg.sender);

        // Remove the resolver for the domain
        registry.setResolver(domainNameHash, 0);

        // Start the auction according to the agent's rules
        saleAgent.start(domainNameHash, contractOwner, msg.sender, referrer, reserve, finishesAt);

        // Store details about the sale
        sales[domainNameHash] = saleAgent;

        Start(domain, reserve);
    }

    /**
     * @dev Bid on a domain
     */
    function bid(string domain, address referrer) public payable ifBiddingOpen(domain) {
        bytes32 domainNameHash = sha3(ROOT_NAME_HASH, sha3(domain));
        
        DomainSaleAgent saleAgent = sales[domainNameHash];
        // Ensure that this sale is active
        require(saleAgent.active(domainNameHash));
        // Ensure that this sale is open
        require(saleAgent.bidding(domainNameHash) == DomainSaleAgent.Bidding.Open);

        saleAgent.bid.value(msg.value)(domainNameHash, msg.sender, referrer);

        Bid(domain, msg.value);
    }

    /**
     * @dev Finish a domain sale
     * @param domain domain for sale (e.g. 'mydomain' if selling 'mydomain.eth')
     */
    function finishSale(string domain) public {
        bytes32 domainLabelHash = sha3(domain);
        bytes32 domainNameHash = sha3(ROOT_NAME_HASH, domainLabelHash);

        DomainSaleAgent saleAgent = sales[domainNameHash];
        // Ensure that this sale is active
        require(saleAgent.active(domainNameHash));
        // Ensure that this sale is closed
        require(saleAgent.bidding(domainNameHash) == DomainSaleAgent.Bidding.Closed);

        // Hand ownership of the deed and domain to the winner
        var winner = saleAgent.winner(domainNameHash);
        // Safety check before we transfer the deed
        require(winner != 0);

        var registrar = Registrar(registry.owner(ROOT_NAME_HASH));
        registrar.transfer(domainLabelHash, winner);

        // Tell the agent that we've finished the sale
        saleAgent.finish(domainNameHash);

        // Remove the sale
        sales[domainNameHash] = DomainSaleAgent(0);

        Finish(domain);
    }

    /**
     * @dev Cancel a domain sale.  Only possible if there are
     *      no bids for the domain.
     * @param domain domain for sale (e.g. 'mydomain' if selling 'mydomain.eth')
     */
    function cancelSale(string domain) ifBiddingOpen(domain) ifSaleHasNoBids(domain) public {
        bytes32 domainLabelHash = sha3(domain);
        bytes32 domainNameHash = sha3(ROOT_NAME_HASH, domainLabelHash);

        DomainSaleAgent saleAgent = sales[domainNameHash];
        // confirm correct ownership of the deed (via previousowner)
        // confirm auction has no bids
        // revert ownership of the deed

        // Hand ownership of the deed and domain back to the seller
        var seller = saleAgent.seller(domainNameHash);
        // Safety check before we transfer the deed
        require(seller != 0);

        var registrar = Registrar(registry.owner(ROOT_NAME_HASH));
        registrar.transfer(domainLabelHash, seller);

        saleAgent.cancel(domainNameHash);

        // Remove the sale
        sales[domainNameHash] = DomainSaleAgent(0);

        Cancel(domain);
    }
}
