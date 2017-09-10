# The DomainSale Contract

This section is for developers wishing to build their own tools using the DomainSale smart contract.  If you have a question about the DomainSale contract not answered here please direct it to the [DomainSale Gittter](https://gitter.im/wealdtech/domainsale).

The address of the DomainSale contract can be found in ENS at 'domainsale.eth'.  This domain also contains the ABI of the DomainSale contract.  It is recommended that access to the contract is carried out via the name rather than the address, in case the address is updated for any reason.

Note that prior to selling a domain the ownership of that domain's deed must be transferred to DomainSale.  Transferring a domain to the DomainSale contract involves a call to the ENS registrar's' `transfer` function.  The address to which the domain should be transferred is the address of the DomainSale contract, as described above.

For more details about the ENS registrar please see the [ENS documentation](http://docs.ens.domains).

## Carrying out actions with the DomainSale Contract

### offer

To offer a domain for sale by the DomainSale contract a call to DomainSale's `offer` function is required.  The offer function has the following parameters:

  - `name` the name of the domain, minus the `.eth` ending (so for example if you were offering `mydomain.eth` this would be `mydomain`)
  - `price` the fixed price at which the domain can be purchased immediately (if you do not want a fixed price sale then set this to `0`)
  - `reserve` the lowest acceptable bid at which the domain will enter auction (if you do not want an auction sale then set this to `0`)
  - `referrer` the referrer for this sale.  This address will receive 5% of the final sale price of the domain regardless of the method with which it is sold (unless a subsequent offer for the same domain is made with a different referrer).

This function must be called from the account that put the name up for sale.

Multiple `offer` function calls can be made to change the price if required, but note that this is only possible if the domain auction has yet to start.

### cancel

To cancel a domain sale by the DomainSale contract and return the deed to the previous owner a call to DomainSale's `cancel` function is required.  The cancel function has the following parameters:

  - `name` the name of the domain, minus the `.eth` ending (so for example if you were offering `mydomain.eth` this would be `mydomain`)

This function must be called from the account that put the name up for sale.

Note that cancelling a domain sale is not possible once a domain has received a valid `bid` or `buy`.

### buy

To buy a domain offered for sale with a fixed price a call to DomainSale's `buy` function is required.  The buy function has the following parameters:

  - `name` the name of the domain, minus the `.eth` ending (so for example if you were buying `mydomain.eth` this would be `mydomain`)
  - `referrer` the referrer for this purchase.  This address will receive 5% of the purchase price of the domain

The buy function transfers the domain's deed to the buyer and the funds to the seller.

### bid

To bid for a domain offered for sale by auction a call to DomainSale's `bid` function is required.  The bid function has the following parameters:

  - `name` the name of the domain, minus the `.eth` ending (so for example if you were bidding on `mydomain.eth` this would be `mydomain`)
  - `referrer` the referrer for this bid.  This address will receive 5% of the purchase price of the domain if this is the winning bid

### finish

To finish an auction for a domain offered for sale a call to DomainSale's `finish` function is required.  The finish function has the following parameters:

  - `name` the name of the domain, minus the `.eth` ending (so for example if you were offering `mydomain.eth` this would be `mydomain`)

The finish function transfers the domain's deed to the winning bidder and the funds to the seller.

### withdraw

To withdraw any outstanding funds from losing bids a call to DomainSale's `withdraw` function is required.

## Obtaining information with the DomainSale Contract

### isBuyable

To find out if a domain can be bought using fixed price purchase a call to DomainSale's `isBuyable` function is required.  The isBuyable function has the following parameters:

  - `name` the name of the domain, minus the `.eth` ending (so for example if you were checking `mydomain.eth` this would be `mydomain`)

This will return `true` if the domain can be bought using fixed price purchase; otherwise false.

### price

To find out the purchase price for a domain a call to DomainSale's `price` function is required.  The result of this call is only valid if `isBuyable` returns `true`.  The price function has the following parameters:

  - `name` the name of the domain, minus the `.eth` ending (so for example if you were checking `mydomain.eth` this would be `mydomain`)

This will return the value that must be paid to purchase the domain.

### isAuction

To find out if a domain can be bought at auction a call to DomainSale's `isAuction` function is required.  The isAuction function has the following parameters:

  - `name` the name of the domain, minus the `.eth` ending (so for example if you were checking `mydomain.eth` this would be `mydomain`)

This will return `true` if the domain can be bought at auction; otherwise false.


### auctionStarted

To find out when a domain's auction started a call to DomainSale's `auctionStarted` function is required.  The result of this call is only valid if `isAuction` returns `true`.  The auctionStarted function has the following parameters:

  - `name` the name of the domain, minus the `.eth` ending (so for example if you were checking `mydomain.eth` this would be `mydomain`)

This will return a timestamp for when the auction started.  If `0` then it means that this auction has not yet started.

### auctionEnds

To find out when a domain's auction ends a call to DomainSale's `auctionEnds` function is required.  The result of this call is only valid if `isAuction` returns `true`.  The auctionEnds function has the following parameters:

  - `name` the name of the domain, minus the `.eth` ending (so for example if you were checking `mydomain.eth` this would be `mydomain`)

This will return a timestamp for when the auction ends.  If `0` it means that this auction has not yet started.

### minimumBid

To find out the minimum bid for a domain's auction ends a call to DomainSale's `minimumBid` function is required.  The result of this call is only valid if `isAuction` returns `true`.  The minimumBid function has the following parameters:

  - `name` the name of the domain, minus the `.eth` ending (so for example if you were checking `mydomain.eth` this would be `mydomain`)

This will return a value for the minimum acceptable bid.

### balance

To find out the returnable balance for an address due to losing bids at auction a call to DomainSale's `balance` function is required.

This will return a value for the balance that will be returned the next time a `buy`, `bid` or `withdraw` function is called.
