// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "./Job.sol";


contract Employers is Djob{

    
    /// @notice retrieves employer by address
    /// @param _employer, address
    /// @return props
    function getEmployerByAddress(address _employer) external view returns(Employer memory props){
        props = employers[_employer];
    }

    
     /// @notice retrieves employer escrow balance
    /// @param _employer, @param _job_id
    /// @return uint
    function getEmployerEscrow(address _employer, uint256 _job_id) external view returns(uint){
        return escrowFunds[_employer][_job_id];

    }

     /// @notice process employer registration
        /// @param _name , @param _industry
      function registerEmployer
      (string memory _name, string memory _industry,string memory _country, string memory _imageURI) public {
        require(employers[msg.sender].registered == false, 'AR'); // already registered
        require(bytes(_name).length > 0);
        require(bytes(_industry).length > 0);
        totalEmployers++;
        employers[msg.sender] = Employer(msg.sender, _name, _industry, 0,_country, _imageURI,true,block.timestamp);
        emit EmployerRegistered(msg.sender, _name);
    }

      /// @notice hiring freelancer and check if freelancer is not already hired for the job
    /// @param jobId, @param freelancerAddress
    function hireFreelancer(uint jobId, address freelancerAddress) public onlyEmployer(msg.sender) {
        require(jobId <= totalJobs && jobId > 0, "JDE."); // job does not exist
        Job storage job = jobs[jobId];
        require(job.employer != address(0), "JNF"); // Job not found
        require(!isFreelancerHired(job, freelancerAddress), "FAH"); //Freelancer is already hired

        job.hiredFreelancer = freelancerAddress;
    
    }

}