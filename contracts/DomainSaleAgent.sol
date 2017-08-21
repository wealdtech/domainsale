pragma solidity ^0.4.15;

import './DomainSaleRegistry.sol';

/**
 * @dev The base domain sale agent.  This is abstract, and provides the
 *      functions and signatures for a full agent.
 */
contract DomainSaleAgent {
    enum Bidding { Open, Closed }

    DomainSaleRegistry public registry;

    modifier onlyFromRegistry() {
      require(msg.sender == address(registry));
      _;
    }

    // An event that is triggered when a transfer fails
    // TODO remove this when we throw on failure
    event TransferFailed(address from, address to, uint256 amount, uint256 balance);

    struct Sale {
        // The address of the admin of the domain sale
        address admin;
        // The address of the seller of this domain
        address seller;
        // The address of the referrer of the seller
        address saleReferrer;
        // The address of the referrer of the winning bidder
        address winReferrer;

        // The reserve value for this sale (0 == no reserve)
        uint256 reserve;
        // The timestamp at which this sale finishes (0 == never)
        uint256 finishesAt;

        // The winning bid for this sale
        uint256 winningBid;
        // The address of the winning bidder
        address winningBidder;
    }

    // Domains being sold
    mapping(bytes32 => Sale) public sales; // NameHash => sale

    /**
     * @dev Constructor for this agent
     * @param _registry the address of the domain sale registry
     */
    function DomainSaleAgent(DomainSaleRegistry _registry) {
        registry = _registry;
    }

    /**
     * @dev start a domain sale using this agent
     */
    function start(bytes32 domainHash, address admin, address seller, address referrer, uint256 reserve, uint256 finishesAt) public {
        sales[domainHash].admin = admin;
        sales[domainHash].seller = seller;
        sales[domainHash].saleReferrer = referrer;
        sales[domainHash].reserve = reserve;
        sales[domainHash].finishesAt = finishesAt;
    }

    /**
     * @dev bid on a sale.  Implemented by the subclass.
     */
    function bid(bytes32 domainHash, address bidder, address referrer) public payable;

    /**
     * @dev finish a successful sale.  Implemented by the subclass.
     */
    function finish(bytes32 domainHash) public {
        // Clear out the structure
        sales[domainHash].admin = 0;
        sales[domainHash].seller = 0;
        sales[domainHash].saleReferrer = 0;
        sales[domainHash].winReferrer = 0;
        sales[domainHash].reserve = 0;
        sales[domainHash].finishesAt = 0;
        sales[domainHash].winningBid = 0;
        sales[domainHash].winningBidder = 0;
    }

    /**
     * @dev cancel a successful sale.  Implemented by the subclass.
     */
    function cancel(bytes32 domainHash) public;

    /**
     * @dev state if a sale is active.
     * @return true if the sale is active; otherwise false.
     */
    function active(bytes32 domainHash) constant returns (bool) {
        return (sales[domainHash].admin != 0);
    }

    /**
     * @dev state if bidding is open.  Implemented by the subclass.
     * @return Open or Closed
     */
    function bidding(bytes32 domainHash) constant returns (Bidding);

    /**
     * @dev obtain the seller of the domain
     * @return the address of the winner
     */
    function winner(bytes32 domainHash) public constant returns (address) {
        return sales[domainHash].winningBidder;
    }

    /**
     * @dev obtain the seller of the domain
     * @return the address of the seller
     */
    function seller(bytes32 domainHash) public constant returns (address) {
        return sales[domainHash].seller;
    }

    /**
     * @dev state if this auction has bids.
     * @return true or false
     */
    function hasBids(bytes32 domainHash) public constant returns (bool) {
        return sales[domainHash].winningBid != 0;
    }
}
