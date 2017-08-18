pragma solidity ^0.4.11;

import './DomainSaleRegistry.sol';
import './DomainSaleAgent.sol';

/**
 * @dev A fixed-price domain sale agent.  This accepts a single bid at or
 *      above the reserve level and finishes immediately.
 */
contract FixedPriceDomainSaleAgent is DomainSaleAgent {

    function FixedPriceDomainSaleAgent(DomainSaleRegistry registry) DomainSaleAgent(registry) {}

    function start(bytes32 domainHash, DomainSaleAgent agent, Deed deed, uint256 reserve, uint256 finishesAt) public {
        require(agent == this);
        super.start(domainHash, agent, deed, reserve, finishesAt);
    }

    function bid(bytes32 domainHash) public payable {
        require(msg.value >= sales[domainHash].reserve);
        require(bidding(domainHash) == Bidding.Open);
        sales[domainHash].bestBid = msg.value;
    }

    function bidding(bytes32 domainHash) public returns (Bidding) {
        // Bidding is open if we don't have any bids
        if (sales[domainHash].bestBid == 0) {
            return Bidding.Open;
        } else {
            return Bidding.Closed;
        }
    }

    function hasBids(bytes32 domainHash) public returns (bool) {
        return sales[domainHash].bestBid != 0;
    }
}
