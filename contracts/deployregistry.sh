#!/bin/bash

echo "var input=`solc trust-library=${HOME}/src/trust-library/contracts --optimize --combined-json abi,bin,interface DomainSaleRegistry.sol`" > contract.js


# First address is the ENS registry
geth attach ipc:/home/jgm/.ethereum/testnet/geth.ipc <<EOGETH
loadScript('contract.js');
var contract = web3.eth.contract(JSON.parse(input.contracts["DomainSaleRegistry.sol:DomainSaleRegistry"].abi));
personal.unlockAccount(eth.accounts[0], "throwaway");
var partial = contract.new('0x112234455c3a32fd11230c42e7bccd4a84e02010', { from: eth.accounts[0], data: "0x" + input.contracts["DomainSaleRegistry.sol:DomainSaleRegistry"].bin, gas: 4700000});
console.log(partial.transactionHash);
EOGETH

rm -f contract.js
