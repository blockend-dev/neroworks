"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { getSigner, getAAWalletAddress } from '../../utils/aaUtils';
import { toast } from 'react-toastify';

interface WalletContextType {
    isConnected: boolean;
    isLoading: boolean;
    eoaAddress: string;
    aaAddress: string;
    signer : any;
    error: string | null;
    connectWallet: () => Promise<void>;
    disconnectWallet: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [eoaAddress, setEoaAddress] = useState('');
    const [aaAddress, setAaAddress] = useState('');
    const [signer ,setSigner] = useState<any>('')
    const [error, setError] = useState<string | null>(null);

    const connectWallet = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const signer = await getSigner();
            if (!signer) throw new Error("Failed to get signer");
            setSigner(signer)
            const address = await signer.getAddress();
            const aaWalletAddress = await getAAWalletAddress(signer);

            setEoaAddress(address);
            setAaAddress(aaWalletAddress);
            setIsConnected(true);
            toast.success('Wallet connected successfully!');


        } catch (error: any) {
            console.error("Error connecting wallet:", error);
            setError(error.message || "Failed to connect wallet");
        } finally {
            setIsLoading(false);
        }
    };

    const disconnectWallet = () => {
        setIsConnected(false);
        setEoaAddress('');
        setAaAddress('');
    };

    // Check initial connection & listen for changes
    useEffect(() => {
        const checkWalletConnection = async () => {
            if (window.ethereum) {
                const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                if (accounts.length > 0) await connectWallet();
            }
        };

        checkWalletConnection();

        const handleAccountsChanged = (accounts: string[]) => {
            if (accounts.length === 0) disconnectWallet();
            else connectWallet();
        };

        window.ethereum?.on('accountsChanged', handleAccountsChanged);
        return () => {
            window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
        };
    }, []);

    return (
        <WalletContext.Provider
            value={{
                isConnected,
                isLoading,
                eoaAddress,
                aaAddress,
                error,
                signer,
                connectWallet,
                disconnectWallet,
            }}
        >
            {children}
        </WalletContext.Provider>
    );
};

export const useWallet = () => {
    const context = useContext(WalletContext);
    if (!context) throw new Error("useWallet must be used within WalletProvider");
    return context;
};