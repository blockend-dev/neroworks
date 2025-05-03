/** @type import('hardhat/config').HardhatUserConfig */
require('@nomicfoundation/hardhat-toolbox')
require('@nomicfoundation/hardhat-chai-matchers')
require('solidity-coverage')
require('hardhat-deploy')
require('dotenv').config()
const { vars } = require("hardhat/config");



const NERO_TESTNET_PROVIDER_URL = vars.get("NERO_TESTNET_PROVIDER_URL");
const PRIVATE_KEY = vars.get("PRIVATE_KEY");
const API_KEY = vars.get('API_KEY')

module.exports = {
  solidity: "0.8.24",
  typechain: {
    outDir: "typechain-types",
    target: "ethers-v6",
  },
  defaultNetwork: "hardhat",
  networks: {
      nero_testnet: {
      url: NERO_TESTNET_PROVIDER_URL,
      accounts: [PRIVATE_KEY],
      },
      hardhat: {
        chainId: 31337,
    },
    localhost: {
      chainId: 31337,
  },
  },
  etherscan: {
      apiKey: API_KEY,
      customChains: [
      {
          network: "nero_testnet",
          chainId: 689,
          urls: {
          apiURL: "https://api-testnet.neroscan.io/api",
          browserURL: "https://testnet.neroscan.io",
          },
      },
      ],
      enabled: true
      },
  };