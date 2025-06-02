"use client"
import React, { useState } from 'react';
import HomeHero from '@/app/components/HomeHero';
import HowItWorks from '@/app/components/HowItWorks';
import HomeCTA from '@/app/components/HomeCTA';
import { useWallet } from './contexts/WalletContext';


export default function Home() {
  const {
    aaAddress,
    signer,
  } = useWallet();

  return (
    <div>
      <HomeHero signer={signer} aaAddress={aaAddress} />
      <HowItWorks />
      <HomeCTA />
    </div>
  );
};
