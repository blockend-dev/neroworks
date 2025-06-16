// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Storage.sol";

contract FreelancerLogic is Storage {
    error AR_F();
    error WR_F();
    error II_F();

    event FreelancerRegistered(address freelancerAddress, string[] images, uint256 amount);
    event WithdrawFund(address freelancer, uint amount);

    modifier onlyFreelancer() {
        if (roles[msg.sender] != 2) revert WR_F();
        _;
    }


    function getFreelancerByAddress(address _freelancer) external view returns(Freelancer memory props){
        props = freelancers[_freelancer];
    }


    function registerFreelancer(string memory _name, string memory _skills, string memory _country,
        string memory _gigTitle, string memory _gigDesc, string[] memory _images, uint256 _starting_price
    ) public {
        if (roles[msg.sender] != 0) revert AR_F();
        require(bytes(_name).length > 0);
        require(bytes(_skills).length > 0);

        totalFreelancers++;
        roles[msg.sender] = 2;
        freelancers[msg.sender] = Freelancer(msg.sender, _name, _skills, 0, _country, _gigTitle, _gigDesc, _images, 0, true, block.timestamp, _starting_price);
        allFreelancerAddresses.push(msg.sender);
        emit FreelancerRegistered(msg.sender, _images, _starting_price);
    }

    function editFreelancerProfile(string memory _name, string memory _skills, string memory _country,
        string memory _gigTitle, string memory _gigDesc, string[] memory _images, uint256 _starting_price
    ) external onlyFreelancer {
        if (bytes(_name).length == 0 || bytes(_skills).length == 0) revert II_F();

        Freelancer storage f = freelancers[msg.sender];
        f.name = _name;
        f.skills = _skills;
        f.country = _country;
        f.gigTitle = _gigTitle;
        f.gitDescription = _gigDesc;
        f.images = _images;
        f.starting_price = _starting_price;
    }

    function withdrawEarnings() public onlyFreelancer {
        Freelancer storage f = freelancers[msg.sender];
        require(f.balance > 0, "NBW");

        uint toTransfer = (f.balance * 95) / 100;
        f.balance = 0;
        (bool success, ) = msg.sender.call{value: toTransfer}("");
        require(success, "TF");

        emit WithdrawFund(msg.sender, toTransfer);
    }
}
