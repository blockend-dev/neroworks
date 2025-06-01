import React, { useState, useEffect } from 'react';
import { getSigner, getAAWalletAddress } from '../../utils/aaUtils';
import { useWallet } from '../contexts/WalletContext';
import { ethers } from 'ethers';

interface WalletConnectProps {
    onWalletConnected?: (eoaAddress: string, aaAddress: string) => void;
}

const WalletConnect: React.FC<WalletConnectProps> = () => {
    const {
        isConnected,
        isLoading,
        eoaAddress,
        aaAddress,
        error,
        connectWallet,
        disconnectWallet
    } = useWallet();

    return (
        <div className="wallet-container">
            {/* <h2>Account Abstraction Wallet</h2> */}

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            <div className="connect-section">
                {!isConnected ? (
                    <button
                        onClick={connectWallet}
                        disabled={isLoading}
                        className="connect-button"
                    >
                        {isLoading ? "Connecting..." : "Connect Wallet"}
                    </button>
                ) : (
                    <button
                        onClick={disconnectWallet}
                        className="disconnect-button"
                    >
                        Disconnect
                    </button>
                )}
            </div>

            {/* {isConnected && (
        <div className="wallet-info">
          <div className="address-item">
            <strong>EOA Address:</strong> 
            <span className="address">{eoaAddress}</span>
          </div>
          <div className="address-item">
            <strong>AA Wallet Address:</strong> 
            <span className="address">{aaAddress}</span>
          </div>
          <p className="note">
            This AA wallet is counterfactual and will be deployed on your first transaction.
          </p>
        </div>
      )} */}
        </div>
    );
};

export default WalletConnect; 