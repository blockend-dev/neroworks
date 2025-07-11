import { BigNumber, ethers } from 'ethers';
import { Client, Presets } from 'userop';
import { NERO_CHAIN_CONFIG, AA_PLATFORM_CONFIG, CONTRACT_ADDRESSES, API_KEY } from '../config';
import { ABI } from '@/constants';

// =================================================================
// Provider and Signer Management
// =================================================================

/**
 * Get provider instance for Nerochain
 */
export const getProvider = () => {
  // TODO: Implement this function to return a JsonRpcProvider
  return new ethers.providers.JsonRpcProvider(NERO_CHAIN_CONFIG.rpcUrl);
};

/**
 * Get signer from browser wallet (like MetaMask)
 * 
 * @returns Connected wallet signer
 */
// Get signer from browser wallet
export const getSigner = async () => {
  if (!window.ethereum) {
    throw new Error("No crypto wallet found. Please install MetaMask.");
  }
  
  try {
    // Request account access
    await window.ethereum.request({ method: 'eth_requestAccounts' });
 
    // Create provider and signer
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
 
    // Verify the signer by getting its address
    const address = await signer.getAddress();
    console.log("Connected wallet address:", address);
 
    return signer;
  } catch (error) {
    console.error("Error connecting to wallet:", error);
    throw error;
  }
};

// =================================================================
// Account Abstraction Client
// =================================================================

/**
 * Initialize AA Client
 * 
 * @param accountSigner The signer to use
 * @returns AA Client
 */
export const initAAClient = async (accountSigner: ethers.Signer) => {
  try {
    // TODO: Implement this function to initialize the AA client
    return await Client.init(NERO_CHAIN_CONFIG.rpcUrl, {
      overrideBundlerRpc: AA_PLATFORM_CONFIG.bundlerRpc,
      entryPoint: CONTRACT_ADDRESSES.entryPoint,
    });
  } catch (error) {
    console.error("Error initializing AA client:", error);
    throw error;
  }
};

/**
 * Get the AA wallet address for a signer
 * 
 * @param accountSigner The signer to use
 * @returns AA wallet address
 */
export const getAAWalletAddress = async (accountSigner: ethers.Signer) => {
  try {
    // Ensure we have a valid signer with getAddress method
    if (!accountSigner || typeof accountSigner.getAddress !== 'function') {
      throw new Error("Invalid signer object: must have a getAddress method");
    }
    
    // Initialize the SimpleAccount builder
    const simpleAccount = await Presets.Builder.SimpleAccount.init(
      accountSigner,
      NERO_CHAIN_CONFIG.rpcUrl,
      {
        overrideBundlerRpc: AA_PLATFORM_CONFIG.bundlerRpc,
        entryPoint: CONTRACT_ADDRESSES.entryPoint,
        factory: CONTRACT_ADDRESSES.accountFactory,
      }
    );
    
    // Get the counterfactual address of the AA wallet
    const address = await simpleAccount.getSender();
    console.log("AA wallet address:", address);
    
    return address;
  } catch (error) {
    console.error("Error getting AA wallet address:", error);
    throw error;
  }
};

// =================================================================
// Paymaster Integration
// =================================================================

/**
 * Initialize AA Builder
 * 
 * @param accountSigner The signer to use
 * @param apiKey Optional API key to use
 * @returns AA Builder
 */
export const initAABuilder = async (accountSigner: ethers.Signer, apiKey?: string) => {
  try {
    // Ensure we have a valid signer with getAddress method
    if (!accountSigner || typeof accountSigner.getAddress !== 'function') {
      throw new Error("Invalid signer object: must have a getAddress method");
    }
 
    // Get the signer address to verify it's working
    const signerAddress = await accountSigner.getAddress();
    console.log("Initializing AA builder for address:", signerAddress);
    
    // Initialize the SimpleAccount builder
    const builder = await Presets.Builder.SimpleAccount.init(
      accountSigner,
      NERO_CHAIN_CONFIG.rpcUrl,
      {
        overrideBundlerRpc: AA_PLATFORM_CONFIG.bundlerRpc,
        entryPoint: CONTRACT_ADDRESSES.entryPoint,
        factory: CONTRACT_ADDRESSES.accountFactory,
      }
    );
    
    // Set API key for paymaster
    const currentApiKey = apiKey || API_KEY;
    
    // Set paymaster options with API key
    builder.setPaymasterOptions({
      apikey: currentApiKey,
      rpc: AA_PLATFORM_CONFIG.paymasterRpc,
      type: "0" // Default to free (sponsored gas)
    });
    
    // Set gas parameters for the UserOperation
    builder.setCallGasLimit(300000);
    builder.setVerificationGasLimit(2000000);
    builder.setPreVerificationGas(100000);
    
    return builder;
  } catch (error) {
    console.error("Error initializing AA builder:", error);
    throw error;
  }
};

