const ENS = artifacts.require("./ENS.sol");
const FIFSRegistrar = artifacts.require("./FIFSRegistrar.sol");
const MockEnsRegistrar = artifacts.require("./contracts/MockEnsRegistrar.sol");
const DomainSale = artifacts.require("./DomainSale.sol");
const Deed = artifacts.require("./Deed.sol");

const sha3 = require('solidity-sha3').default;

const ethLabelHash = sha3('eth');
const ethNameHash = sha3('0x0000000000000000000000000000000000000000000000000000000000000000', ethLabelHash);
const testdomain1LabelHash = sha3('testdomain1');
const testdomain1ethNameHash = sha3(ethNameHash, testdomain1LabelHash);
const testdomain2LabelHash = sha3('testdomain2');
const testdomain2ethNameHash = sha3(ethNameHash, testdomain2LabelHash);


contract('DomainSale', (accounts) => {
    const ensOwner = accounts[0];
    const registrarOwner = accounts[1];
    const domainSaleOwner = accounts[2];
    const testdomainOwner = accounts[3];
    const referrer1 = accounts[4];
    const referrer2 = accounts[5];
    const referrer3 = accounts[6];
    const bidder1 = accounts[7];
    const bidder2 = accounts[8];

    // Carry ENS etc. over tests
    var registry;
    var registrar;
    // Carry DomainSale over tests
    var domainSale;

    it('should set up the registrar and test domains', async () => {
        registry = await ENS.deployed();
        registrar = await MockEnsRegistrar.new(registry.address, ethNameHash, {from: registrarOwner, value: web3.toWei(10, 'ether')});
        await registry.setSubnodeOwner("0x0", ethLabelHash, registrar.address);
        await registrar.register(testdomain1LabelHash, {from: testdomainOwner, value: web3.toWei(0.01, 'ether')});
        await registrar.register(testdomain2LabelHash, {from: testdomainOwner, value: web3.toWei(0.01, 'ether')});
    });

    it('should set prices for a domain sale', async () => {
        domainSale = await DomainSale.new(registrar.address, {from: domainSaleOwner});

        // Transfer deed ownership to the domain sale contract
        await registrar.transfer(testdomain1LabelHash, domainSale.address, {from: testdomainOwner});
        // Ensure that the ownership is changed
        const entry = await registrar.entries(testdomain1LabelHash);
        assert.equal(await Deed.at(entry[1]).owner(), domainSale.address);
        
        // Ensure that the auction has not started
        assert.equal(await domainSale.auctionStarted('testdomain1'), false);

        // Set reserve and price for the domain
        await domainSale.sell('testdomain1', web3.toWei(1, 'ether'), web3.toWei(0.1, 'ether'), referrer1, {from: testdomainOwner});

        // Ensure that the auction has not been triggered
        assert.equal(await domainSale.auctionStarted('testdomain1'), false);
    });

    it('should obtain an immediate sale', async () => {
        // Ensure that the auction has not started
        assert.equal(await domainSale.auctionStarted('testdomain1'), false);

        const priorSellerFunds = await web3.eth.getBalance(testdomainOwner);
        const priorContractFunds = await web3.eth.getBalance(domainSale.address);
        const priorReferrer1Funds = await web3.eth.getBalance(referrer1);
        const priorReferrer2Funds = await web3.eth.getBalance(referrer2);
        await domainSale.buy('testdomain1', referrer2, {from: bidder1, value: web3.toWei(1, 'ether')});
        const currentSellerFunds = await web3.eth.getBalance(testdomainOwner);
        const currentContractFunds = await web3.eth.getBalance(domainSale.address);
        const currentReferrer1Funds = await web3.eth.getBalance(referrer1);
        const currentReferrer2Funds = await web3.eth.getBalance(referrer2);

        // Ensure that the auction has not started
        assert.equal(await domainSale.auctionStarted('testdomain1'), false);

        // Ensure that the deed is now owned by the winner
        const entry = await registrar.entries(sha3('testdomain1'));
        assert.equal(await Deed.at(entry[1]).owner(), bidder1);
        assert.equal(await Deed.at(entry[1]).previousOwner(), domainSale.address);

        // Ensure that the seller has 90% of the sale price
        assert.equal(currentSellerFunds - priorSellerFunds, web3.toWei(1, 'ether') * 0.9);
        // Ensure that the first referrer has 5% of the sale price
        assert.equal(currentReferrer1Funds - priorReferrer1Funds, web3.toWei(1, 'ether') * 0.05);
        // Ensure that the second referrer has 5% of the sale price
        assert.equal(currentReferrer2Funds - priorReferrer2Funds, web3.toWei(1, 'ether') * 0.05);
    });
});
