// Configuration for Nerochain network and Account Abstraction

// Network configuration
export const NERO_CHAIN_CONFIG = {
    chainId: 689,  // Nerochain testnet chain ID
    chainName: "NERO Chain Testnet",
    rpcUrl: process.env.REACT_APP_NERO_RPC_URL || "https://rpc-testnet.nerochain.io",
    currency: "NERO",
    explorer: "https://testnet.neroscan.io"
  };
  
  // Account Abstraction Platform configuration
  export const AA_PLATFORM_CONFIG = {
    bundlerRpc: process.env.REACT_APP_BUNDLER_URL || "https://bundler-testnet.nerochain.io/",
    paymasterRpc: process.env.REACT_APP_PAYMASTER_URL || "https://paymaster-testnet.nerochain.io",
  };
  
  // Contract addresses - replace with your own as needed
  export const CONTRACT_ADDRESSES = {
    // ERC-4337 EntryPoint contract address
    entryPoint: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
    
    // SimpleAccount Factory address
    accountFactory: "0x9406Cc6185a346906296840746125a0E44976454",
    
    // Token Paymaster address
    tokenPaymaster: "0x5a6680dFd4a77FEea0A7be291147768EaA2414ad",
    
    // Example NFT contract address - replace with your own
    nftContract: process.env.NEXT_PUBLIC_NFT_CONTRACT || "0xB8e64a2D91eA6dbBCD3cAF6DE1B1A93223Ad2467",
  };
  
  // API key management for Paymaster
  export let API_KEY: string = process.env.NEXT_PUBLIC_REACT_APP_PAYMASTER_API_KEY || "";

  // Helper function to check if we're on the client side
const isClient = () => typeof window !== 'undefined';
  
  // Function to store and retrieve the API key
  export const setApiKey = (key: string) => {
    API_KEY = key;
    localStorage.setItem('nerochain_api_key', key);
  };
  
  // Initialize API key from localStorage if available
  export const initApiKey = () => {
    if (!isClient()) return false; // Exit if on server
    const savedApiKey = localStorage.getItem('nerochain_api_key');
    if (savedApiKey) {
      API_KEY = savedApiKey;
      return true;
    }
    return false;
  };
  
  // Initialize API key on load
  initApiKey(); 