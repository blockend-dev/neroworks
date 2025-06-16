/** @type import('hardhat/config').HardhatUserConfig */
require('@nomicfoundation/hardhat-toolbox')
require('@nomicfoundation/hardhat-chai-matchers')
require('solidity-coverage')
require('hardhat-deploy')
require('dotenv').config()
const { vars } = require("hardhat/config");
import '@openzeppelin/hardhat-upgrades';




const NERO_TESTNET_PROVIDER_URL = vars.get("NERO_TESTNET_PROVIDER_URL");
const PRIVATE_KEY = vars.get("PRIVATE_KEY");
const API_KEY = vars.get('API_KEY')

module.exports = {
  solidity: "0.8.24",
  settings: {
      optimizer: {
        enabled: true,
        runs: 200 
      }
    },
  typechain: {
    outDir: "typechain-types",
    target: "ethers-v6",
  },
  defaultNetwork: "hardhat",
  networks: {
      nero_testnet: {
      url: NERO_TESTNET_PROVIDER_URL,
      accounts: [PRIVATE_KEY],
      saveDeployments: true, 
      },
      hardhat: {
        chainId: 31337,
    },
    localhost: {
      chainId: 31337,
  },
  },
  namedAccounts: {
    deployer: {
        default: 0, // here this will by default take the first account as deployer
        1: 0, // similarly on mainnet it will take the first account as deployer. Note though that depending on how hardhat network are configured, the account 0 on one network can be different than on another
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