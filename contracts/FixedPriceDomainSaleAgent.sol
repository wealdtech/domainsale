pragma solidity ^0.4.11;

import './DomainSaleAgent.sol';

/**
 * @dev A fixed-price domain sale agent.  This accepts a single bid at or
 *      above the reserve level and finishes immediately.
 */
contract FixedPriceDomainSaleAgent is DomainSaleAgent {

    function start(bytes32 domainHash) public {
        //super(domainHash, this);
    }

    function bid(bytes32 domainHash) public payable {
        require(msg.value >= sales[domainHash].reserve);
        require(bidding(domainHash) == Bidding.Open);
        sales[domainHash].bestBid = msg.value;
    }

    function bidding(bytes32 namehash) public returns (Bidding) {
        return Bidding.Open;
    }
}
