Contracts and structure for the DomainSale Process

# Big Picture

DomainSale allows domain holders to advertise ENS domains for sale, and for the sale itself to take place

# Putting domains up for sale

To put a domain up for sale you need to decide upon the following features of the sale:

    - is the sale fixed-price or an auction?
    - if the sale is fixed-price then what is the price?
    - if the sale is an auction then when will the auction close?

Once you have decided on the sale criteria you can start the sale.

## Starting the domain sale in MetaMask
## Starting the domain sale in MyEtherWallet
## Starting the domain sale in Mist


# FAQ

## Can I continue to use my domain whist it is for sale?

No.  To start the domain sale process you must sign the domain's deed over to the DomainSale contract.  This is to ensure that a domain put up for sale is available by the domain's owner


# Process

  - DomainSaleRegistry.startSale(domain, agent)
    - calls ens.owner(nameHash('eth')) to obtain registry
    - calls registry.entries(namehash).deed to obtain the deed
    - calls agent.start(params...)
  - DomainSaleRegistry.bid(domain, amount)
    - calls getAgent(domain).isOpen() to confirm that the sale is open
    - calls getAgent(domain).bid(amount)
  - DomainSaleRegistry.finish(domain, amount)
    - calls getAgent(domain).isOpen() to confirm that the sale is open
    - calls getAgent(domain).close(amount)

