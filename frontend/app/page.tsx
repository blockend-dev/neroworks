"use client"
import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import WalletConnect from './components/WalletConnect';
import { ethers } from 'ethers';
import { getSigner } from '../utils/aaUtils';
import HomeHero from '@/app/components/HomeHero';
import HowItWorks from '@/app/components/HowItWorks';
import HomeCTA from '@/app/components/HomeCTA';

export default function Home() {
  // State to track wallet connection
  const [signer, setSigner] = useState<ethers.Signer | undefined>(undefined);
  const [eoaAddress, setEoaAddress] = useState<string>('');
  const [aaAddress, setAaAddress] = useState<string>('');

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
  return (
    <div>
      <WalletConnect onWalletConnected={handleWalletConnected} />
      <HomeHero />
      <HowItWorks />
      <HomeCTA />
    </div>
  );
};
