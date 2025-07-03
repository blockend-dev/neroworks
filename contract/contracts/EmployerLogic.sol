// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Storage.sol";

contract EmployerLogic is Storage {
    error AR_E();
    error WR_E();
    error II_E();

    event EmployerRegistered(address employerAddress, string name);
    event JobCreated(uint jobId, string title);
    event FundsDeposited(uint jobId, address sender, uint amount);
    event FundsReleased(uint jobId, address freelancerAddress, uint amount);

    modifier onlyEmployer() {
        address user = walletToUser[msg.sender];
        if (roles[msg.sender] != 1 && roles[user] != 1) revert WR_E();
        _;
    }

    function getEmployerByAddress(address _employer) external view returns(Employer memory props){
        props = employers[_employer];
    }

    function getEmployerEscrow(address _employer, uint256 _job_id) external view returns(uint){
        return escrowFunds[_employer][_job_id];
    }

    function registerEmployer(address creator, string memory _name, string memory _industry, string memory _country, string memory _imageURI) public {
        if (roles[msg.sender] != 0) revert AR_E();
        require(bytes(_name).length > 0);
        require(bytes(_industry).length > 0);

        totalEmployers++;
        roles[msg.sender] = 1;
        walletToUser[msg.sender] = creator;
        employers[creator] = Employer(creator, _name, _industry, 0, _country, _imageURI, true, block.timestamp);

        emit EmployerRegistered(creator, _name);
    }

    function createJob(string memory _title, string memory _description, uint256 _budget) public onlyEmployer {
        totalJobs++;
        uint8 jobId = totalJobs;
        address user = walletToUser[msg.sender];
        jobs[jobId] = Job(jobId, user, _title, _description, _budget, false, new address[](0), address(0));
        emit JobCreated(jobId, _title);
    }

    function depositFunds(uint jobId) public payable onlyEmployer {
        require(jobId > 0 && jobId <= totalJobs, "JDE_E");
        address user = walletToUser[msg.sender];
        Job storage job = jobs[jobId];
        require(job.employer == user);
        require(!job.completed, "JNC_E");
        require(msg.value >= job.budget, "IF");

        employers[user].balance += msg.value;
        escrowFunds[user][jobId] += msg.value;
        emit FundsDeposited(jobId, msg.sender, msg.value);
    }

    function releaseEscrow(uint jobId, address freelancerAddress) public onlyEmployer {
        require(jobId > 0 && jobId <= totalJobs, "JDE_E");
        address user = walletToUser[msg.sender];
        Job storage job = jobs[jobId];
        require(job.completed, "JNC_E");

        uint amount = escrowFunds[user][jobId];
        require(amount > 0, "NFE_E");
        require(amount >= job.budget, "IF");

        escrowFunds[user][jobId] = 0;
        freelancers[freelancerAddress].balance += amount;
        employers[user].balance -= amount;
        emit FundsReleased(jobId, freelancerAddress, amount);
    }

    function editEmployerProfile(
        string memory _name,
        string memory _industry,
        string memory _country,
        string memory _imageURI
    ) external onlyEmployer {
        if (bytes(_name).length == 0 || bytes(_industry).length == 0) revert II_E();
        address user = walletToUser[msg.sender];
        Employer storage employer = employers[user];
        employer.name = _name;
        employer.industry = _industry;
        employer.country = _country;
        employer.image = _imageURI;
    }
}

