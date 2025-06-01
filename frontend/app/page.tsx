"use client"
import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import WalletConnect from './components/WalletConnect';
import { ethers } from 'ethers';
import HomeHero from '@/app/components/HomeHero';
import HowItWorks from '@/app/components/HowItWorks';
import HomeCTA from '@/app/components/HomeCTA';
import { useWallet } from './contexts/WalletContext';


export default function Home() {
  const {
    isConnected,
    isLoading,
    eoaAddress,
    aaAddress,
    error,
    signer,
    connectWallet,
    disconnectWallet
  } = useWallet();

  return (
    <div>
      <HomeHero signer={signer} aaAddress={aaAddress} />
      <HowItWorks />
      <HomeCTA />
    </div>
  );
};