/**
 * Configure payment type for transactions
 * 
 * @param builder The AA builder
 * @param paymentType Payment type (0=free, 1=prepay, 2=postpay)
 * @param tokenAddress Optional token address for ERC20 payments
 * @returns Updated builder
 */
export const setPaymentType = (builder: any, paymentType: number, tokenAddress: string = '') => {
  const paymasterOptions: any = { 
    type: paymentType.toString(),
    apikey: API_KEY,
    rpc: AA_PLATFORM_CONFIG.paymasterRpc
  };
  
  // Add token address if ERC20 payment is selected
  if (paymentType > 0 && tokenAddress) {
    paymasterOptions.token = tokenAddress;
  }
  
  builder.setPaymasterOptions(paymasterOptions);
  return builder;
};
// =================================================================
// UserOperations
// =================================================================

/**
 * Execute a contract call via AA and paymaster
 * 
 * @param accountSigner The signer to use
 * @param contractAddress Target contract address
 * @param contractAbi Contract ABI
 * @param functionName Function to call
 * @param functionParams Function parameters
 * @param paymentType Payment type (0=free, 1=prepay, 2=postpay)
 * @param selectedToken Token address for ERC20 payments
 * @param options Additional options
 * @returns Transaction result
 */
export const executeOperation = async (
  accountSigner: ethers.Signer,
  contractAddress: string,
  contractAbi: any,
  functionName: string,
  functionParams: any[],
  paymentType: number = 0,
  selectedToken: string = '',
  options?: {
    apiKey?: string;
    gasMultiplier?: number;
  }
) => {
  try {
    // Validate signer
    if (!accountSigner || typeof accountSigner.getAddress !== 'function') {
      throw new Error("Invalid signer: missing getAddress method");
    }
    
    // Initialize client
    const client = await initAAClient(accountSigner);
 
    // Initialize builder with paymaster
    const builder = await initAABuilder(accountSigner, options?.apiKey);
 
    // Set payment type and token if specified
    if (paymentType > 0 && selectedToken) {
      // Set payment options for ERC20 tokens
      builder.setPaymasterOptions({
        apikey: options?.apiKey || API_KEY,
        rpc: AA_PLATFORM_CONFIG.paymasterRpc,
        type: paymentType.toString(),
        token: selectedToken
      });
    } else {
      // Set default payment options (sponsored)
      builder.setPaymasterOptions({
        apikey: options?.apiKey || API_KEY,
        rpc: AA_PLATFORM_CONFIG.paymasterRpc,
        type: paymentType.toString()
      });
    }
 
    // Create contract instance
    const contract = new ethers.Contract(
      contractAddress,
      contractAbi,
      getProvider()
    );
 
    // Encode function call data
    const callData = contract.interface.encodeFunctionData(
      functionName,
      functionParams
    );
 
    // Set transaction data in the builder
    const userOp = await builder.execute(contractAddress, 0, callData);
 
    // Send the user operation
    console.log("Sending UserOperation to bundler");
    const res = await client.sendUserOperation(userOp);
 
    console.log("UserOperation sent with hash:", res.userOpHash);
 
    // Wait for the transaction to be included
    const receipt = await res.wait();
 
    // Log transaction hash when available
    if (receipt && receipt.transactionHash) {
      console.log("Transaction mined:", receipt.transactionHash);
    }
 
    // Return operation results
    return {
      userOpHash: res.userOpHash,
      transactionHash: receipt?.transactionHash || '',
      receipt: receipt
    };
  } catch (error) {
    console.error("Error executing operation:", error);
    throw error;
  }
};

