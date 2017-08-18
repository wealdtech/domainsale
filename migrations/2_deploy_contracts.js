const sha3 = require('solidity-sha3').default;

const ENS = artifacts.require("./ENS.sol");
const FIFSRegistrar = artifacts.require("./FIFSRegistrar.sol");
const DomainSaleRegistry = artifacts.require("./DomainSaleRegistry.sol");
const FixedPriceDomainSaleAgent = artifacts.require("./FixedPriceDomainSaleAgent.sol");

// Addresses from 'testrpc -d'
const ensOwner              = '0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1'; // accounts[0]
const registrarOwner        = '0xffcf8fdee72ac11b5c542428b35eef5769c409f0'; // accounts[1]
const domainSaleOwner       = '0x22d491bde2303f2f43325b2108d26f1eaba1e32b'; // accounts[2]
const testdomainOwner       = '0xe11ba2b4d45eaed5996cd0823791e0c93114882d'; // accounts[3]

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
const testdomain9LabelHash = sha3('testdomain9');
const testdomain9ethNameHash = sha3(ethNameHash, testdomain9LabelHash);

// module.syncexports = function(deployer) {
//     return deployer.deploy(ENS, {from: ensOwner}).then(() => {
//         return ENS.deployed().then(ens => {
//             return deployer.deploy(FIFSRegistrar, ens.address, ethNameHash, {from: registrarOwner}).then(() => {
//                 return FIFSRegistrar.deployed().then(registrar => {
//                     return deployer.deploy(DomainSaleRegistry, ens.address, {from: domainSaleOwner}).then(() => {
//                         return DomainSaleRegistry.deployed().then(domainSaleRegistry => {
//                             return deployer.deploy(FixedPriceDomainSaleAgent, domainSaleRegistry.address, {from: domainSaleOwner}).then(() => {
//                                 return FixedPriceDomainSaleAgent.deployed().then(domainSaleAgent => {
//                                     console.log("Deployed fixed price sale agent");
//                                 });
//                             });
//                         });
//                     });
//                 });
//             });
//         });
//     });
// };
module.exports = async function(deployer) {
    const result = await deployer.deploy(ENS, {from: ensOwner});
    const ens = await ENS.deployed();

    await deployer.deploy(FIFSRegistrar, ens.address, ethNameHash, {from: registrarOwner});
    const registrar = await FIFSRegistrar.deployed();


    await deployer.deploy(DomainSaleRegistry, ens.address, {from: domainSaleOwner});
    const domainSaleRegistry = await DomainSaleRegistry.deployed();

    await deployer.deploy(FixedPriceDomainSaleAgent, domainSaleRegistry.address, {from: domainSaleOwner});
    // var fixedPriceDomainSaleAgent = await FixedPriceDomainSaleAgent.deployed();

    // Pass ownership of eth to the FIFS registrar address
    await ens.setSubnodeOwner('0x0', ethLabelHash, registrar.address);
    // var checkEthOwner = await ens.owner(ethNameHash);
    // console.log('Owner of .eth\n\t' + checkEthOwner + '\n\t' + registrar.address);

    // Register testdomain1 through testdomain9
    await registrar.register(testdomain1LabelHash, testdomainOwner, {from: testdomainOwner});
    // var checkTestdomain1Owner = await ens.owner(testdomain1ethNameHash);
    // console.log('Owner of testdomain1.eth\n\t' + checkTestdomain1Owner + '\n\t' + testdomainOwner);

    await registrar.register(testdomain2LabelHash, testdomainOwner, {from: testdomainOwner});
    // var checkTestdomain1Owner = await ens.owner(testdomain2ethNameHash);
    // console.log('Owner of testdomain2.eth\n\t' + checkTestdomain1Owner + '\n\t' + testdomainOwner);

    await registrar.register(testdomain3LabelHash, testdomainOwner, {from: testdomainOwner});
    // var checkTestdomain1Owner = await ens.owner(testdomain3ethNameHash);
    // console.log('Owner of testdomain3.eth\n\t' + checkTestdomain1Owner + '\n\t' + testdomainOwner);

    await registrar.register(testdomain4LabelHash, testdomainOwner, {from: testdomainOwner});
    // var checkTestdomain1Owner = await ens.owner(testdomain4ethNameHash);
    // console.log('Owner of testdomain4.eth\n\t' + checkTestdomain1Owner + '\n\t' + testdomainOwner);

    await registrar.register(testdomain5LabelHash, testdomainOwner, {from: testdomainOwner});
    // var checkTestdomain1Owner = await ens.owner(testdomain5ethNameHash);
    // console.log('Owner of testdomain5.eth\n\t' + checkTestdomain1Owner + '\n\t' + testdomainOwner);

    await registrar.register(testdomain6LabelHash, testdomainOwner, {from: testdomainOwner});
    // var checkTestdomain1Owner = await ens.owner(testdomain6ethNameHash);
    // console.log('Owner of testdomain6.eth\n\t' + checkTestdomain1Owner + '\n\t' + testdomainOwner);

    await registrar.register(testdomain7LabelHash, testdomainOwner, {from: testdomainOwner});
    // var checkTestdomain1Owner = await ens.owner(testdomain7ethNameHash);
    // console.log('Owner of testdomain7.eth\n\t' + checkTestdomain1Owner + '\n\t' + testdomainOwner);

    await registrar.register(testdomain8LabelHash, testdomainOwner, {from: testdomainOwner});
    // var checkTestdomain1Owner = await ens.owner(testdomain8ethNameHash);
    // console.log('Owner of testdomain8.eth\n\t' + checkTestdomain1Owner + '\n\t' + testdomainOwner);

    await registrar.register(testdomain9LabelHash, testdomainOwner, {from: testdomainOwner});
    // var checkTestdomain1Owner = await ens.owner(testdomain9ethNameHash);
    // console.log('Owner of testdomain9.eth\n\t' + checkTestdomain1Owner + '\n\t' + testdomainOwner);

    return result;
};
