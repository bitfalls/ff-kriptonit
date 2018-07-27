import expectThrow from './helpers/expectThrow';

const Contract = artifacts.require("Subscribers");

contract('Subscribers Test', async (accounts) => {

    it("should make sure environment is OK by checking that the first 3 accounts have over 20 eth", async () =>{
        assert.equal(web3.eth.getBalance(accounts[0]).toNumber() > 2e+19, true, "Account 0 has more than 20 eth");
        assert.equal(web3.eth.getBalance(accounts[1]).toNumber() > 2e+19, true, "Account 1 has more than 20 eth");
        assert.equal(web3.eth.getBalance(accounts[2]).toNumber() > 2e+19, true, "Account 2 has more than 20 eth");
    });

    it("should make the deployer the owner", async () => {
        let instance = await Contract.deployed();
        assert.equal(await instance.owner(), accounts[0]);
    });

});