// =================================================================
// NEROWORKS SMART CONTRACT FUNCTIONS
// =================================================================

// register freelancer
export const registerFreelancer = async (
  accountSigner: ethers.Signer,
  creator : string,
  freelancerName :string,
  freelancerSkills : string,
  freelancerCountry : string,
  freelancerGigTitle : string,
  freelancerGigDesc:string,
  images:string[],
  starting_price:BigNumber,
  paymentType: number = 0,
  selectedToken: string = '',
  options?: {
    apiKey?: string;
    gasMultiplier?: number;
  }
) => {
  try {
    // Execute the register freelancer function
    return await executeOperation(
      accountSigner,
      CONTRACT_ADDRESSES.nftContract,
      ABI,
      'registerFreelancer',
      [creator,freelancerName, freelancerSkills,freelancerCountry,
      freelancerGigTitle,freelancerGigDesc, images,starting_price],
      paymentType,
      selectedToken,
      options
    );
  } catch (error) {
    console.error("Error registering freelancer:", error);
    throw error;
  }
};

// edit freelancer profile
export const editFreelancer = async (
  accountSigner: ethers.Signer,
  freelancerName :string,
  freelancerSkills : string,
  freelancerCountry : string,
  freelancerGigTitle : string,
  freelancerGigDesc:string,
  images:string[],
  starting_price:BigNumber,
  paymentType: number = 0,
  selectedToken: string = '',
  options?: {
    apiKey?: string;
    gasMultiplier?: number;
  }
) => {
  try {
    // Execute the edit freelancer function
    return await executeOperation(
      accountSigner,
      CONTRACT_ADDRESSES.nftContract,
      ABI,
      'editFreelancerProfile',
      [freelancerName, freelancerSkills,freelancerCountry,
      freelancerGigTitle,freelancerGigDesc, images,starting_price],
      paymentType,
      selectedToken,
      options
    );
  } catch (error) {
    console.error("Error editing freelancer profile:", error);
    throw error;
  }
};

// Register Employer
export const registerEmployer = async (
  accountSigner: ethers.Signer,
  creator : string,
  name: string,
  industry: string,
  country: string,
  imageURI: string,
  paymentType: number = 0,
  selectedToken: string = '',
  options?: {
    apiKey?: string;
    gasMultiplier?: number;
  }
) => {
  try {
    return await executeOperation(
      accountSigner,
      CONTRACT_ADDRESSES.nftContract,
      ABI,
      'registerEmployer',
      [creator, name, industry, country, imageURI],
      paymentType,
      selectedToken,
      options
    );
  } catch (error) {
    console.error("Error registering employer:", error);
    throw error;
  }
};

// edit employer profile
export const editEmployer = async (
  accountSigner: ethers.Signer,
  name: string,
  industry: string,
  country: string,
  imageURI: string,
  paymentType: number = 0,
  selectedToken: string = '',
  options?: {
    apiKey?: string;
    gasMultiplier?: number;
  }
) => {
  try {
    return await executeOperation(
      accountSigner,
      CONTRACT_ADDRESSES.nftContract,
      ABI,
      'editEmployerProfile',
      [name, industry, country, imageURI],
      paymentType,
      selectedToken,
      options
    );
  } catch (error) {
    console.error("Error editing employer:", error);
    throw error;
  }
};

// Create Job
export const createJob = async (
  accountSigner: ethers.Signer,
  title: string,
  description: string,
  budget: ethers.BigNumberish,
  paymentType: number = 0,
  selectedToken: string = '',
  options?: {
    apiKey?: string;
    gasMultiplier?: number;
  }
) => {
  try {
    return await executeOperation(
      accountSigner,
      CONTRACT_ADDRESSES.nftContract,
      ABI,
      'createJob',
      [title, description, budget],
      paymentType,
      selectedToken,
      options
    );
  } catch (error) {
    console.error("Error creating job:", error);
    throw error;
  }
};

