const ENS = artifacts.require("./ENS.sol");
const FIFSRegistrar = artifacts.require("./FIFSRegistrar.sol");
const DomainSaleRegistry = artifacts.require("./DomainSaleRegistry.sol");
const DomainSaleAgent = artifacts.require("./DomainSaleAgent.sol");
const FixedPriceDomainSaleAgent = artifacts.require("./FixedPriceDomainSaleAgent.sol");

const sha3 = require('solidity-sha3').default;

const ethLabelHash = sha3('eth');
const ethNameHash = sha3('0x0000000000000000000000000000000000000000000000000000000000000000', ethLabelHash);
const testdomain1LabelHash = sha3('testdomain1');
const testdomain1ethNameHash = sha3(ethNameHash, testdomain1LabelHash);
const testdomain2LabelHash = sha3('testdomain2');
const testdomain2ethNameHash = sha3(ethNameHash, testdomain2LabelHash);


contract('FixedPriceDomainSaleAgent', (accounts) => {
    const ensOwner = accounts[0];
    const registrarOwner = accounts[1];
    const domainSaleOwner = accounts[2];
    const testdomainOwner = accounts[3];

    it('should start a fixed-price sale', async () => {
        const ens = await ENS.deployed();
        const fifsRegistrar = await FIFSRegistrar.deployed();
        const registry = await DomainSaleRegistry.deployed();
        const agent = await FixedPriceDomainSaleAgent.deployed();
//        const agent = await FixedPriceDomainSaleAgent.deployed();
//        const tx = await agent.startSale('testdomain1', agent, web3.toWei(10, 'ether'));
//        console.log(tx);
//
//        const subRegistrar = await IcoTrustSubRegistrar.deployed();
//        const tft = await TrustToken.deployed();
//        await tft.setPermission(subRegistrar.address, PERMS_TAKE_PAYMENT, true, {from: tftOwner});
    });
});
