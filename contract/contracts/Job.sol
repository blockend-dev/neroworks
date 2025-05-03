// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Djob{
     address public owner;
    uint8 public totalJobs;
    uint public totalFreelancers;
    uint public totalEmployers;
    uint public totalCompletedJobs;
    address[] public allFreelancerAddresses;

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
        string[] images; // [0]= profileImage, [1]= gigImage
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

    // Job[] public jobs;
    mapping(uint256 => Job) jobs;

    mapping(address => Freelancer) public freelancers;
    mapping(address => Employer) public employers;
    // mapping(address => bool) completedByFreelancers;
    mapping(address => mapping(uint256 => uint)) escrowFunds;


    event JobCreated(uint jobId, string title);
    event FreelancerRegistered(address freelancerAddress, string[] name, uint256 amount);
    event EmployerRegistered(address EmployerAddress, string name);
    event JobCompleted(uint jobId, address freelancerAddress, uint payment);
    event FundsDeposited(uint jobId, address sender, uint amount);
    event FundsReleased(uint jobId, address freelancerAddress, uint amount);
    event AppliedForJob(uint jobId, address employerAddress, address freelancerAddress);
    event WithdrawFund(address freelancer, uint amount);


    constructor() {
        owner = msg.sender;
    }
    
    modifier onlyEmployer(address _employerAddress){
        require(employers[msg.sender].employerAddress == _employerAddress, "OEF"); // only employer can call this function

        _;
    }

     modifier onlyFreelancer(address _freelancerAddress){
        require(freelancers[msg.sender].freelancerAddress == _freelancerAddress, "OFF"); // only freelancer can call this function
        _;
    }

     /// @notice job creation and increment job count,
    /// @param _title, @param _description, @param _budget
    function createJob(string memory _title, string memory _description, uint256 _budget) public onlyEmployer(msg.sender){
        totalJobs++;
        uint8 jobId = totalJobs;
        jobs[jobId] = Job(jobId,payable(msg.sender),_title,_description,_budget,false,new address[](0),address(0));    
        emit JobCreated(jobId, _title);
    }

    /// @notice retrieves job by ID
    /// @param jobId, jobId
    /// @return props
     function getJobByID(uint256 jobId) external view returns(Job memory props) {
        require(jobId > 0 && jobId <= totalJobs, "IJ"); //invalid job
        props = jobs[jobId];
    }

    /// @notice retrieves all jobs
    /// @return props
    
    function allJobs() external view returns(Job[] memory props){
        props = new Job[](totalJobs);
        for (uint i = 0; i < totalJobs; i++) {
            props[i] = jobs[i + 1];
        }

    }


      /// @notice job application
    /// @param jobId, job id
    function applyForJob(uint jobId) public {
        require(jobId <= totalJobs && jobId > 0, "JDE"); // job does not exist
        Job storage job = jobs[jobId];
        require(job.employer != address(0), "JNF"); // Job not found
        require(msg.sender != address(0), "IA."); //invalid applicant

        for (uint i = 0; i < job.applicants.length; i++) {
            if (job.applicants[i] == msg.sender) {
                revert("YHA"); //You have already applied for this job.
            }
        }

        job.applicants.push(msg.sender);

        emit AppliedForJob(jobId,job.employer,msg.sender);
    }

    /// @notice process job completion
    /// @param jobId, @param freelancerAddress
    function completeJob(uint jobId, address freelancerAddress) public onlyEmployer(msg.sender) {
        require(jobId <= totalJobs && jobId > 0, "JDE"); // job does not exist
        Job storage job = jobs[jobId];
        require(job.employer != address(0), "JNF"); // job not found
        require(isFreelancerHired(job, freelancerAddress), "FNH"); //Freelancer is not hired for this job
        // mark the job as completed
        uint payment = job.budget;
        job.completed = true;
        totalCompletedJobs++;
        freelancers[freelancerAddress].jobsCompleted++;
        emit JobCompleted(jobId, freelancerAddress, payment);
    }

      /// @notice check if freelancer is hired
        /// @param job , @param freelancerAddress
        /// @return bool
    function isFreelancerHired(Job storage job, address freelancerAddress) internal view returns (bool) {
        if (job.hiredFreelancer == freelancerAddress) {
            return true;
        }
        return false;
    }

}