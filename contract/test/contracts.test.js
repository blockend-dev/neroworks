const { expect, assert } = require("chai");
const { ethers } = require("hardhat");

describe("Dfreelancer", function () {
  let dfreelancer;
  const freelancerName = "Test Freelancer";
  const freelancerSkills = "Solidity, JavaScript";
  const freelancerCountry = 'Nigeria'
  const freelancerGigTitle = 'I will design and develop a dApp'
  const images = ['https://image.com/freelancerImage','https://image.com/gigImage']
  const freelancerGigDesc = 'Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using '
  const starting_price = '100'
  
  let freelancer;
  let employer;
  let jobTitle = "Sample Job";
  let jobDescription = "This is a test job";
  let jobBudget = '100';

  beforeEach(async function () {
    [owner, freelancer, employer] = await ethers.getSigners();

    const Dfreelancer = await ethers.getContractFactory("Dfreelancer");
    dfreelancer = await Dfreelancer.deploy();
    dfreelancer.waitForDeployment()
  });

  // creating job
  it("Should create a job", async function () {
      await dfreelancer.connect(employer)
      .registerEmployer('Ahmod','technology','United States','https://google.com/image.png')
      await dfreelancer.connect(owner)
      .registerEmployer('Ahmod','technology','United States','https://google.com/image.png')
      await dfreelancer.connect(employer)
      .createJob(jobTitle, jobDescription, ethers.parseEther('100'));
      await dfreelancer.connect(owner)
      .createJob(jobTitle, jobDescription, ethers.parseEther('2500'));
      // const jobs = await dfreelancer.allJobs()
      // console.log(jobs)
      const job = await dfreelancer.getJobByID('1');
      expect(job.employer).to.equal(employer.address);
      expect(job.title).to.equal(jobTitle);
      expect(job.description).to.equal(jobDescription);
      expect(job.budget.toString()).to.equal(ethers.parseEther(jobBudget));
      expect(job.completed).to.be.false;

  });

  //  registering freelancer
  it("Should register a freelancer", async function () {
    await dfreelancer.connect(freelancer)
    .registerFreelancer(freelancerName, freelancerSkills,freelancerCountry,
    freelancerGigTitle,freelancerGigDesc, images,starting_price);
    await dfreelancer.connect(owner)
    .registerFreelancer(freelancerName, freelancerSkills,freelancerCountry,
    freelancerGigTitle,freelancerGigDesc, images,starting_price);
    // const all = await dfreelancer.getAllFreelancers()
    // console.log(all);
    const registeredFreelancer = await dfreelancer.freelancers(freelancer.address);
    expect(registeredFreelancer.freelancerAddress).to.equal(freelancer.address);
    expect(registeredFreelancer.name).to.equal(freelancerName);
    expect(registeredFreelancer.skills).to.equal(freelancerSkills);
    expect(registeredFreelancer.balance).to.equal(0);
  });


  // hiring freelancer
  it("Should hire a freelancer", async function () {
    await dfreelancer.connect(freelancer)
    .registerFreelancer(freelancerName, freelancerSkills,freelancerCountry,
      freelancerGigTitle,freelancerGigDesc, images,starting_price);
    await dfreelancer.connect(employer)
    .registerEmployer('Ahmod','technology','United States','https://img.com')
    await dfreelancer.connect(employer)
    .createJob(jobTitle, jobDescription, ethers.parseEther('100'));
    await dfreelancer.connect(freelancer).applyForJob('1');
    await dfreelancer.connect(employer).hireFreelancer('1', freelancer.address);
    const job = await dfreelancer.getJobByID('1');
    expect(job.hiredFreelancer).to.equal(freelancer.address)
  });

// job completion
  it("Should complete a job", async function () {
    await dfreelancer.connect(freelancer)
    .registerFreelancer(freelancerName, freelancerSkills,freelancerCountry,
      freelancerGigTitle,freelancerGigDesc, images,starting_price);
    await dfreelancer.connect(employer)
    .registerEmployer('Ahmod','technology','United States','https://img.com')
    await dfreelancer.connect(employer).
    createJob(jobTitle, jobDescription, ethers.parseEther('100'));
    await dfreelancer.connect(freelancer).applyForJob('1');
    await dfreelancer.connect(employer).hireFreelancer('1', freelancer.address);
    await dfreelancer.connect(employer).completeJob('1', freelancer.address);
    const job = await dfreelancer.getJobByID('1');
    expect(job.completed).to.be.true;
    expect(job.hiredFreelancer).to.equal(freelancer.address)
  });

  // funds deposit by employer
  it("Should deposit funds to a job", async function () {
    const fund = '100' 
    await dfreelancer.connect(freelancer)
    .registerFreelancer(freelancerName, freelancerSkills,freelancerCountry,
      freelancerGigTitle,freelancerGigDesc, images, starting_price);
    await dfreelancer.connect(employer)
    .registerEmployer('Ahmod','technology','United States','https://img.com')
    await dfreelancer.connect(employer)
    .createJob(jobTitle, jobDescription, ethers.parseEther('100'));
    await dfreelancer.connect(employer).depositFunds('1', { value: ethers.parseEther(fund)});
    const escrowFund = await dfreelancer.getEmployerEscrow(employer.address,'1')
    const _employer = await dfreelancer.getEmployerByAddress(employer.address);
    expect(_employer.balance).to.equal(ethers.parseEther(fund))
    expect(escrowFund).to.equal(ethers.parseEther(fund))

  });

  // release escrow funds to freelancer after job completion
  it("Should release escrow funds to a freelancer", async function () {
    const fund = '200'
    await dfreelancer.connect(freelancer)
    .registerFreelancer(freelancerName, freelancerSkills,freelancerCountry,
      freelancerGigTitle,freelancerGigDesc, images ,starting_price);
    await dfreelancer.connect(employer)
    .registerEmployer('Ahmod','technology','United States','https://img.com') 
    await dfreelancer.connect(employer)
    .createJob(jobTitle, jobDescription, ethers.parseEther('100'));
    await dfreelancer.connect(freelancer).applyForJob('1');

    await dfreelancer.connect(employer).hireFreelancer('1', freelancer.address);
    await dfreelancer.connect(employer).depositFunds('1', { value: ethers.parseEther(fund)});
    await dfreelancer.connect(employer).completeJob('1', freelancer.address);

    await dfreelancer.connect(employer).releaseEscrow('1', freelancer.address);
    
    const updatedBalance = (await dfreelancer.freelancers(freelancer.address)).balance;
    assert.equal(updatedBalance.toString(),ethers.parseEther(fund).toString())
  });

 // Withdrawal of earnings by freelancer
 it("Should withdraw earnings", async function () {
    const fund = '100'; 
    const incentive = 5; // 5% incentive
    const remainingBalance = BigInt(fund) - (BigInt(fund) * BigInt(incentive)) / 100n;

    await dfreelancer.connect(freelancer)
      .registerFreelancer(
        freelancerName, 
        freelancerSkills,
        freelancerCountry,
        freelancerGigTitle,
        freelancerGigDesc, 
        images,
        starting_price
      );
      
    await dfreelancer.connect(employer)
      .registerEmployer('Ahmod', 'technology', 'United States', 'https://img.com');
      
    await dfreelancer.connect(employer)
      .createJob(jobTitle, jobDescription, ethers.parseEther('100'));
      
    await dfreelancer.connect(freelancer).applyForJob('1');
    await dfreelancer.connect(employer).hireFreelancer('1', freelancer.address);
    await dfreelancer.connect(employer).depositFunds('1', { value: ethers.parseEther(fund) });
    await dfreelancer.connect(employer).completeJob('1', freelancer.address);
    await dfreelancer.connect(employer).releaseEscrow('1', freelancer.address);

    const tx = await dfreelancer.connect(freelancer).withdrawEarnings();
    const receipt = await tx.wait();
    
    // event handling
    const event = receipt.logs.map(log => dfreelancer.interface.parseLog(log))
      .find(e => e.name === "WithdrawFund");
    
    assert.equal(
      event.args.amount.toString(),
      ethers.parseEther(remainingBalance.toString()).toString()
    );
  });


});