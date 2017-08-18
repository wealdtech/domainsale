const ENS = artifacts.require("./ENS.sol");
const FIFSRegistrar = artifacts.require("./FIFSRegistrar.sol");
const MockEnsRegistrar = artifacts.require("./contracts/MockEnsRegistrar.sol");
const DomainSaleRegistry = artifacts.require("./DomainSaleRegistry.sol");
const DomainSaleAgent = artifacts.require("./DomainSaleAgent.sol");
const FixedPriceDomainSaleAgent = artifacts.require("./FixedPriceDomainSaleAgent.sol");
const Deed = artifacts.require("./Deed.sol");

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
    const testdomainBidder1 = accounts[4];
    const testdomainBidder2 = accounts[5];

    // Carry registrar over tests
    var registrar;

    it('should set up the registrar and test domains', async () => {
        const registry = await ENS.deployed();
        registrar = await MockEnsRegistrar.new(registry.address, ethNameHash, {from: registrarOwner, value: web3.toWei(10, 'ether')});
        await registry.setSubnodeOwner("0x0", ethLabelHash, registrar.address);
        await registrar.register(testdomain1LabelHash, {from: testdomainOwner, value: web3.toWei(0.01, 'ether')});
        await registrar.register(testdomain2LabelHash, {from: testdomainOwner, value: web3.toWei(0.01, 'ether')});
    });

    it('should start a fixed-price sale', async () => {
        const registry = await ENS.deployed();
        const saleRegistry = await DomainSaleRegistry.deployed();
        const agent = await FixedPriceDomainSaleAgent.deployed();

        // Transfer deed ownership to the domain sale contract
        await registrar.transfer(testdomain1LabelHash, saleRegistry.address, {from: testdomainOwner});
        // Ensure that the ownership is changed
        const entry = await registrar.entries(testdomain1LabelHash);
        assert.equal(await Deed.at(entry[1]).owner(), saleRegistry.address);
        
        // Ensure that the bidding for the auction is closed
        assert.equal(await saleRegistry.acceptingBids('testdomain1'), false);

        // Start the auction for testdomain1
        await saleRegistry.startSale('testdomain1', agent.address, 0, web3.toWei(0.1, 'ether'), 0);

        // Ensure that the bidding for the auction is now open
        assert.equal(await saleRegistry.acceptingBids('testdomain1'), true);
    });

    it('should bid on a fixed-price sale', async () => {
        const saleRegistry = await DomainSaleRegistry.deployed();

        // Ensure that bidding for the auction is open
        assert.equal(await saleRegistry.acceptingBids('testdomain1'), true);

        // Submit the bid
        await saleRegistry.bid('testdomain1', {from: testdomainBidder1, value: web3.toWei(0.1, 'ether')});

        // Ensure that bidding for the auction is now closed
        assert.equal(await saleRegistry.acceptingBids('testdomain1'), false);
    });

    it('should finish a fixed-price sale', async () => {
        const saleRegistry = await DomainSaleRegistry.deployed();
    });

});
