Information about the current state of sales within DomainSale is available from a web interface, providing both HTML and JSON.

## HTML Interface

The [HTML interface](http://domainsale.wealdtech.com/) provides information about every name in the DomainSale system.  It shows if the name is available for purchase or bidding, what the required prices are, and when any on-going auction is scheduled to close.

## REST API

The REST API provides the same information as available from the web interface.  The endpoints available for the API are as follows:

### [/sales/](http://domainsale.wealdtech.com/sales/)

This provides all names currently in the DomainSale system.  Query parameters are:

* `query` a string used for substring matches.  Defaults to ''
* `limit` the maximum number of sales to return.  Defaults to 20
* `offset` the number from which to start returning sales.  Defaults to 0

The returned JSON will include the following elements:

* `status`: 0 if the request was successful, otherwise non-0
* `data`: an array of sale objects

A sample output might be:

````
{
  "data": [
    {
      "contract": "5Fb681680d5C0d6d0c848a9D4527FFb7DfB9151d",
      "domain": "academia",
      "seller": "388Ea662EF2c223eC0B047D41Bf3c0f362142ad5",
      "price": 4000000000000000000,
      "reserve": 700000000000000000,
      "deedvalue": 10000000000000000
    },
    {
      "contract": "5Fb681680d5C0d6d0c848a9D4527FFb7DfB9151d",
      "domain": "bloomberg",
      "seller": "388Ea662EF2c223eC0B047D41Bf3c0f362142ad5",
      "reserve": 200000000000000000,
      "deedvalue": 10000000000000000
    }
  ],
  "status": 0
}
````

### [/meta/sales](http://domainsale.wealdtech.com/meta/sales)

This provides metadata about the sales in the DomainSale system.

The returned JSON will include the following elements:

* `status`: 0 if the request was successful, otherwise non-0
* `data`: the metadata for the sales

A sample output might be:

````
{
  "data": {
    "total": 201
  },
  "status": 0
}
````
