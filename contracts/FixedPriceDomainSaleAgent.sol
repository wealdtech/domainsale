pragma solidity ^0.4.11;

import './DomainSaleRegistry.sol';
import './DomainSaleAgent.sol';


/**
 * @dev A fixed-price domain sale agent.  This accepts a single bid at or
 *      above the reserve level and finishes immediately.
 */
contract FixedPriceDomainSaleAgent is DomainSaleAgent {

    function FixedPriceDomainSaleAgent(DomainSaleRegistry registry) DomainSaleAgent(registry) {}

    function start(bytes32 nameHash, address admin, address seller, address referrer, uint256 reserve, uint256 finishesAt) public onlyFromRegistry {
        super.start(nameHash, admin, seller, referrer, reserve, finishesAt);
    }

    function finish(bytes32 nameHash) public onlyFromRegistry {
        // Calculate fee distribution:
        // 97.5% to the seller
        //  2.5% to admin
        // If a referrer present:
        //   0.5% from admin to referrer
        uint256 fee = sales[nameHash].winningBid;
        uint256 sellerFunds = fee * 980 / 1000;
        uint256 adminFunds;
        uint256 saleReferrerFunds;
        uint256 winReferrerFunds;
        adminFunds = fee * 10 / 1000;
        if (sales[nameHash].saleReferrer == 0) {
            adminFunds += fee * 5 / 1000;
        } else {
            saleReferrerFunds = fee * 5 / 1000;
        }
        if (sales[nameHash].winReferrer == 0) {
            adminFunds += fee * 5 / 1000;
        } else {
            if (sales[nameHash].winReferrer == sales[nameHash].saleReferrer) {
                // Same referrer for both fees
                saleReferrerFunds += fee * 5 / 1000;
            } else {
                winReferrerFunds += fee * 5 / 1000;
            }
        }

        // TODO unsafe
        if (adminFunds > 0 && !sales[nameHash].admin.send(adminFunds)) {
            TransferFailed(msg.sender, sales[nameHash].admin, address(this).balance, adminFunds);
        }
        if (!sales[nameHash].seller.send(sellerFunds)) {
            TransferFailed(msg.sender, sales[nameHash].seller, address(this).balance, sellerFunds);
        }
        if (saleReferrerFunds > 0 && !sales[nameHash].saleReferrer.send(saleReferrerFunds)) {
            TransferFailed(msg.sender, sales[nameHash].saleReferrer, address(this).balance, saleReferrerFunds);
        }
        if (winReferrerFunds > 0 && !sales[nameHash].winReferrer.send(winReferrerFunds)) {
            TransferFailed(msg.sender, sales[nameHash].winReferrer, address(this).balance, winReferrerFunds);
        }
        super.finish(nameHash);
    }

    function cancel(bytes32 nameHash) public onlyFromRegistry {
      // TODO
    }

    function bid(bytes32 nameHash, address bidder, address referrer) public payable onlyFromRegistry {
        require(msg.value >= sales[nameHash].reserve);
        require(bidding(nameHash) == Bidding.Open);
        // A successful bid marks the end of this sale
        sales[nameHash].winningBid = msg.value;
        sales[nameHash].winningBidder = bidder;
        sales[nameHash].winReferrer = referrer;
    }

    function active(bytes32 nameHash) public constant returns (bool) {
        return (sales[nameHash].admin != address(0));
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
