## DomainSale

Sell ENS domains through a smart contract.

[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/wealdtech/domainsale)

## Why DomainSale

DomainSale came about as a result of the first ENS workshop in London, where it was agreed that a mechanism for creating a trustless secondary market in ENS names should be created.  DomainSale allows sellers to sell their domains for either a fixed price or at an auction, and buyers to have access to the widest range of domains available for sale.  It is governed by a smart contract, ensuring that neither side can cheat the other, and no third party involvement is required.

## DomainSale for domain sellers

### Quick

If you want to sell an ENS domain you first transfer the deed for the domain to the DomainSale contract.  Once this has been done you offer the domain for sale, at a fixed price and/or auction, and wait for bidders to purchase your domain.

### Detailed

Before offering a domain for sale you should consider if you want to offer the domain for a fixed price purchase, for an auction, or for both.  It is important to understand that if a domain is available for both fixed price purchase and auction then once the first bid is received on the auction it will no longer be available for fixed price purchase and the auction rules will take over.

When you are ready to sell a domain you must first `transfer` ownership of the domain to the DomainSale contract.  This ensures that you have ownership of the domain, and that the DomainSale contract can transfer the domain to the purchaser.

*Note that DomainSale will only accept `offer`s and `cancel`s from the address from which the domain was transferred.  As such it is very important that you have full access to the address from which the domain is transferred.  If not then in worst case it can lead to the loss of the domain.*

Once the domain is owned by the DomainSale contract you can `offer` the domain according to the sales methods and prices that you choose.

If you wish to withdraw a domain for sale you may `cancel` the sale *as long as there is not an active auction on that domain*.

### Referrers

10% of the sale price of all domains is split between two referrers.  These are as follows:

   - the application that starts the auction
   - the application that provides the winning bid to the auction

Referrer fees are important to allow for adoption of DomainSale by wallet providers, third party sites, etc. so that they can fund the operation of the websites, applications and tools that power the DomainSale system.

## DomainSale for domain buyers

### Quick

If you want to buy an ENS domain with a fixed price you simply buy the domain outright for the required price.  If instead the domain is up for auction you can find out the minimum bid and bid that price.  The auction will remain open for 24 hours after the last bid was placed, after which it closes and the winning bidder can finish the auction to obtain control of the domain.

### Detailed

When you have found a domain you wish to purchase you should find out the methods by which you can purchase it.

If the domain has a purchase price then this is the price you have to pay to own the name immediately.  To do this you `buy` the domain at the asking price and the domain is transferred directly to you.

If the domain has a minimum bid then this is the lowest value you can attempt to pay to own the name through auction.  To do this you `bid` at or above the minimum bid price; if your bid remains the highest bid for a period of 24 hours the domain is yours.  To obtain a domain won at auction you `finish` the sale.

### Retrieving losing bid funds

If you are outbid on a domain your funds are marked for return.  Funds marked for return to you are returned when any of the following actions occur:

  - you bid on any domain for sale by DomainSale
  - you buy any domain for sale by DomainSale
  - you ask to withdraw any returnable funds

### Rules of a DomainSale purchase

A fixed-price sale accepts a single `buy()` at or above the price set by the seller, which immediately ends the sale.

When a sale ends ownership of the domain's deed is passed to the buyer and funds are passed to the seller.

When a fixed-price sale completes an event is sent, allowing websites and apps to remove sold domains from their list of domains for sale.

## Rules of a DomainSale auction

The rules for a DomainSale auction are very simple.  The auction has a reserve price and starts when someone bids at or above this amount.  Each time a bid is received the auction's end time is set to 24 hours from the time of the bid.  Once an auction has passed its end time no further bids are accepted.

The first bid made must be at least the reserve level set for the domain.  Further bids must be at least 10% more than the current bid.  If an auction continues for more than 7 days then further bids must be at least 50% more than the current bid.

All bids made on domains are visible, although there is no way to relate the address carrying out the bidding to a given entity (unless they have made this information publically available).

## DomainSale Websites and Applications

The following websites and applications provide the ability to buy and sell domains through DomainSale:

  - Weald Technology provide command-line tools for both buyers and sellers of domains.  These can be found at ?

