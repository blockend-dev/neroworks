// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "./Employer.sol";

contract Dfreelancer is Employers { 
   

     /// @notice retrieves freelancer by address
    /// @param _freelancer, address
    /// @return props
    function getFreelancerByAddress(address _freelancer) external view returns(Freelancer memory props){
        props = freelancers[_freelancer];
    }

    /// @notice process freelancer registration
    /// @param _name , @param _skills
    function registerFreelancer
    (string memory _name, string memory _skills, string memory _country,
    string memory _gigTitle, string memory _gigDesc, string[] memory _images, uint256 _starting_price) public {
        require(freelancers[msg.sender].registered == false, 'AR'); // already registered
        require(bytes(_name).length > 0);
        require(bytes(_skills).length > 0);
        totalFreelancers++;
        freelancers[msg.sender] = Freelancer(msg.sender, _name, _skills, 0,_country, 
        _gigTitle,_gigDesc,_images,0,true,block.timestamp,_starting_price);
        
         // Add the freelancer address to the array
        allFreelancerAddresses.push(msg.sender);

        emit FreelancerRegistered(msg.sender, _images, _starting_price);
        
    }

         /// @notice return all freelancers
    function getAllFreelancers() public view returns (Freelancer[] memory) {
        Freelancer[] memory allFreelancers = new Freelancer[](totalFreelancers);

        for (uint256 i = 0; i < totalFreelancers; i++) {
            allFreelancers[i] = freelancers[allFreelancerAddresses[i]];
        }

        return allFreelancers;
    }

    
        /// @notice process employer funds deposit for a specific job
        /// @param jobId , job id
    function depositFunds(uint jobId) public payable {
        require(jobId <= totalJobs && jobId > 0, "JDE."); // job does not exist
        Job storage job = jobs[jobId];
        Employer storage employer = employers[msg.sender];
        require(job.employer == msg.sender);
        require(!job.completed, "JAC"); // Job is already completed.
        require(msg.value >= job.budget, "IA"); // Insufficient amount
        
        employer.balance += msg.value;
        escrowFunds[msg.sender][jobId] += msg.value;
        emit FundsDeposited(jobId, msg.sender, msg.value);
    }

        /// @notice release escrow fund after successful completion of the job
        /// @param jobId , @param freelancerAddress
    function releaseEscrow(uint jobId, address freelancerAddress) public onlyEmployer(msg.sender){
        require(jobId <= totalJobs && jobId > 0, "JDE."); // job does not exist
        Job storage job = jobs[jobId];
        require(msg.sender == job.employer);
        require(job.completed = true, "JNC"); // Job is not completed by freelancer

        uint escrowAmount = escrowFunds[msg.sender][jobId];

        require(escrowAmount > 0, "NFE"); // No funds in escrow
        require(escrowAmount >= job.budget, "IF"); // insufficient funds
        escrowFunds[msg.sender][jobId] = 0;        
        // Implement logic to release funds from escrow to the freelancer's address
        Freelancer storage freelancer = freelancers[freelancerAddress];
        freelancer.balance += escrowAmount;
        // update employer balance
         Employer storage employer = employers[msg.sender];
         employer.balance -= escrowAmount;
         
        emit FundsReleased(jobId, freelancerAddress, escrowAmount);
    }


    /// @notice process funds withdrawal to the freelancer after successful completion of a job
    function withdrawEarnings() public onlyFreelancer(msg.sender) {
       Freelancer storage freelancer = freelancers[msg.sender];
        require(freelancer.balance > 0, "NBW"); // No balance to withdraw.

        uint withdrawAmount = (freelancer.balance * 95) / 100; // 95% of balance
        freelancer.balance = 0;

        (bool success, ) = msg.sender.call{value: withdrawAmount}("");
        require(success, "TF"); // Transfer failed

        emit WithdrawFund(msg.sender, withdrawAmount);
    }
}