// Apply for Job
export const applyForJob = async (
  accountSigner: ethers.Signer,
  jobId: number,
  paymentType: number = 0,
  selectedToken: string = '',
  options?: {
    apiKey?: string;
    gasMultiplier?: number;
  }
) => {
  try {
    return await executeOperation(
      accountSigner,
      CONTRACT_ADDRESSES.nftContract,
      ABI,
      'applyForJob',
      [jobId],
      paymentType,
      selectedToken,
      options
    );
  } catch (error) {
    console.error("Error applying for job:", error);
    throw error;
  }
};

// Hire Freelancer
export const hireFreelancer = async (
  accountSigner: ethers.Signer,
  jobId: number,
  freelancerAddress: string,
  paymentType: number = 0,
  selectedToken: string = '',
  options?: {
    apiKey?: string;
    gasMultiplier?: number;
  }
) => {
  try {
    return await executeOperation(
      accountSigner,
      CONTRACT_ADDRESSES.nftContract,
      ABI,
      'hireFreelancer',
      [jobId, freelancerAddress],
      paymentType,
      selectedToken,
      options
    );
  } catch (error) {
    console.error("Error hiring freelancer:", error);
    throw error;
  }
};

// Deposit Funds
export const depositFunds = async (
  accountSigner: ethers.Signer,
  jobId: number,
  value: ethers.BigNumberish, 
  paymentType: number = 1,
  selectedToken: string = '',
  options?: {
    apiKey?: string;
    gasMultiplier?: number;
  }
) => {
  try {
    return await executeOperation(
      accountSigner,
      CONTRACT_ADDRESSES.nftContract,
      ABI,
      'depositFunds',
      [jobId,value],
      paymentType,
      selectedToken,
      options
    );
  } catch (error) {
    console.error("Error depositing funds:", error);
    throw error;
  }
};

// Release Escrow
export const releaseEscrow = async (
  accountSigner: ethers.Signer,
  jobId: number,
  freelancerAddress: string,
  paymentType: number = 0,
  selectedToken: string = '',
  options?: {
    apiKey?: string;
    gasMultiplier?: number;
  }
) => {
  try {
    return await executeOperation(
      accountSigner,
      CONTRACT_ADDRESSES.nftContract,
      ABI,
      'releaseEscrow',
      [jobId, freelancerAddress],
      paymentType,
      selectedToken,
      options
    );
  } catch (error) {
    console.error("Error releasing escrow:", error);
    throw error;
  }
};

// Complete Job
export const completeJob = async (
  accountSigner: ethers.Signer,
  jobId: number,
  freelancerAddress: string,
  paymentType: number = 0,
  selectedToken: string = '',
  options?: {
    apiKey?: string;
    gasMultiplier?: number;
  }
) => {
  try {
    return await executeOperation(
      accountSigner,
      CONTRACT_ADDRESSES.nftContract,
      ABI,
      'completeJob',
      [jobId, freelancerAddress],
      paymentType,
      selectedToken,
      options
    );
  } catch (error) {
    console.error("Error completing job:", error);
    throw error;
  }
};

// Withdraw Earnings
export const withdrawEarnings = async (
  accountSigner: ethers.Signer,
  paymentType: number = 0,
  selectedToken: string = '',
  options?: {
    apiKey?: string;
    gasMultiplier?: number;
  }
) => {
  try {
    return await executeOperation(
      accountSigner,
      CONTRACT_ADDRESSES.nftContract,
      ABI,
      'withdrawEarnings',
      [],
      paymentType,
      selectedToken,
      options
    );
  } catch (error) {
    console.error("Error withdrawing earnings:", error);
    throw error;
  }
};

// ========== NEROWORKS SMART CONTRACT READ-ONLY FUNCTIONS ==========

export const getAllJobs = async (signer: ethers.providers.JsonRpcSigner) => {
  const contract = new ethers.Contract(CONTRACT_ADDRESSES.nftContract, ABI, getProvider());
  return await contract.allJobs();
};


