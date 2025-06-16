// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./EmployerLogic.sol";
import "./FreelancerLogic.sol";
import "./JobLogic.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";

contract Dfreelancer is EmployerLogic, FreelancerLogic, JobLogic, Initializable  {

    function initialize(address _owner) public initializer {
       // require(owner == address(0), "Already initialized");
        owner = _owner;
    }
}
