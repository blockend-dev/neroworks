'use client';

import { useEffect, useState } from 'react';
import RegisterFreelancer from '@/app/components/RegisterFreelancer';
import RegisterEmployer from '@/app/components/RegisterEmployer';
import { toast } from 'react-toastify';
import { ethers } from 'ethers';
import { getSigner } from '@/utils/aaUtils';
import { getSupportedTokens, initAAClient, initAABuilder } from '../../utils/aaUtils';
import Link from 'next/link';
import { useWallet } from '../contexts/WalletContext';


export default function RegisterPage() {
  const {
        aaAddress,
        signer,
        isLoading
      } = useWallet();

  const [role, setRole] = useState<'freelancer' | 'employer' | null>(() => {
    return localStorage.getItem('user_role') as 'freelancer' | 'employer' | null;
  });
  // State to track wallet connection
  const [eoaAddress, setEoaAddress] = useState<string>('');
  const [supportedTokens, setSupportedTokens] = useState<Array<any>>([]);
  const [isFetchingTokens, setIsFetchingTokens] = useState(false);


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


  const fetchSupportedTokens = async () => {
     const signer = await getSigner();
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


  if (!role) return (
    <p className="text-center py-20">
      No role selected. Please go back to the{' '}
      <Link href="/" className="text-blue-600 hover:text-blue-800 hover:underline">
        Homepage
      </Link>
    </p>
  );
  return (
    <>
      {role === 'freelancer' ? <RegisterFreelancer /> : <RegisterEmployer />}

    </>
  );
}
