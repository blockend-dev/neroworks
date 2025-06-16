// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Storage.sol";

contract JobLogic is Storage {
    error YHA();

    event AppliedForJob(uint jobId, address employer, address freelancer);
    event JobCompleted(uint jobId, address freelancer, uint payment);

    function applyForJob(uint jobId) public {
        require(jobId > 0 && jobId <= totalJobs, "JDE");
        Job storage job = jobs[jobId];
        require(job.employer != address(0), "JNF");

        for (uint i = 0; i < job.applicants.length; i++) {
            if (job.applicants[i] == msg.sender) revert YHA();
        }
        job.applicants.push(msg.sender);
        emit AppliedForJob(jobId, job.employer, msg.sender);
    }

    function hireFreelancer(uint jobId, address freelancerAddress) public {
        require(jobId > 0 && jobId <= totalJobs, "JDE");
        Job storage job = jobs[jobId];
        require(job.employer == msg.sender, "WR");
        require(!isFreelancerHired(job, freelancerAddress), "FAH");

        job.hiredFreelancer = freelancerAddress;
    }

    function completeJob(uint jobId, address freelancerAddress) public {
        require(jobId > 0 && jobId <= totalJobs, "JDE");
        Job storage job = jobs[jobId];
        require(job.employer == msg.sender);
        require(isFreelancerHired(job, freelancerAddress), "FNH");

        job.completed = true;
        totalCompletedJobs++;
        freelancers[freelancerAddress].jobsCompleted++;
        emit JobCompleted(jobId, freelancerAddress, job.budget);
    }

    function getJobByID(uint256 jobId) external view returns (Job memory) {
        require(jobId > 0 && jobId <= totalJobs, "JDE");
        return jobs[jobId];
    }

    function allJobs() external view returns (Job[] memory) {
        Job[] memory arr = new Job[](totalJobs);
        for (uint i = 0; i < totalJobs; i++) arr[i] = jobs[i+1];
        return arr;
    }

    function isFreelancerHired(Job storage job, address freelancer) internal view returns (bool) {
        return job.hiredFreelancer == freelancer;
    }
}