export const getJobByID = async (signer: ethers.providers.JsonRpcSigner, jobId: number) => {
  const contract = new ethers.Contract(
   CONTRACT_ADDRESSES.nftContract,
    ABI,
    getProvider()
  );
  
  try {
    const job = await contract.getJobByID(jobId);
    return {
      id: jobId,
      title: job.title,
      description: job.description,
      budget: job.budget.toString(),
      completed: job.completed,
      employer: job.employer,
      applicants: job.applicants || [],
      hiredFreelancer: job.hiredFreelancer
    };
  } catch (error) {
    console.error("Error fetching job:", error);
    return null;
  }
};
export const getAllFreelancers = async (signer: ethers.providers.JsonRpcSigner) => {
  const contract = new ethers.Contract(CONTRACT_ADDRESSES.nftContract, ABI, getProvider());
  return await contract.getAllFreelancers();
};

export const getFreelancerByAddress = async (signer: ethers.providers.JsonRpcSigner, address: string) => {
  const contract = new ethers.Contract(CONTRACT_ADDRESSES.nftContract, ABI, getProvider());
  return await contract.getFreelancerByAddress(address);
};

export const getEmployerByAddress = async (signer: ethers.providers.JsonRpcSigner, address: string) => {
  const contract = new ethers.Contract(CONTRACT_ADDRESSES.nftContract, ABI, getProvider());
  return await contract.getEmployerByAddress(address);
};

export const getEmployerEscrow = async (
  signer: ethers.providers.JsonRpcSigner,
  employer: string,
  jobId: number
) => {
  const contract = new ethers.Contract(CONTRACT_ADDRESSES.nftContract, ABI, getProvider());
  return await contract.getEmployerEscrow(employer, jobId);
};

export const totalFreelancers = async (signer: ethers.providers.JsonRpcSigner) => {
  const contract = new ethers.Contract(CONTRACT_ADDRESSES.nftContract, ABI, getProvider());
  return await contract.totalFreelancers();
};

export const totalEmployers = async (signer: ethers.providers.JsonRpcSigner) => {
  const contract = new ethers.Contract(CONTRACT_ADDRESSES.nftContract, ABI, getProvider());
  return await contract.totalEmployers();
};

export const totalJobs = async (signer: ethers.providers.JsonRpcSigner) => {
  const contract = new ethers.Contract(CONTRACT_ADDRESSES.nftContract, ABI, getProvider());
  return await contract.totalJobs();
};

export const totalCompletedJobs = async (signer: ethers.providers.JsonRpcSigner) => {
  const contract = new ethers.Contract(CONTRACT_ADDRESSES.nftContract, ABI, getProvider());
  return await contract.totalCompletedJobs();
};

// =================================================================
// Token Support
// =================================================================

/**
 * Get supported tokens from the paymaster
 * 
 * @param client AA client instance
 * @param builder AA builder instance
 * @returns List of supported tokens
 */
