## DomainSale

Sell ENS domains through a smart contract.

[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/wealdtech/domainsale?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

## Putting domains up for sale

Prior to putting the domain up for sale the user must transfer the deed for the domain to the DomainSale contract.  [details required when we have integration with wallets]

The seller must decide if they want the sale to be a fixed-price sale, an auction, or both.  Details of the rules of the different sales options are listed below under 'Sale rules'.

  - if auction then the auction clock will start when the first `bid()` is received

The seller starts the sale by transmitting an `offer()` transaction.  The arguments for this transaction are:

  - the name of the domain, minus the `.eth` ending (so for example if you wanted to sell `mydomain.eth` this argument would be `mydomain`)
  - the reserve price of the auction (if you do not want an auction then set this to `0`)
  - the fixed price of the sale (if you do not want a fixed-price sale then set this to `0`)

When a domain is put up for sale an event is sent, allowing websites and apps to maintain a list of domains for sale.

## Sale rules

Only one type of sale (fixed-price or auction) may be active for a domain at one time.  At current this means that there is no option to carry out a fixed-price purchase of a domain which is undergoing an auction, even if a fixed price is set.  The rules of the two types of sale are as follows:

### Fixed-price sale rules

A fixed-price sale accepts a single `buy()` at or above the price set by the seller, which immediately ends the sale.

When a sale ends ownership of the domain's deed is passed to the buyer and funds are passed to the seller.

When a fixed-price sale completes an event is sent, allowing websites and apps to remove sold domains from their list of domains for sale.

### Auction rules

An auction accepts multipe `bid()` according to the following rules:

  - if there are no bids for the domain then the bid must be at least equal to the reserve price
  - if there are bids for the domain then the bid must be at least 10% higher than the last bid
  - if bidding has gone on for more than 7 days then the bid must be at least 50% higher than the last bid
  - every time a `bid()` is accepted the auction's end date is set to be 24 hours after the bid

Extending the sale by 24 hours after each bid avoids the issue of domain sniping.  Ensuring that subsequent bids are at least 10% higher than the previous bid, and 50% higher than the previous bid if bidding has gone on for more than 7 days, avoids the issue where someone could maliciously extend a domain sale indefinitely by submitting very small incremental bids.

When an auction is more than 24 hours past its last bid no more bids can be placed.  At this point `finish()` finishes the auction.  Ownership of the domain's deed is passed to the highest bidder and funds are passed to the seller.

When an auction completes an event is sent, allowing websites and apps to remove sold domains from their list of domains for sale.

### Cancelling a sale

A sale without bids can be cancelled by sending `cancel()`.  Once a sale has bids it may not be cancelled.

When a sale is cancelled ownership of the domain's deed returns to the original owner.

When a sale is cancelled an event is sent, allowing websites and apps to remove cancelled domains from their list of domains for sale.

## Referrers

10% of the final sale price of the auction is split between two referrers.  These are as follows:

   - the sell referrer is the referrer that starts the auction
   - the buy referrer is the referrer that provides the winning bid to the auction

Referrers fees are important to allow for adoption of the DomainSale system by wallet providers, third party sites, etc. so that they can fund the operation of the websites, applications and tools that power the DomainSale system.

## FAQ

### Why do I need to hand the deed to the contract before making it available for sale?

This is a required for two reasons.  First, to prove that you do indeed own the domain.  Second, to ensure that the domain can be handed to the winning bidder when the sale finishes.

### What happens to the funds held in the deed when a sale finishes?

The funds are retained in the deed and transferred to the new owner.

### How do I withdraw my name from sale?

As long as no bids have been received for the name you can withdraw it from sale by issuing a `cancel()` transaction.  The deed will be returned to the address from which it was sent to the domain sale contract.

## Open questions

  - should a sale with both fixed-price and auction components allow a fixed-price purchase even if the auction is active?  What's the reason why not?
  - should there be any restrictions on who can call `finish()`?
  - what happens if someone attempts to sell a domain that is invalidated during the sale process?
