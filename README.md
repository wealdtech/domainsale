## DomainSale

Sell ENS domains through a smart contract.

[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/wealdtech/domainsale)

## What is DomainSale and how does it work?

Please refer to the introductory article to find out about Domainsale.

## How can I use DomainSale?

There are a number of websites and applications for both buyers and sellers.  These include:

  - Command-line utility for manging domain sales.  Useful for managing bulk buying or selling of domains.  Available at http://www.wealdtech.com/domainsale.html

## How can I write my own app using DomainSale?

Details of how to develop apps using DomainSale are available at http://domainsale.readthedocs.io/

## FAQ

### Why do I need to hand the deed to the DomainSale contract before making it available for sale?

This is a required for two reasons.  First, to prove that you do indeed own the domain.  Second, so that the domain can be handed to the winning bidder by the contract when the sale finishes.

### What happens to the funds held in the deed when a sale finishes?

The funds are retained in the deed and transferred to the new owner.

### How do I withdraw my name from sale?

As long as no bids have been received for the name you can withdraw it from sale by issuing a `cancel()` transaction.  The deed will be returned to the address from which it was sent.

### How do I retain my name if it is already under auction?

Once an auction has started the only way for you to retain a name is to become the winning bidder.  Note that to do so you should bid with an address different to that which put the domain up for auction.

### Can I sell subdomains?

No; DomainSale does not support the selling of subdomains.

### What happens if an invalid domain is auctioned?

DomainSale itself is unaware that a domain might be invalid. However, if at any time during an auction the domain is invalidated in ENS the auction process will not allow the auction to finish. The bidder can send an `invalidate()` message to DomainSale and retrieve the funds they have bid.

### How can I obtain support for DomainSale?

Support for DomainSale can be found in the [DomainSale Gittter](https://gitter.im/wealdtech/domainsale).

