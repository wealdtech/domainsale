const sha3 = require('solidity-sha3').default;

const ENS = artifacts.require("./ENS.sol");
const DomainSale = artifacts.require("./DomainSale.sol");

// Addresses from 'testrpc -d'
const ensOwner              = '0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1'; // accounts[0]
const registrarOwner        = '0xffcf8fdee72ac11b5c542428b35eef5769c409f0'; // accounts[1]
const domainSaleOwner       = '0x22d491bde2303f2f43325b2108d26f1eaba1e32b'; // accounts[2]

module.exports = function(deployer) {
    return deployer.deploy(ENS, {from: ensOwner}).then(() => {
        return ENS.deployed().then(ens => {
            return deployer.deploy(DomainSale, ens.address, {from: domainSaleOwner}).then(() => {
                return DomainSale.deployed();
            });
        });
    });
};
