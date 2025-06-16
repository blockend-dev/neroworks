import { expect, assert } from "chai";
import { ethers, upgrades } from "hardhat";
import { Dfreelancer, Proxy } from "../typechain-types"; // Adjust to match your output path

describe("Dfreelancer (via Proxy)", function () {

  const freelancerName = "Test Freelancer";
  const freelancerSkills = "Solidity, JavaScript";
  const freelancerCountry = 'Nigeria'
  const freelancerGigTitle = 'I will design and develop a dApp'
  const images = ['https://image.com/freelancerImage', 'https://image.com/gigImage']
  const freelancerGigDesc = 'Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using '
  const starting_price = '100'

  let jobTitle = "Sample Job";
  let jobDescription = "This is a test job";
  let jobBudget = '100';

  let dfreelancer: Dfreelancer;
  let freelancer: any;
  let employer: any;
  let owner: any;
  let freelancerAddress:any
  let employerAddress:any

  beforeEach(async () => {
    [owner, freelancer, employer] = await ethers.getSigners();
    freelancerAddress = freelancer.address
    employerAddress = employer.address
    const DfreelancerFactory = await ethers.getContractFactory("Dfreelancer");

    // Deploy using OpenZeppelin Upgrades Proxy
    dfreelancer = await upgrades.deployProxy(
      DfreelancerFactory,
      [owner.address], // initializer arguments
      {
        initializer: "initialize",
        kind: "transparent", // recommended
      }
    ) as unknown as Dfreelancer;

    await dfreelancer.waitForDeployment();
  });


  it("Should create a job", async () => {
    await dfreelancer.connect(employer).registerEmployer("Ahmod", "technology", "United States", "https://google.com/image.png");
    await dfreelancer.connect(owner).registerEmployer("Ahmod", "technology", "United States", "https://google.com/image.png");

    await dfreelancer.connect(employer).createJob(jobTitle, jobDescription, ethers.parseEther("100"));

    const job = await dfreelancer.getJobByID("1");
    expect(job.employer).to.equal(employer.address);
    expect(job.title).to.equal(jobTitle);
    expect(job.description).to.equal(jobDescription);
    expect(job.budget.toString()).to.equal(ethers.parseEther(jobBudget));
    expect(job.completed).to.be.false;

  });

  it("Should register a freelancer", async () => {
    await dfreelancer.connect(freelancer).registerFreelancer(
      freelancerName, freelancerSkills, freelancerCountry,
      freelancerGigTitle, freelancerGigDesc, images, starting_price
    );

    await dfreelancer.connect(owner).registerFreelancer(
      freelancerName, freelancerSkills, freelancerCountry,
      freelancerGigTitle, freelancerGigDesc, images, starting_price
    );

    const registeredFreelancer = await dfreelancer.freelancers(freelancerAddress);
    expect(registeredFreelancer.freelancerAddress).to.equal(freelancerAddress);
    expect(registeredFreelancer.name).to.equal(freelancerName);
    expect(registeredFreelancer.skills).to.equal(freelancerSkills);
    expect(registeredFreelancer.balance).to.equal(0);
  });

  it("Should edit a registered freelancer", async function () {
  await dfreelancer.connect(freelancer).registerFreelancer(
    freelancerName,
    freelancerSkills,
    freelancerCountry,
    freelancerGigTitle,
    freelancerGigDesc,
    images,
    starting_price
  );

  const newDetails = {
    name: "Updated Name",
    skills: "Rust, Solidity",
    country: "Ghana",
    gigTitle: "Updated dApp Gig",
    gigDesc: "Updated description of gig.",
    images: ["https://newimage.com/freelancer", "https://newimage.com/gig"],
    startingPrice: "150"
  };

  await dfreelancer.connect(freelancer).editFreelancerProfile(
    newDetails.name,
    newDetails.skills,
    newDetails.country,
    newDetails.gigTitle,
    newDetails.gigDesc,
    newDetails.images,
    newDetails.startingPrice
  );

  const updated = await dfreelancer.getFreelancerByAddress(freelancer.address);
  expect(updated.name).to.equal(newDetails.name);
  expect(updated.skills).to.equal(newDetails.skills);
  expect(updated.country).to.equal(newDetails.country);
  expect(updated.gigTitle).to.equal(newDetails.gigTitle);
  expect(updated.gitDescription).to.equal(newDetails.gigDesc);
  expect(updated.images[0]).to.equal(newDetails.images[0]);
  expect(updated.images[1]).to.equal(newDetails.images[1]);
  expect(updated.starting_price.toString()).to.equal(newDetails.startingPrice);
});


it("Should edit a registered employer", async function () {
  await dfreelancer.connect(employer).registerEmployer(
    "Ahmod",
    "Tech",
    "USA",
    "https://img.com"
  );

  const newEmployer = {
    name: "Updated Employer",
    industry: "Blockchain",
    country: "Canada",
    image: "https://newimage.com/employer"
  };

  await dfreelancer.connect(employer).editEmployerProfile(
    newEmployer.name,
    newEmployer.industry,
    newEmployer.country,
    newEmployer.image
  );

  const employerInfo = await dfreelancer.getEmployerByAddress(employer.address);
  expect(employerInfo.name).to.equal(newEmployer.name);
  expect(employerInfo.industry).to.equal(newEmployer.industry);
  expect(employerInfo.country).to.equal(newEmployer.country);
  expect(employerInfo.image).to.equal(newEmployer.image);
});


  it("Should hire a freelancer", async () => {
    await dfreelancer.connect(freelancer).registerFreelancer(
      freelancerName, freelancerSkills, freelancerCountry,
      freelancerGigTitle, freelancerGigDesc, images, starting_price
    );

    await dfreelancer.connect(employer).registerEmployer("Ahmod", "technology", "United States", "https://img.com");
    await dfreelancer.connect(employer).createJob(jobTitle, jobDescription, ethers.parseEther("100"));

    await dfreelancer.connect(freelancer).applyForJob("1");
    await dfreelancer.connect(employer).hireFreelancer("1", freelancerAddress);

    const job = await dfreelancer.getJobByID("1");
    expect(job.hiredFreelancer).to.equal(freelancerAddress);
  });

  it("Should complete a job", async () => {
    await dfreelancer.connect(freelancer).registerFreelancer(
      freelancerName, freelancerSkills, freelancerCountry,
      freelancerGigTitle, freelancerGigDesc, images, starting_price
    );

    await dfreelancer.connect(employer).registerEmployer("Ahmod", "technology", "United States", "https://img.com");
    await dfreelancer.connect(employer).createJob(jobTitle, jobDescription, ethers.parseEther("100"));

    await dfreelancer.connect(freelancer).applyForJob("1");
    await dfreelancer.connect(employer).hireFreelancer("1", freelancerAddress);
    await dfreelancer.connect(employer).completeJob("1", freelancerAddress);

    const job = await dfreelancer.getJobByID("1");
    expect(job.completed).to.be.true;
  });

  it("Should deposit funds to a job", async () => {
    const fund = "100";

    await dfreelancer.connect(freelancer).registerFreelancer(
      freelancerName, freelancerSkills, freelancerCountry,
      freelancerGigTitle, freelancerGigDesc, images, starting_price
    );

    await dfreelancer.connect(employer).registerEmployer("Ahmod", "technology", "United States", "https://img.com");
    await dfreelancer.connect(employer).createJob(jobTitle, jobDescription, ethers.parseEther("100"));

    await dfreelancer.connect(employer).depositFunds("1", {
      value: ethers.parseEther(fund),
    });

    const escrowFund = await dfreelancer.getEmployerEscrow(employerAddress, "1");
    const _employer = await dfreelancer.getEmployerByAddress(employerAddress);

    expect(_employer.balance).to.equal(ethers.parseEther(fund));
    expect(escrowFund).to.equal(ethers.parseEther(fund));
  });

  it("Should release escrow funds to a freelancer", async () => {
    const fund = "200";

    await dfreelancer.connect(freelancer).registerFreelancer(
      freelancerName, freelancerSkills, freelancerCountry,
      freelancerGigTitle, freelancerGigDesc, images, starting_price
    );

    await dfreelancer.connect(employer).registerEmployer("Ahmod", "technology", "United States", "https://img.com");
    await dfreelancer.connect(employer).createJob(jobTitle, jobDescription, ethers.parseEther("100"));
    await dfreelancer.connect(freelancer).applyForJob("1");

    await dfreelancer.connect(employer).hireFreelancer("1", freelancerAddress);
    await dfreelancer.connect(employer).depositFunds("1", { value: ethers.parseEther(fund) });
    await dfreelancer.connect(employer).completeJob("1", freelancerAddress);
    await dfreelancer.connect(employer).releaseEscrow("1", freelancerAddress);

    const updatedBalance = (await dfreelancer.freelancers(freelancerAddress)).balance;
    expect(updatedBalance.toString()).to.equal(ethers.parseEther(fund).toString());
  });

  it("Should withdraw earnings", async () => {
    const fund = "100";
    const incentive = 5;
    const expected = BigInt(fund) - (BigInt(fund) * BigInt(incentive)) / 100n;

    await dfreelancer.connect(freelancer).registerFreelancer(
      freelancerName, freelancerSkills, freelancerCountry,
      freelancerGigTitle, freelancerGigDesc, images, starting_price
    );

    await dfreelancer.connect(employer).registerEmployer("Ahmod", "technology", "United States", "https://img.com");
    await dfreelancer.connect(employer).createJob(jobTitle, jobDescription, ethers.parseEther("100"));

    await dfreelancer.connect(freelancer).applyForJob("1");
    await dfreelancer.connect(employer).hireFreelancer("1", freelancerAddress);
    await dfreelancer.connect(employer).depositFunds("1", { value: ethers.parseEther(fund) });
    await dfreelancer.connect(employer).completeJob("1", freelancerAddress);
    await dfreelancer.connect(employer).releaseEscrow("1", freelancerAddress);

    const tx = await dfreelancer.connect(freelancer).withdrawEarnings();
    const receipt = await tx.wait();

    const event = receipt?.logs
      .map((log: any) => dfreelancer.interface.parseLog(log))
      .find((e: any) => e.name === "WithdrawFund");

    assert.equal(event.args.amount.toString(), ethers.parseEther(expected.toString()).toString());
  });
});
