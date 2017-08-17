pragma solidity ^0.4.11;

import './DomainSaleRegistry.sol';

/**
 * @dev The base domain sale agent.  This is abstract, and provides the
 *      functions and signatures for a full agent.
 */
contract DomainSaleAgent {
    enum Bidding { Open, Closed }

    DomainSaleRegistry registry;

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
    }

    // Domains being sold
    mapping(bytes32 => Sale) sales; // NameHash => sale

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
    function startSale(bytes32 nameHash) returns (bool) {
        return true;
    }

    function bidding(bytes32 nameHash) returns (Bidding);

    // function getSale(bytes32 labelHash) returns (int256 reserve, int256 finishesAt, int256 bestBid) {}
}
