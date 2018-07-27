var Migrations = artifacts.require("./Migrations.sol");
var Subscribers = artifacts.require("./Subscribers.sol");

module.exports = function(deployer, network, accounts) {
  if (network == "development") {
    deployer.deploy(Subscribers, {from: accounts[0]});
  } else {
    deployer.deploy(Subscribers);
  }
};
