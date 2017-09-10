# Contract Events

The DomainSale smart contract emits a number of events to allow listenres to provide full information about the current state of domains for sale and under auction.  The events emitted are as follows:

### Offer

This event is emitted when an `offer` transaction is received.  The event emits the following parameters:

  - `seller` the address selling the domain (this is indexed)
  - `name` the name of the domain, minus the `.eth` ending (so for example if the offer is on `mydomain.eth` this would be `mydomain`)
  - `price` the fixed price at which the domain can be purchased immediately (if this is `0` it means that this domain cannot be purchased immediately)
  - `reserve` the lowest acceptable bid at which the domain will enter auction (if this is `0` it means that this domain cannot be purchased at auction)

### Bid

This event is emitted when a `bid` transaction is received.  The event emits the following parameters:

  - `bidder` the address making the bid (this is indexed)
  - `name` the name of the domain, minus the `.eth` ending (so for example if the bid is on `mydomain.eth` this would be `mydomain`)
  - `bid` the bid that was made

### Cancel

This event is emitted when a `cancel` transaction is received.  The event emits the following parameters:

  - `seller` the address selling the domain (this is indexed)
  - `name` the name of the domain, minus the `.eth` ending (so for example if the cancellation is on `mydomain.eth` this would be `mydomain`)

### Transfer

This event is emitted when a domain is transferred, after either a `buy` or a `finish` transaction is received.  The event emits the following parameters:

  - `seller` the address of the domain seller (this is indexed)
  - `buyer` the address to of the domain buyer (this is indexed)
  - `name` the name of the domain, minus the `.eth` ending (so for example if the domain transferred is `mydomain.eth` this would be `mydomain`)
  - `value` the amount that the buyer paid to buy the domain

