const { ethers, upgrades } = require("hardhat");

module.exports = async ({ getNamedAccounts }) => {
  const { deployer } = await getNamedAccounts();

  const Dfreelancer = await ethers.getContractFactory("Dfreelancer");

  console.log("Deploying Dfreelancer as an upgradeable proxy...");

  const dfreelancer = await upgrades.deployProxy(Dfreelancer, [deployer], {
    initializer: "initialize",
    kind: "transparent",
  });

  await dfreelancer.waitForDeployment();

  console.log("Dfreelancer deployed to proxy address:", await dfreelancer.getAddress());
};

module.exports.tags = ["Dfreelancer"];