export const getSupportedTokens = async (client: any, builder: any) => {
  try {
    // Make sure the builder is initialized
    if (!builder) {
      throw new Error("Builder not initialized");
    }
 
    // Get the AA wallet address
    const sender = await builder.getSender();
    console.log("Getting supported tokens for wallet:", sender);
 
    // Create a minimal UserOp for querying tokens
    const minimalUserOp = {
      sender,
      nonce: "0x0",
      initCode: "0x",
      callData: "0x",
      callGasLimit: "0x88b8",
      verificationGasLimit: "0x33450",
      preVerificationGas: "0xc350",
      maxFeePerGas: "0x2162553062",
      maxPriorityFeePerGas: "0x40dbcf36",
      paymasterAndData: "0x",
      signature: "0x"
    };
 
    // Setup provider for paymaster API call
    const provider = new ethers.providers.JsonRpcProvider(AA_PLATFORM_CONFIG.paymasterRpc);
    console.log("Connecting to paymaster RPC at:", AA_PLATFORM_CONFIG.paymasterRpc);
 
    // Log API key (redacted for security)
    const maskedApiKey = API_KEY ? `${API_KEY.substring(0, 4)}...${API_KEY.substring(API_KEY.length - 4)}` : 'undefined';
    console.log(`Using API key: ${maskedApiKey}`);
    
    // Try different parameter formats for the paymaster API
    let tokensResponse;
    
    try {
      // First format attempt: [userOp, apiKey, entryPoint]
      console.log("Trying first parameter format for pm_supported_tokens");
      tokensResponse = await provider.send("pm_supported_tokens", [
        minimalUserOp,
        API_KEY,
        CONTRACT_ADDRESSES.entryPoint
      ]);
    } catch (formatError) {
      console.warn("First parameter format failed:", formatError);
      
      try {
        // Second format attempt: { userOp, entryPoint, apiKey }
        console.log("Trying second parameter format for pm_supported_tokens");
        tokensResponse = await provider.send("pm_supported_tokens", [{
          userOp: minimalUserOp,
          entryPoint: CONTRACT_ADDRESSES.entryPoint,
          apiKey: API_KEY
        }]);
      } catch (format2Error) {
        console.warn("Second parameter format failed:", format2Error);
        
        // Third format attempt: { op, entryPoint }
        console.log("Trying third parameter format for pm_supported_tokens");
        tokensResponse = await provider.send("pm_supported_tokens", [{
          op: minimalUserOp,
          entryPoint: CONTRACT_ADDRESSES.entryPoint
        }]);
      }
    }
 
    console.log("Tokens response:", tokensResponse);
 
    // Transform and return the results
    if (!tokensResponse) {
      console.log("No tokens response received");
      return [];
    }
    
    // Handle different response formats
    let tokens = [];
    if (tokensResponse.tokens) {
      tokens = tokensResponse.tokens;
    } else if (Array.isArray(tokensResponse)) {
      tokens = tokensResponse;
    } else if (typeof tokensResponse === 'object') {
      // Try to find tokens in the response object
      const possibleTokensArray = Object.values(tokensResponse).find(val => Array.isArray(val));
      if (possibleTokensArray && Array.isArray(possibleTokensArray)) {
        tokens = possibleTokensArray as any[];
      }
    }
    
    if (tokens.length === 0) {
      console.log("No tokens found in response");
      return [];
    }
    
    // Log the raw token response for debugging
    console.log("Raw tokens response:", JSON.stringify(tokensResponse));
    
    // Try to find flags in the response that might indicate token types
    const isArrayWithFreepayFlag = tokens.some((t: any) => 
      'freepay' in t || 'prepay' in t || 'postpay' in t
    );
      
    if (isArrayWithFreepayFlag) {
      console.log("Detected payment type flags in token response");
    }
 
    const mappedTokens = tokens.map((token: any) => {
      // Ensure token type is a valid number
      let tokenType = 1; // Default to type 1 (prepay)
      
      // Check if this is from a response with prepay/postpay flags
      if ('freepay' in token || 'prepay' in token || 'postpay' in token) {
        if (token.freepay === true) {
          tokenType = 0; // Sponsored
        } else if (token.prepay === true) {
          tokenType = 1; // Prepay
        } else if (token.postpay === true) {
          tokenType = 2; // Postpay
        }
      } 
      // Try to parse the type if it exists
      else if (token.type !== undefined) {
        if (typeof token.type === 'number' && !isNaN(token.type)) {
          tokenType = token.type;
        } else if (typeof token.type === 'string') {
          const parsedType = parseInt(token.type);
          if (!isNaN(parsedType)) {
            tokenType = parsedType;
          }
        }
      }
      
      // Create the token object with normalized properties
      return {
        address: token.token || token.address,
        decimal: parseInt(token.decimal || token.decimals || "18"),
        symbol: token.symbol,
        type: tokenType,
        price: token.price ? parseFloat(token.price) : undefined,
        // Add the original flags for debugging and alternative filtering
        prepay: token.prepay === true,
        postpay: token.postpay === true || token.prepay ===true,
        freepay: token.freepay === true
      };
    });
 
    console.log("Mapped tokens:", mappedTokens);
    return mappedTokens;
  } catch (error) {
    console.error("Error fetching supported tokens:", error);
    // Include paymaster URL in error for debugging
    console.error("Paymaster URL:", AA_PLATFORM_CONFIG.paymasterRpc);
    return [];
  }
};