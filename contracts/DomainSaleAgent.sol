pragma solidity ^0.4.11;

import './DomainSaleRegistry.sol';

/**
 * @dev The base domain sale agent.  This is abstract, and provides the
 *      functions and signatures for a full agent.
 */
contract DomainSaleAgent {
    enum Bidding { Open, Closed }

    DomainSaleRegistry public registry;

    struct Sale {
        // The reserve value for this sale (0 == no reserve)
        uint256 reserve;
        // The timestamp at which this sale finishes (0 == never)
        uint256 finishesAt;

        // The bids for the domain
        mapping(address => uint256) bids; // TODO make strut

        // The best bid for this sale
        uint256 bestBid;
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
    function start(bytes32 nameHash, uint256 reserve, uint256 finishesAt) public {
        sales[nameHash].reserve = reserve;
        sales[nameHash].finishesAt = finishesAt;
    }

    /**
     * @dev bid on a sale.  Implemented by the subclass.
     */
    function bid(bytes32 domainHash) public payable;

    /**
     * @dev state if bidding is open.  Implemented by the subclass.
     * @return Open or Closed
     */
    function bidding(bytes32 nameHash) constant returns (Bidding);

    /**
     * @dev state if this auction has bids.
     * @return true or false
     */
    function hasBids(bytes32 domainHash) public constant returns (bool) {
        return sales[domainHash].bestBid != 0;
    }
}
