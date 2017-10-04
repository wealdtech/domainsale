const ENS = artifacts.require("./ENS.sol");
const MockEnsRegistrar = artifacts.require("./contracts/MockEnsRegistrar.sol");
const DomainSale = artifacts.require("./DomainSale.sol");
const Deed = artifacts.require("./Deed.sol");
const MaliciousSeller = artifacts.require("./contracts/MaliciousSeller.sol");
const MaliciousReferrer = artifacts.require("./contracts/MaliciousReferrer.sol");

const sha3 = require('solidity-sha3').default;
const assertJump = require('./helpers/assertJump');

const increaseTime = addSeconds => web3.currentProvider.send({ jsonrpc: "2.0", method: "evm_increaseTime", params: [addSeconds], id: 0 })
const mine = () => web3.currentProvider.send({ jsonrpc: "2.0", method: "evm_mine", params: [], id: 0 })

const ethLabelHash = sha3('eth');
const ethNameHash = sha3('0x0000000000000000000000000000000000000000000000000000000000000000', ethLabelHash);
const testdomain1LabelHash = sha3('testdomain1');
const testdomain1ethNameHash = sha3(ethNameHash, testdomain1LabelHash);
const testdomain2LabelHash = sha3('testdomain2');
const testdomain2ethNameHash = sha3(ethNameHash, testdomain2LabelHash);
const testdomain3LabelHash = sha3('testdomain3');
const testdomain3ethNameHash = sha3(ethNameHash, testdomain3LabelHash);
const testdomain4LabelHash = sha3('testdomain4');
const testdomain4ethNameHash = sha3(ethNameHash, testdomain4LabelHash);
const testdomain5LabelHash = sha3('testdomain5');
const testdomain5ethNameHash = sha3(ethNameHash, testdomain5LabelHash);
const testdomain6LabelHash = sha3('testdomain6');
const testdomain6ethNameHash = sha3(ethNameHash, testdomain6LabelHash);
const testdomain7LabelHash = sha3('testdomain7');
const testdomain7ethNameHash = sha3(ethNameHash, testdomain7LabelHash);
const testdomain8LabelHash = sha3('testdomain8');
const testdomain8ethNameHash = sha3(ethNameHash, testdomain8LabelHash);


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

    it('should set up the registrar and test domains', async() => {
        registry = await ENS.deployed();
        registrar = await MockEnsRegistrar.new(registry.address, ethNameHash, { from: registrarOwner, value: web3.toWei(10, 'ether') });
        await registry.setSubnodeOwner("0x0", ethLabelHash, registrar.address);
        await registrar.register(testdomain1LabelHash, { from: testdomainOwner, value: web3.toWei(0.01, 'ether') });
        await registrar.register(testdomain2LabelHash, { from: testdomainOwner, value: web3.toWei(0.01, 'ether') });
        await registrar.register(testdomain3LabelHash, { from: testdomainOwner, value: web3.toWei(0.01, 'ether') });
        await registrar.register(testdomain4LabelHash, { from: testdomainOwner, value: web3.toWei(0.01, 'ether') });
        await registrar.register(testdomain5LabelHash, { from: testdomainOwner, value: web3.toWei(0.01, 'ether') });
        await registrar.register(testdomain6LabelHash, { from: testdomainOwner, value: web3.toWei(0.01, 'ether') });
        await registrar.register(testdomain7LabelHash, { from: testdomainOwner, value: web3.toWei(0.01, 'ether') });
        await registrar.register(testdomain8LabelHash, { from: testdomainOwner, value: web3.toWei(0.01, 'ether') });
    });

    it('should offer a domain for sale', async() => {
        domainSale = await DomainSale.new(registry.address, { from: domainSaleOwner });

        // Transfer deed ownership to the domain sale contract
        await registrar.transfer(testdomain1LabelHash, domainSale.address, { from: testdomainOwner });
        // Ensure that the ownership is changed
        const entry = await registrar.entries(testdomain1LabelHash);
        assert.equal(await Deed.at(entry[1]).owner(), domainSale.address);

        // Ensure that the auction has not started
        assert.equal(await domainSale.auctionStarted('testdomain1'), false);

        // Set reserve and price for the domain
        await domainSale.offer('testdomain1', web3.toWei(1, 'ether'), web3.toWei(0.1, 'ether'), referrer1, { from: testdomainOwner });

        // Ensure that the auction has not been triggered
        assert.equal(await domainSale.auctionStarted('testdomain1'), false);
    });

    it('should obtain an immediate sale', async() => {
        // Ensure that the auction has not started
        assert.equal(await domainSale.auctionStarted('testdomain1'), false);

        const priorSellerBalance = await domainSale.balance(testdomainOwner);
        const priorReferrer1Balance = await domainSale.balance(referrer1);
        const priorReferrer2Balance = await domainSale.balance(referrer2);
        await domainSale.buy('testdomain1', referrer2, { from: bidder1, value: web3.toWei(1, 'ether') });
        const currentSellerBalance = await domainSale.balance(testdomainOwner);
        const currentReferrer1Balance = await domainSale.balance(referrer1);
        const currentReferrer2Balance = await domainSale.balance(referrer2);

        // Ensure that the auction has not started
        assert.equal(await domainSale.auctionStarted('testdomain1'), false);

        // Ensure that the deed is now owned by the winner
        const entry = await registrar.entries(sha3('testdomain1'));
        assert.equal(await Deed.at(entry[1]).owner(), bidder1);
        assert.equal(await Deed.at(entry[1]).previousOwner(), domainSale.address);

        // Ensure that the seller has 90% of the sale price
        assert.equal(currentSellerBalance.sub(priorSellerBalance), web3.toWei(1, 'ether') * 0.9);
        // Ensure that the first referrer has 5% of the sale price
        assert.equal(currentReferrer1Balance.sub(priorReferrer1Balance), web3.toWei(1, 'ether') * 0.05);
        // Ensure that the second referrer has 5% of the sale price
        assert.equal(currentReferrer2Balance.sub(priorReferrer2Balance), web3.toWei(1, 'ether') * 0.05);
    });

    it('should offer a domain for sale (2)', async() => {
        // Transfer deed ownership to the domain sale contract
        await registrar.transfer(testdomain2LabelHash, domainSale.address, { from: testdomainOwner });
        // Ensure that the ownership is changed
        const entry = await registrar.entries(testdomain2LabelHash);
        assert.equal(await Deed.at(entry[1]).owner(), domainSale.address);

        // Ensure that the auction has not started
        assert.equal(await domainSale.auctionStarted('testdomain2'), false);

        // Set reserve and price for the domain
        await domainSale.offer('testdomain2', web3.toWei(1, 'ether'), web3.toWei(0.1, 'ether'), referrer1, { from: testdomainOwner });

        // Ensure that the auction has not been triggered
        assert.equal(await domainSale.auctionStarted('testdomain2'), false);
    });

    it('should refuse a bid under the minimum', async() => {
        await domainSale.offer('testdomain2', web3.toWei(0.1, 'ether'), web3.toWei(0.01, 'ether'), referrer1, { from: testdomainOwner });
        try {
            await domainSale.bid('testdomain2', referrer2, { from: bidder1, value: web3.toWei(0.001, 'ether') });
            assert.fail();
        } catch (error) {
            assertJump(error);
        }
    });

    it('should refuse to accept a buy when price is 0', async() => {
        await domainSale.offer('testdomain2', 0, web3.toWei(0.1, 'ether'), referrer1, { from: testdomainOwner });
        try {
            await domainSale.buy('testdomain2', referrer2, { from: bidder1, value: web3.toWei(1, 'ether') });
            assert.fail();
        } catch (error) {
            assertJump(error);
        }
    });

    it('should refuse to accept a bid when reserve is 0', async() => {
        await domainSale.offer('testdomain2', web3.toWei(1, 'ether'), 0, referrer1, { from: testdomainOwner });
        try {
            await domainSale.bid('testdomain2', referrer2, { from: bidder1, value: web3.toWei(1, 'ether') });
            assert.fail();
        } catch (error) {
            assertJump(error);
        }
    });

    it('should cancel an offer of a domain for sale', async() => {
        // Ensure that the auction has not started
        assert.equal(await domainSale.auctionStarted('testdomain2'), false);

        // Cancel the sale
        await domainSale.cancel('testdomain2', { from: testdomainOwner });

        // Ensure that the auction has not been triggered
        assert.equal(await domainSale.auctionStarted('testdomain2'), false);

        // Ensure that the ownership is changed
        const entry = await registrar.entries(testdomain2LabelHash);
        assert.equal(await Deed.at(entry[1]).owner(), testdomainOwner);
    });

    it('should offer a domain for sale (3)', async() => {
        // Transfer deed ownership to the domain sale contract
        await registrar.transfer(testdomain2LabelHash, domainSale.address, { from: testdomainOwner });
        // Ensure that the ownership is changed
        const entry = await registrar.entries(testdomain2LabelHash);
        assert.equal(await Deed.at(entry[1]).owner(), domainSale.address);

        // Ensure that the auction has not started
        assert.equal(await domainSale.auctionStarted('testdomain2'), false);

        // Set reserve and price for the domain
        await domainSale.offer('testdomain2', web3.toWei(1, 'ether'), web3.toWei(0.1, 'ether'), referrer1, { from: testdomainOwner });

        // Ensure that the auction has not been triggered
        assert.equal(await domainSale.auctionStarted('testdomain2'), false);
    });

    it('should accept bids', async() => {
        // Ensure that the auction has not started
        assert.equal(await domainSale.auctionStarted('testdomain2'), false);

        // Obtain the minimum bid
        var minimumBid = await domainSale.minimumBid('testdomain2');
        assert.equal(minimumBid, web3.toWei(0.1, 'ether'));

        // Confirm that the name is buyable and biddable
        assert.equal(await domainSale.isBuyable('testdomain2'), true);
        assert.equal(await domainSale.isAuction('testdomain2'), true);

        // Bid from first bidder
        await domainSale.bid('testdomain2', referrer2, { from: bidder1, value: web3.toWei(0.1, 'ether') });

        // Confirm that the name is no longer buyable but still biddable
        assert.equal(await domainSale.isBuyable('testdomain2'), false);
        assert.equal(await domainSale.isAuction('testdomain2'), true);

        // Ensure that the auction has started
        assert.equal(await domainSale.auctionStarted('testdomain2'), true);

        // Obtain the new minimum bid
        minimumBid = await domainSale.minimumBid('testdomain2');
        assert.equal(minimumBid, web3.toWei(0.11, 'ether'));

        // Bid from second bidder
        await domainSale.bid('testdomain2', referrer2, { from: bidder2, value: web3.toWei(0.2, 'ether') });

        // Obtain the new minimum bid
        minimumBid = await domainSale.minimumBid('testdomain2');
        assert.equal(minimumBid, web3.toWei(0.22, 'ether'));
    });

    it('should increase the minimum bid to +50% after a week', async() => {
        for (bid = 1; bid <= 8; bid++) {
            await domainSale.bid('testdomain2', referrer2, { from: bidder1, value: web3.toWei(bid, 'ether') });
            increaseTime(86300); // Less than 1 day to keep the auction alive
        }
        // Mine to ensure that the latest time increase has taken hold
        mine();

        // At this point the auction has been alive for more than 7 days so the minimum bid should be +50%
        minimumBid = await domainSale.minimumBid('testdomain2');
        assert.equal(minimumBid, web3.toWei(12, 'ether'));
    });

    it('should not allow bids after the auction ends', async() => {
        increaseTime(86401); // No bids for more than 1 day
        mine();

        // Attempt to bid
        try {
            await domainSale.bid('testdomain2', referrer2, { from: bidder1, value: web3.toWei(bid, 'ether') });
            assert.fail();
        } catch (error) {
            assertJump(error);
        }
    });

    it('should finish auctions correctly', async() => {
        const priorSellerBalance = await domainSale.balance(testdomainOwner);
        const priorReferrer1Balance = await domainSale.balance(referrer1);
        const priorReferrer2Balance = await domainSale.balance(referrer2);
        await domainSale.finish('testdomain2', { from: bidder2 });
        const currentSellerBalance = await domainSale.balance(testdomainOwner);
        const currentReferrer1Balance = await domainSale.balance(referrer1);
        const currentReferrer2Balance = await domainSale.balance(referrer2);

        // Ensure that the deed is now owned by the winner
        const entry = await registrar.entries(sha3('testdomain2'));
        assert.equal(await Deed.at(entry[1]).owner(), bidder1);
        assert.equal(await Deed.at(entry[1]).previousOwner(), domainSale.address);

        // Ensure that the seller has 90% of the sale price
        assert.equal(currentSellerBalance.sub(priorSellerBalance), web3.toWei(8, 'ether') * 0.9);
        // Ensure that the first referrer has 5% of the sale price
        assert.equal(currentReferrer1Balance.sub(priorReferrer1Balance), web3.toWei(8, 'ether') * 0.05);
        // Ensure that the second referrer has 5% of the sale price
        assert.equal(currentReferrer2Balance.sub(priorReferrer2Balance), web3.toWei(8, 'ether') * 0.05);
    });

    it('should not allow changes to the offer after the auction ends', async() => {
        // Attempt to alter the offer
        try {
            await domainSale.offer('testdomain2', web3.toWei(2, 'ether'), web3.toWei(0.2, 'ether'), referrer1, { from: testdomainOwner });
            assert.fail();
        } catch (error) {
            assertJump(error);
        }
    });

    it('should not allow changes to the offer after the auction ends', async() => {
        // Attempt to alter the offer
        try {
            await domainSale.offer('testdomain2', web3.toWei(2, 'ether'), web3.toWei(0.2, 'ether'), referrer1, { from: testdomainOwner });
            assert.fail();
        } catch (error) {
            assertJump(error);
        }
    });

    it('should not allow cancelling the auction after the auction ends', async() => {
        // Attempt to cancel the auction
        try {
            await domainSale.cancel('testdomain2', { from: testdomainOwner });
            assert.fail();
        } catch (error) {
            assertJump(error);
        }
    });

    //
    // Check value transfers
    //


    it('should return ether when a bidder repeat bids on a name', async() => {
        await registrar.transfer(testdomain4LabelHash, domainSale.address, { from: testdomainOwner });
        await domainSale.offer('testdomain4', web3.toWei(1, 'ether'), web3.toWei(0.01, 'ether'), referrer1, { from: testdomainOwner });

        // Initial cost should 0.01 ether (the bid) and gas
        const bidder1Funds1 = await web3.eth.getBalance(bidder1);
        tx = await domainSale.bid('testdomain4', referrer1, { from: bidder1, value: web3.toWei(0.01, 'ether') });
        gasUsed = tx.receipt.gasUsed * 100000000000;
        expectedFunds = bidder1Funds1.minus(gasUsed).minus(web3.toWei(0.01, 'ether'));
        const bidder1Funds2 = await web3.eth.getBalance(bidder1);
        assert.equal(expectedFunds.toString(), bidder1Funds2.toString());

        // Next bid is for 0.02 ether; cost should be 0.01 ether (difference between the two bids) and gas
        tx = await domainSale.bid('testdomain4', referrer1, { from: bidder1, value: web3.toWei(0.02, 'ether') });
        gasUsed = tx.receipt.gasUsed * 100000000000;
        expectedFunds = bidder1Funds2.minus(gasUsed).minus(web3.toWei(0.01, 'ether'));
        const bidder1Funds3 = await web3.eth.getBalance(bidder1);
        assert.equal(expectedFunds.toString(), bidder1Funds3.toString());

        // Next bid is for 0.1 ether; cost should be 0.08 ether (difference between the two bids) and gas
        tx = await domainSale.bid('testdomain4', referrer1, { from: bidder1, value: web3.toWei(0.1, 'ether') });
        gasUsed = tx.receipt.gasUsed * 100000000000;
        expectedFunds = bidder1Funds3.minus(gasUsed).minus(web3.toWei(0.08, 'ether'));
        const bidder1Funds4 = await web3.eth.getBalance(bidder1);
        assert.equal(expectedFunds.toString(), bidder1Funds4.toString());
    });

    it('should return ether when a bidder bids on an unrelated name', async() => {
        await registrar.transfer(testdomain5LabelHash, domainSale.address, { from: testdomainOwner });
        await domainSale.offer('testdomain5', web3.toWei(1, 'ether'), web3.toWei(0.01, 'ether'), referrer1, { from: testdomainOwner });
        await registrar.transfer(testdomain6LabelHash, domainSale.address, { from: testdomainOwner });
        await domainSale.offer('testdomain6', web3.toWei(1, 'ether'), web3.toWei(0.01, 'ether'), referrer1, { from: testdomainOwner });

        // Bidder 1 is outbid by bidder 2 and so gains a balance
        await domainSale.bid('testdomain5', referrer1, { from: bidder1, value: web3.toWei(0.01, 'ether') });
        await domainSale.bid('testdomain5', referrer1, { from: bidder2, value: web3.toWei(0.02, 'ether') });
        bidder1Balance = await domainSale.balance(bidder1);
        assert.equal(bidder1Balance.toString(), web3.toWei(0.01, 'ether').toString());

        // Bidder 1 bids on a different name and should obtain their balance back
        const bidder1Funds1 = await web3.eth.getBalance(bidder1);
        tx = await domainSale.bid('testdomain6', referrer1, { from: bidder1, value: web3.toWei(0.01, 'ether') });
        gasUsed = tx.receipt.gasUsed * 100000000000;
        expectedFunds = bidder1Funds1.minus(gasUsed);
        const bidder1Funds2 = await web3.eth.getBalance(bidder1);
        assert.equal(expectedFunds.toString(), bidder1Funds2.toString());
        assert.equal(bidder1Balance.toString(), web3.toWei(0.01, 'ether').toString());
    });

    it('should return balance when asked', async() => {
        // Bidder 1 is outbid by bidder 2 and so gains a balance
        await domainSale.bid('testdomain5', referrer1, { from: bidder1, value: web3.toWei(0.03, 'ether') });
        await domainSale.bid('testdomain5', referrer1, { from: bidder2, value: web3.toWei(0.04, 'ether') });
        bidder1Balance = await domainSale.balance(bidder1);
        assert.equal(bidder1Balance.toString(), web3.toWei(0.03, 'ether').toString());

        // Bidder 1 withdraws the balance
        const bidder1Funds1 = await web3.eth.getBalance(bidder1);
        tx = await domainSale.withdraw({ from: bidder1 });
        gasUsed = tx.receipt.gasUsed * 100000000000;
        expectedFunds = bidder1Funds1.minus(gasUsed).plus(web3.toWei(0.03, 'ether'));
        const bidder1Funds2 = await web3.eth.getBalance(bidder1);
        assert.equal(expectedFunds.toString(), bidder1Funds2.toString());
    });

    it('should handle sub-Wei values to referrers', async() => {
        await registrar.transfer(testdomain7LabelHash, domainSale.address, { from: testdomainOwner });
        await domainSale.offer('testdomain7', web3.toWei(9, 'wei'), 0, referrer1, { from: testdomainOwner });

        const priorSellerBalance = await domainSale.balance(testdomainOwner);
        const priorReferrer1Balance = await domainSale.balance(referrer1);
        const priorReferrer2Balance = await domainSale.balance(referrer2);
        await domainSale.buy('testdomain7', referrer2, { from: bidder1, value: web3.toWei(9, 'wei') });
        const currentSellerBalance = await domainSale.balance(testdomainOwner);
        const currentReferrer1Balance = await domainSale.balance(referrer1);
        const currentReferrer2Balance = await domainSale.balance(referrer2);

        // Ensure that the deed is now owned by the winner
        const entry = await registrar.entries(sha3('testdomain7'));
        assert.equal(await Deed.at(entry[1]).owner(), bidder1);
        assert.equal(await Deed.at(entry[1]).previousOwner(), domainSale.address);

        // Ensure that the seller has 90% of the sale price (which rounds up to 9)
        assert.equal(currentSellerBalance.sub(priorSellerBalance), web3.toWei(9, 'wei'));
        // Ensure that the first referrer has 5% of the sale price (which rounds down to 0)
        assert.equal(currentReferrer1Balance.sub(priorReferrer1Balance), web3.toWei(0, 'wei'));
        // Ensure that the second referrer has 5% of the sale price (which rounds down to 0)
        assert.equal(currentReferrer2Balance.sub(priorReferrer2Balance), web3.toWei(0, 'wei'));
    });

    it('should allow invalidation before an auction', async() => {
        const inv1LabelHash = sha3('inv1');
        const inv1ethNameHash = sha3(ethNameHash, inv1LabelHash);
        await registrar.register(inv1LabelHash, { from: testdomainOwner, value: web3.toWei(0.01, 'ether') });
        await registrar.transfer(inv1LabelHash, domainSale.address, { from: testdomainOwner });
        await domainSale.offer('inv1', web3.toWei(1, 'ether'), web3.toWei(0.01, 'ether'), referrer1, { from: testdomainOwner });
        await registrar.invalidate(inv1LabelHash);
        try {
            await domainSale.bid('inv1', referrer2, { from: bidder1, value: web3.toWei(0.1, 'ether') });
            assert.fail();
        } catch (error) {
            assertJump(error);
        }
    });

    it('should allow invalidation during an auction (1)', async() => {
        const inv2LabelHash = sha3('inv2');
        const inv2ethNameHash = sha3(ethNameHash, inv2LabelHash);
        await registrar.register(inv2LabelHash, { from: testdomainOwner, value: web3.toWei(0.01, 'ether') });
        await registrar.transfer(inv2LabelHash, domainSale.address, { from: testdomainOwner });
        await domainSale.offer('inv2', web3.toWei(1, 'ether'), web3.toWei(0.01, 'ether'), referrer1, { from: testdomainOwner });
        await domainSale.bid('inv2', referrer2, { from: bidder1, value: web3.toWei(0.1, 'ether') });
        await registrar.invalidate(inv2LabelHash);
        try {
            await domainSale.bid('inv2', referrer2, { from: bidder1, value: web3.toWei(0.2, 'ether') });
            assert.fail();
        } catch (error) {
            assertJump(error);
            // Invalidate by the bidder and ensure the bid balance is returned
            const bidder1Funds1 = await web3.eth.getBalance(bidder1);
            tx = await domainSale.invalidate('inv2', { from: bidder1 });
            gasUsed = tx.receipt.gasUsed * 100000000000;
            expectedFunds = bidder1Funds1.minus(gasUsed).plus(web3.toWei(0.1, 'ether'));
            const bidder1Funds2 = await web3.eth.getBalance(bidder1);
            assert.equal(expectedFunds.toString(), bidder1Funds2.toString());
        }
    });

    it('should allow invalidation during an auction (2)', async() => {
        const inv2LabelHash = sha3('inv2');
        const inv2ethNameHash = sha3(ethNameHash, inv2LabelHash);
        await registrar.register(inv2LabelHash, { from: testdomainOwner, value: web3.toWei(0.01, 'ether') });
        await registrar.transfer(inv2LabelHash, domainSale.address, { from: testdomainOwner });
        await domainSale.offer('inv2', web3.toWei(1, 'ether'), web3.toWei(0.01, 'ether'), referrer1, { from: testdomainOwner });
        await domainSale.bid('inv2', referrer2, { from: bidder1, value: web3.toWei(0.1, 'ether') });
        await registrar.invalidate(inv2LabelHash);
        try {
            await domainSale.bid('inv2', referrer2, { from: bidder1, value: web3.toWei(0.2, 'ether') });
            assert.fail();
        } catch (error) {
            assertJump(error);
            // Invalidate by third party
            await domainSale.invalidate('inv2', { from: bidder2 });
            // Ensure that the bid balance is returned
            const bidder1Funds1 = await web3.eth.getBalance(bidder1);
            tx = await domainSale.withdraw({ from: bidder1 });
            gasUsed = tx.receipt.gasUsed * 100000000000;
            expectedFunds = bidder1Funds1.minus(gasUsed).plus(web3.toWei(0.1, 'ether'));
            const bidder1Funds2 = await web3.eth.getBalance(bidder1);
            assert.equal(expectedFunds.toString(), bidder1Funds2.toString());
        }
    });

    it('should allow invalidation after an auction', async() => {
        const inv2LabelHash = sha3('inv2');
        const inv2ethNameHash = sha3(ethNameHash, inv2LabelHash);
        await registrar.register(inv2LabelHash, { from: testdomainOwner, value: web3.toWei(0.01, 'ether') });
        await registrar.transfer(inv2LabelHash, domainSale.address, { from: testdomainOwner });
        await domainSale.offer('inv2', web3.toWei(1, 'ether'), web3.toWei(0.01, 'ether'), referrer1, { from: testdomainOwner });
        await domainSale.bid('inv2', referrer2, { from: bidder1, value: web3.toWei(0.1, 'ether') });

        increaseTime(86401); // No bids for more than 1 day
        mine();
        await registrar.invalidate(inv2LabelHash);

        // Invalidate by the bidder and ensure the bid balance is returned
        const bidder1Funds1 = await web3.eth.getBalance(bidder1);
        tx = await domainSale.invalidate('inv2', { from: bidder1 });
        gasUsed = tx.receipt.gasUsed * 100000000000;
        expectedFunds = bidder1Funds1.minus(gasUsed).plus(web3.toWei(0.1, 'ether'));
        const bidder1Funds2 = await web3.eth.getBalance(bidder1);
        assert.equal(expectedFunds.toString(), bidder1Funds2.toString());
    });

    it('should not finish an invalid auction', async() => {
        const inv2LabelHash = sha3('inv2');
        const inv2ethNameHash = sha3(ethNameHash, inv2LabelHash);
        await registrar.register(inv2LabelHash, { from: testdomainOwner, value: web3.toWei(0.01, 'ether') });
        await registrar.transfer(inv2LabelHash, domainSale.address, { from: testdomainOwner });
        await domainSale.offer('inv2', web3.toWei(1, 'ether'), web3.toWei(0.01, 'ether'), referrer1, { from: testdomainOwner });
        await domainSale.bid('inv2', referrer2, { from: bidder1, value: web3.toWei(0.1, 'ether') });

        increaseTime(86401); // No bids for more than 1 day
        mine();
        await registrar.invalidate(inv2LabelHash);

        // Attempt to finish the auction
        try {
            await domainSale.finish('inv2', { from: bidder2 });
            assert.fail();
        } catch (error) {
            await domainSale.invalidate('inv2', { from: bidder2 });
            // Ensure that the bid balance is returned
            const bidder1Funds1 = await web3.eth.getBalance(bidder1);
            tx = await domainSale.withdraw({ from: bidder1 });
            gasUsed = tx.receipt.gasUsed * 100000000000;
            expectedFunds = bidder1Funds1.minus(gasUsed).plus(web3.toWei(0.1, 'ether'));
            const bidder1Funds2 = await web3.eth.getBalance(bidder1);
            assert.equal(expectedFunds.toString(), bidder1Funds2.toString());
        }
    });

    it('should handle buying from a malicious seller', async() => {
        const maliciousSeller = await MaliciousSeller.new({ from: testdomainOwner, value: web3.toWei(2, 'ether') });
        const malicious1LabelHash = sha3('malicious1');
        const malicious1ethNameHash = sha3(ethNameHash, malicious1LabelHash);
        await registrar.register(malicious1LabelHash, { from: testdomainOwner, value: web3.toWei(0.01, 'ether') });
        await registrar.transfer(malicious1LabelHash, maliciousSeller.address, { from: testdomainOwner });
        await maliciousSeller.transfer(registrar.address, 'malicious1', domainSale.address, { from: testdomainOwner });
        await maliciousSeller.offer(domainSale.address, 'malicious1', web3.toWei(1, 'ether'), web3.toWei(0.01, 'ether'), referrer1, { from: testdomainOwner });
        await domainSale.buy('malicious1', referrer2, { from: bidder1, value: web3.toWei(1, 'ether') });
    });

    it('should handle auctioning from a malicious seller', async() => {
        const maliciousSeller = await MaliciousSeller.new({ from: testdomainOwner, value: web3.toWei(2, 'ether') });
        const malicious2LabelHash = sha3('malicious2');
        const malicious2ethNameHash = sha3(ethNameHash, malicious2LabelHash);
        await registrar.register(malicious2LabelHash, { from: testdomainOwner, value: web3.toWei(0.01, 'ether') });
        await registrar.transfer(malicious2LabelHash, maliciousSeller.address, { from: testdomainOwner });
        await maliciousSeller.transfer(registrar.address, 'malicious2', domainSale.address, { from: testdomainOwner });
        await maliciousSeller.offer(domainSale.address, 'malicious2', web3.toWei(1, 'ether'), web3.toWei(0.01, 'ether'), referrer1, { from: testdomainOwner });
        await domainSale.bid('malicious2', referrer2, { from: bidder1, value: web3.toWei(1, 'ether') });

        increaseTime(86401); // No bids for more than 1 day
        mine();
        await domainSale.finish('malicious2', { from: bidder2 });
    });

    it('should handle buying with a malicious referrer', async() => {
        const maliciousReferrer = await MaliciousReferrer.new({ from: testdomainOwner });
        const malicious3LabelHash = sha3('malicious3');
        const malicious3ethNameHash = sha3(ethNameHash, malicious3LabelHash);
        await registrar.register(malicious3LabelHash, { from: testdomainOwner, value: web3.toWei(0.01, 'ether') });
        await registrar.transfer(malicious3LabelHash, domainSale.address, { from: testdomainOwner });
        await domainSale.offer('malicious3', web3.toWei(1, 'ether'), web3.toWei(0.01, 'ether'), maliciousReferrer.address, { from: testdomainOwner });
        await domainSale.bid('malicious3', maliciousReferrer.address, { from: bidder1, value: web3.toWei(0.1, 'ether') });
    });

    it('should handle auctioning from a malicious seller', async() => {
        const maliciousReferrer = await MaliciousReferrer.new({ from: testdomainOwner });
        const malicious4LabelHash = sha3('malicious4');
        const malicious4ethNameHash = sha3(ethNameHash, malicious4LabelHash);
        await registrar.register(malicious4LabelHash, { from: testdomainOwner, value: web3.toWei(0.01, 'ether') });
        await registrar.transfer(malicious4LabelHash, domainSale.address, { from: testdomainOwner });
        await domainSale.offer('malicious4', web3.toWei(1, 'ether'), web3.toWei(0.01, 'ether'), maliciousReferrer.address, { from: testdomainOwner });
        await domainSale.bid('malicious4', maliciousReferrer.address, { from: bidder1, value: web3.toWei(0.1, 'ether') });

        increaseTime(86401); // No bids for more than 1 day
        mine();

        await domainSale.finish('malicious4', { from: bidder2 });
    });

    it('should not offer when paused', async() => {
        const testdomain9LabelHash = sha3('testdomain9');
        const testdomain9ethNameHash = sha3(ethNameHash, testdomain9LabelHash);
        await registrar.register(testdomain9LabelHash, { from: testdomainOwner, value: web3.toWei(0.01, 'ether') });
        await registrar.transfer(testdomain9LabelHash, domainSale.address, { from: testdomainOwner });

        await domainSale.pause({from: domainSaleOwner});
        try {
            await domainSale.offer('testdomain9', web3.toWei(1, 'ether'), web3.toWei(0.01, 'ether'), referrer1, { from: testdomainOwner });
            assert.fail();
        } catch (error) {
            // Okay
        } finally {
           await domainSale.unpause({from: domainSaleOwner});
        }
    });

    it('should not buy when paused', async() => {
        await domainSale.offer('testdomain9', web3.toWei(1, 'ether'), web3.toWei(0.01, 'ether'), referrer1, { from: testdomainOwner });

        await domainSale.pause({from: domainSaleOwner});
        try {
            await domainSale.buy('testdomain9', referrer1, { from: bidder1, value: web3.toWei(1, 'ether') });
            assert.fail();
        } catch (error) {
            // Okay
        } finally {
            await domainSale.unpause({from: domainSaleOwner});
        }
        await domainSale.buy('testdomain9', referrer1, { from: bidder1, value: web3.toWei(1, 'ether') });
    });

    it('should not bid when paused', async() => {
        const testdomain10LabelHash = sha3('testdomain10');
        const testdomain10ethNameHash = sha3(ethNameHash, testdomain10LabelHash);
        await registrar.register(testdomain10LabelHash, { from: testdomainOwner, value: web3.toWei(0.01, 'ether') });
        await registrar.transfer(testdomain10LabelHash, domainSale.address, { from: testdomainOwner });
        await domainSale.offer('testdomain10', web3.toWei(1, 'ether'), web3.toWei(0.01, 'ether'), referrer1, { from: testdomainOwner });

        await domainSale.bid('testdomain10', referrer1, { from: bidder1, value: web3.toWei(0.1, 'ether') });
        await domainSale.pause({from: domainSaleOwner});
        try {
            await domainSale.bid('testdomain10', referrer1, { from: bidder2, value: web3.toWei(0.2, 'ether') });
            assert.fail();
        } catch (error) {
            // Okay
        } finally {
            await domainSale.unpause({from: domainSaleOwner});
        }
        await domainSale.bid('testdomain10', referrer1, { from: bidder2, value: web3.toWei(0.2, 'ether') });
    });

    it('should not finish when paused', async() => {
        increaseTime(86401); // No bids for more than 1 day
        mine();

        await domainSale.pause({from: domainSaleOwner});
        try {
            await domainSale.finish('testdomain10', { from: bidder2 });
            assert.fail();
        } catch (error) {
            // Okay
        } finally {
            await domainSale.unpause({from: domainSaleOwner});
        }
        await domainSale.finish('testdomain10', { from: bidder2 });
    });

    it('should not withdraw when paused', async() => {

        await domainSale.pause({from: domainSaleOwner});
        try {
            await domainSale.withdraw({ from: testdomainOwner });
            assert.fail();
        } catch (error) {
            // Okay
        } finally {
            await domainSale.unpause({from: domainSaleOwner});
        }
        await domainSale.withdraw({ from: testdomainOwner });
    });

    it('should not allow non-owner to pause', async() => {
        try {
            await domainSale.pause({from: testdomainOwner });
            assert.fail();
        } catch (error) {
            // Okay
        }
    });
});
