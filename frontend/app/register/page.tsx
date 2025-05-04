'use client';

import { useEffect, useState } from 'react';
import RegisterFreelancer from '@/app/components/RegisterFreelancer';
import RegisterEmployer from '@/app/components/RegisterEmployer';
import { ToastContainer, toast } from 'react-toastify';
import WalletConnect from '@/app/components/WalletConnect';
import { ethers } from 'ethers';
import { getSigner } from '@/utils/aaUtils';
import { getSupportedTokens, initAAClient, initAABuilder } from '../../utils/aaUtils';


export default function RegisterPage() {
  const [role, setRole] = useState<'freelancer' | 'employer' | null>(null);
  // State to track wallet connection
  const [signer, setSigner] = useState<ethers.Signer | undefined>(undefined);
  const [eoaAddress, setEoaAddress] = useState<string>('');
  const [aaAddress, setAaAddress] = useState<string>('');
  const [supportedTokens, setSupportedTokens] = useState<Array<any>>([]);
  const [isFetchingTokens, setIsFetchingTokens] = useState(false);



  useEffect(() => {
    const storedRole = localStorage.getItem('user_role') as 'freelancer' | 'employer' | null;
    setRole(storedRole);
  }, []);
  // Load supported tokens when component mounts and signer is available
  useEffect(() => {
    const loadTokens = async () => {
      // Only run if signer is defined
      if (signer) {
        try {
          // Check if signer has getAddress method
          if (typeof signer.getAddress !== 'function') {
            console.error("Invalid signer: missing getAddress method");
            toast.error("Wallet connection issue: please reconnect your wallet");
            return;
          }

          // Verify signer is still connected by calling getAddress
          await signer.getAddress();

          // If connected, fetch tokens
          fetchSupportedTokens();
        } catch (error) {
          console.error("Signer validation error:", error);
          toast.error("Wallet connection issue: please reconnect your wallet");
        }
      } else {
        // Reset tokens if signer is not available
        setSupportedTokens([]);
        console.log("Signer not available, tokens reset");
      }
    };

    loadTokens();
  }, [signer]);


  /**
* Handle wallet connection - important to get a real signer!
*/
  const handleWalletConnected = async (eoaAddr: string, aaAddr: string) => {
    try {
      // Get the real signer from the wallet - don't use mock signers!
      const realSigner = await getSigner();

      setEoaAddress(eoaAddr);
      setAaAddress(aaAddr);
      setSigner(realSigner);

      toast.success('Wallet connected successfully!');
    } catch (error) {
      console.error("Error getting signer:", error);
      toast.error('Failed to get wallet signer. Please try again.');
    }
  };

  const fetchSupportedTokens = async () => {
    if (!signer) {
      console.log("Signer not available");
      return;
    }

    // Verify signer has getAddress method
    if (typeof signer.getAddress !== 'function') {
      console.error("Invalid signer: missing getAddress method");
      toast.error("Wallet connection issue: please reconnect your wallet");
      return;
    }

    try {
      setIsFetchingTokens(true);

      // Replace with your implementation based on the tutorial
      const client = await initAAClient(signer);
      const builder = await initAABuilder(signer);

      // Fetch supported tokens
      const tokens = await getSupportedTokens(client, builder);
      setSupportedTokens(tokens);
    } catch (error: any) {
      console.error("Error fetching supported tokens:", error);
      toast.error(`Token loading error: ${error.message || "Unknown error"}`);
    } finally {
      setIsFetchingTokens(false);
    }
  };


  if (!role) return <p className="text-center py-20">No role selected. Please go back to the homepage.</p>;

  return (
    <>
      <WalletConnect onWalletConnected={handleWalletConnected} />
      {role === 'freelancer' ? <RegisterFreelancer signer={signer} /> : <RegisterEmployer />}

    </>
  );
}
