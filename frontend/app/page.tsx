"use client"
import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import WalletConnect from './components/WalletConnect';
import NFTMinter from './components/NFTMinter';
import { ethers } from 'ethers';
import { getSigner } from '../utils/aaUtils';
 
export default function Home(){
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
    <div className="app-container">
      <header className="app-header">
        <h1>NERO Chain dApp with Account Abstraction</h1>
      </header>
      
      <main className="app-main">
        <section className="wallet-section">
          <WalletConnect onWalletConnected={handleWalletConnected} />
        </section>
        
        {aaAddress && (
          <section className="nft-section">
            <NFTMinter 
              signer={signer} 
              aaWalletAddress={aaAddress} 
            />
          </section>
        )}
        
        {!aaAddress && (
          <section className="info-section">
            <div className="connect-prompt">
              <h3>Welcome to the Nerochain AA Template</h3>
              <p>Connect your wallet to get started with Account Abstraction.</p>
              <p>This template demonstrates:</p>
              <ul>
                <li>Connecting and generating AA wallets</li>
                <li>Using Paymasters for gas-free transactions</li>
                <li>Minting NFTs with various payment options</li>
                <li>Working with ERC20 tokens</li>
              </ul>
            </div>
          </section>
        )}
      </main>
      
      <footer className="app-footer">
        <p>
          Powered by Nerochain - <a href="https://docs.nerochain.io/" target="_blank" rel="noreferrer">Documentation</a>
        </p>
      </footer>
      
      {/* Toast notifications container */}
      <ToastContainer position="bottom-right" />
    </div>
  );
};
