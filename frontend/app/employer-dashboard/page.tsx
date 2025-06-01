'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { ethers } from 'ethers';
import { getSigner, getSupportedTokens, initAAClient, initAABuilder } from '@/utils/aaUtils';
import WalletConnect from '../components/WalletConnect';
import { toast } from 'react-toastify';
import { useWallet } from '../contexts/WalletContext';

const EmployerDashboard = dynamic(() => import('@/app/components/EmployerDashboard'), { ssr: false });

const EmployerDashboardPage = () => {
    const {
      aaAddress,
      signer,
    } = useWallet();

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

  return (
    <>
      <EmployerDashboard signer={signer} aadresss={aaAddress} />

    </>
  );
};

export default EmployerDashboardPage;
