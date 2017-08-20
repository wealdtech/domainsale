pragma solidity ^0.4.11;

import './DomainSaleRegistry.sol';
import './DomainSaleAgent.sol';

/**
 * @dev A fixed-price domain sale agent.  This accepts a single bid at or
 *      above the reserve level and finishes immediately.
 */
contract FixedPriceDomainSaleAgent is DomainSaleAgent {

    function FixedPriceDomainSaleAgent(DomainSaleRegistry registry) DomainSaleAgent(registry) {}

    function start(bytes32 nameHash, address admin, address seller, address referer, uint256 reserve, uint256 finishesAt) public {
        // TODO should only be called by the registry
        super.start(nameHash, admin, seller, referer, reserve, finishesAt);
    }

    function finish(bytes32 nameHash) public {
        // TODO should only be called by the registry

        // Calculate fee distribution:
        // 97.5% to the seller
        //  2.5% to admin
        // If a referer present:
        //   0.5% from admin to referer
        uint256 fee = sales[nameHash].winningBid;
        uint256 sellerFunds = fee * 975 / 1000;
        uint256 adminFunds;
        uint256 refererFunds;
        if (sales[nameHash].referer == 0) {
            adminFunds = fee * 25 / 1000;
        } else {
            adminFunds = fee * 20 / 1000;
            refererFunds = fee * 5 / 1000;
        }
        // TODO unsafe
        if (adminFunds > 0 && !sales[nameHash].admin.send(adminFunds)) {
            TransferFailed(msg.sender, sales[nameHash].admin, address(this).balance, adminFunds);
        }
        if (!sales[nameHash].seller.send(sellerFunds)) {
            TransferFailed(msg.sender, sales[nameHash].seller, address(this).balance, sellerFunds);
        }
        if (refererFunds > 0 && !sales[nameHash].referer.send(refererFunds)) {
            TransferFailed(msg.sender, sales[nameHash].referer, address(this).balance, refererFunds);
        }
    }

    function cancel(bytes32 nameHash) public {
    }

    function bid(bytes32 nameHash, address bidder) public payable {
        // TODO should only be called by the registry
        require(msg.value >= sales[nameHash].reserve);
        require(bidding(nameHash) == Bidding.Open);
        // A successful bid marks the end of this sale
        sales[nameHash].winningBid = msg.value;
        // sales[nameHash].winningBidder = msg.sender;
        sales[nameHash].winningBidder = bidder;
    }

    function bidding(bytes32 nameHash) public constant returns (Bidding) {
        // Bidding is open if we don't have a winning bid
        if (sales[nameHash].winningBid == 0) {
            return Bidding.Open;
        } else {
            return Bidding.Closed;
        }
    }
}