## The DomainSale Smart Contract

The following information is for developers who wish to add DomainSale capabilities to their websites, wallets and dapps.

The address of the DomainSale contract can be found in ENS at domainsale.eth.  This name also contains the ABI of the DomainSale contract.

### Transferring domains to the DomainSale contract

To transfer a domain to the DomainSale contract a request to the registrar's' `transfer` function is required.  The address to which the domain should be transferred is the address of the DomainSale contract, as described above.

For more details about the ENS registrar please see the [ENS documentation](http://docs.ens.domains).

### Offering a domain for sale

To offer a domain for sale by the DomainSale contract a call to DomainSale's `offer` function is required.  The offer function takes the following arguments:

  - `name` the name of the domain, minus the `.eth` ending (so for example if you were offering `mydomain.eth` this argument would be `mydomain`)
  - `price` the fixed price at which the domain can be purchased immediately (if you do not want a fixed price sale then set this to `0`)
  - `reserve` the lowest acceptable bid at which the domain will enter auction (if you do not want an auction sale then set this to `0`)
  - `referrer` the referrer for this sale.  This address will receive 5% of the final sale price of the domain regardless of the method with which it is sold

This function must be called from the account that put the name up for sale.

Multiple `offer` function calls can be made to change the price if required, but note that this is only possible if the domain auction has yet to start.

### Cancelling a domain sale

To cancel a domain sale by the DomainSale contract a call to DomainSale's `cancel` function is required.  The cancel function takes the following arguments:

  - `name` the name of the domain, minus the `.eth` ending (so for example if you were offering `mydomain.eth` this argument would be `mydomain`)

This function must be called from the account that put the name up for sale.

Note that cancelling a domain sale is not possible once a domain has received a valid `bid` or `buy`.

### Buying a domain

To buy a domain offered for sale with a fixed price a call to DomainSale's `buy` function is required.  The buy function takes the following arguments:

  - `name` the name of the domain, minus the `.eth` ending (so for example if you were buying `mydomain.eth` this argument would be `mydomain`)
  - `referrer` the referrer for this purchase.  This address will receive 5% of the purchase price of the domain

The buy function transfers the domain to the buyer and the funds to the seller.

### Bidding in a domain auction

To bid for a domain offered for sale by auction a call to DomainSale's `bid` function is required.  The bid function takes the following arguments:

  - `name` the name of the domain, minus the `.eth` ending (so for example if you were bidding on `mydomain.eth` this argument would be `mydomain`)
  - `referrer` the referrer for this bid.  This address will receive 5% of the purchase price of the domain if this is the winning bid

### Finishing a domain auction

To finish an auction for a domain offered for sale a call to DomainSale's `finish` function is required.  The finish function takes the following arguments:

  - `name` the name of the domain, minus the `.eth` ending (so for example if you were offering `mydomain.eth` this argument would be `mydomain`)

The finish function transfers the domain to the winning bidder and the funds to the seller.

### Withdrawing losing bidders' funds

To withdraw any outstanding funds from losing bids a call to DomainSale's `withdraw` function is required.  The withdraw function takes no arguments.

### Obtaining information about sales

There are a number of functions that provide information about a domain sale.

To find out if a domain can be bought using fixed price purchase a call to DomainSale's `isBuyable` function is required.  The isBuyable function takes the following arguments:

  - `name` the name of the domain, minus the `.eth` ending (so for example if you were checking `mydomain.eth` this argument would be `mydomain`)

This will return `true` if the domain can be bought using fixed price purchase; otherwise false.

To find out the purchase price for a domain a call to DomainSale's `price` function is required.  The price function takes the following arguments:

  - `name` the name of the domain, minus the `.eth` ending (so for example if you were checking `mydomain.eth` this argument would be `mydomain`)

This will return a value for the minimum acceptable bid.  If `0` it means that there is no fixed price purhcase available for this domain.

To find out if a domain can be bought at auction a call to DomainSale's `isAuction` function is required.  The isAuction function takes the following arguments:

  - `name` the name of the domain, minus the `.eth` ending (so for example if you were checking `mydomain.eth` this argument would be `mydomain`)

This will return `true` if the domain can be bought at auction; otherwise false.

To find out when a domain's auction started a call to DomainSale's `auctionStarted` function is required.  The auctionStarted function takes the following arguments:

  - `name` the name of the domain, minus the `.eth` ending (so for example if you were checking `mydomain.eth` this argument would be `mydomain`)

This will return a timestamp for when the auction started.  If `0then it means that this auction has not yet started, or that there is no auction available for this domain (use `isAuction` above to find out which).

To find out when a domain's auction ends a call to DomainSale's `auctionEnds` function is required.  The auctionEnds function takes the following arguments:

  - `name` the name of the domain, minus the `.eth` ending (so for example if you were checking `mydomain.eth` this argument would be `mydomain`)

This will return a timestamp for when the auction ends.  If `0` it means that this auction has not yet started, or that there is no auction available for this domain (use `isAuction` above to find out which).

To find out the minimum bid for a domain's auction ends a call to DomainSale's `minimumBid` function is required.  The minimumBid function takes the following arguments:

  - `name` the name of the domain, minus the `.eth` ending (so for example if you were checking `mydomain.eth` this argument would be `mydomain`)

This will return a value for the minimum acceptable bid.  If `0` it means that there is no auction available for this domain.

To find out the returnable balance for an address due to losing bids at auction a call to DomainSale's `balance` function is required.  The balance function takes no arguments.

This will return a value for the balance that will be returned the next time a `buy`, `bid` or `withdraw` function is called.

## DomainSale smart contract events

The DomainSale smart contract emits a number of events to allow listenres to provide full information about the current state of domains for sale and under auction.  The eents emitted are as follows:

### Offer

This event is emitted when an `offer` transaction is received.  The event emits the following parameters:

  - `name` the name of the domain, minus the `.eth` ending (so for example if the offer is on `mydomain.eth` this argument would be `mydomain`)
  - `price` the fixed price at which the domain can be purchased immediately (if this is `0` it means that this domain cannot be purchased immediately)
  - `reserve` the lowest acceptable bid at which the domain will enter auction (if this is `0` it means that this domain cannot be purchased at auction)

### Bid

This event is emitted when a `bid` transaction is received.  The event emits the following parameters:

  - `name` the name of the domain, minus the `.eth` ending (so for example if the bid is on `mydomain.eth` this argument would be `mydomain`)
  - `bid` the bid that was mde

### Cancel

This event is emitted when a `cancel` transaction is received.  The event emits the following parameters:

  - `name` the name of the domain, minus the `.eth` ending (so for example if the cancellation is on `mydomain.eth` this argument would be `mydomain`)

### Transfer

This event is emitted when a domain is transferred, after either a `buy` or a `finish` transaction is received.  The event emits the following parameters:

  - `name` the name of the domain, minus the `.eth` ending (so for example if the domain transferred is `mydomain.eth` this argument would be `mydomain`)
  - `from` the address of the domain seller
  - `to` the address to of the domain buyer
  - `value` the amount that the buyer paid to buy the domain

## FAQ

### Why do I need to hand the deed to the contract before making it available for sale?

This is a required for two reasons.  First, to prove that you do indeed own the domain.  Second, to ensure that the domain can be handed to the winning bidder when the sale finishes.

### What happens to the funds held in the deed when a sale finishes?

The funds are retained in the deed and transferred to the new owner.

### How do I withdraw my name from sale?

As long as no bids have been received for the name you can withdraw it from sale by issuing a `cancel()` transaction.  The deed will be returned to the address from which it was sent to the domain sale contract.

### How do I retain my name if it is already under auction?

Once an auction has started the only way for you to retain a name is to become the winning bidder.  Note that to do so you should bid with an address different to that which put the domain up for auction.

### How can I obtain support for DomainSale?

Support for the DomainSale contract can be found in the [DomainSale Gittter room](https://gitter.im/wealdtech/domainsale).

## Open questions

  - what happens if someone attempts to sell a domain that is invalidated during the sale process?
