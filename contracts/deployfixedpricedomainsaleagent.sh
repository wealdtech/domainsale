#!/bin/bash

echo "var input=`solc trust-library=${HOME}/src/trust-library/contracts --optimize --combined-json abi,bin,interface FixedPriceDomainSaleAgent.sol`" > contract.js


# First address is the ENS registry
geth attach ipc:/home/jgm/.ethereum/testnet/geth.ipc <<EOGETH
loadScript('contract.js');
var contract = web3.eth.contract(JSON.parse(input.contracts["FixedPriceDomainSaleAgent.sol:FixedPriceDomainSaleAgent"].abi));
personal.unlockAccount(eth.accounts[0], "throwaway");
var partial = contract.new('0x33711321ae2e792fc030bc2d6e2613502ed89e338d94daaa26a1d584efd5ce22', { from: eth.accounts[0], data: "0x" + input.contracts["FixedPriceDomainSaleAgent.sol:FixedPriceDomainSaleAgent"].bin, gas: 4700000});
console.log(partial.transactionHash);
EOGETH

rm -f contract.js
