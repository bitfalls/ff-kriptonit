pragma solidity ^0.4.24;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/Subscribers.sol";

contract TestSubscribers {
    
    function testDeploymentIsFine() public {
        Subscribers subs = Subscribers(DeployedAddresses.Subscribers());

        uint256 monthlyPrice = 0.01 ether;
        uint256 annualPrice = 0.1 ether;

        Assert.equal(subs.monthlyPrice(), monthlyPrice, "Initial monthly price should be 0.01 ether");
        Assert.equal(subs.annualPrice(), annualPrice, "Initial annual price should be 0.1 ether");
    }
}