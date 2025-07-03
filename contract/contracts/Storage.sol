// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Storage {
    address public owner;
    uint8 public totalJobs;
    uint public totalFreelancers;
    uint public totalEmployers;
    uint public totalCompletedJobs;

    struct Job {
        uint8 id;
        address employer;
        string title;
        string description;
        uint256 budget;
        bool completed;
        address[] applicants;
        address hiredFreelancer;
    }

    struct Freelancer {
        address freelancerAddress;
        string name;
        string skills;
        uint balance;
        string country;
        string gigTitle;
        string gitDescription;
        string[] images;
        uint jobsCompleted;
        bool registered;
        uint256 registration_date;
        uint256 starting_price;
    }

    struct Employer {
        address employerAddress;
        string name;
        string industry;
        uint balance;
        string country;
        string image;
        bool registered;
        uint256 registration_date;
    }

    mapping(uint256 => Job) public jobs;
    mapping(address => Freelancer) public freelancers;
    mapping(address => Employer) public employers;
    mapping(address => mapping(uint256 => uint)) public escrowFunds;
    mapping(address => uint8) public roles;
    address[] public allFreelancerAddresses;
    mapping(address => address) public walletToUser;
}
