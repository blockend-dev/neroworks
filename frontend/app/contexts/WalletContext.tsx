'use client'
import { createContext, useContext, useState, useEffect } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { ethers } from 'ethers';
import { getSigner, getAAWalletAddress } from '../../utils/aaUtils';

type WalletMode = 'privy-aa' | 'traditional' | null;

interface WalletContextType {
    mode: WalletMode;
    eoaAddress: string;
    aaAddress: string;
    signer: ethers.providers.JsonRpcSigner;
    isConnected: boolean;
    isLoading: boolean;
    error: string | null;
    connectTraditional: () => Promise<void>;
    connectSocial: () => Promise<void>;
    disconnect: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider = ({ children }: { children: React.ReactNode }) => {
    const [mode, setMode] = useState<WalletMode>(null);
    const [eoaAddress, setEoaAddress] = useState('');
    const [aaAddress, setAaAddress] = useState('');
    const [signer, setSigner] = useState<any>();
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    // Privy hooks
    const { login, authenticated, user } = usePrivy();
    const { wallets: privyWallets } = useWallets();

    // Connect traditional wallet (MetaMask)
    const connectTraditional = async () => {
        setIsLoading(true);
        setError(null);

        const signer = await getSigner();
        const address = await signer.getAddress();
        const aaWalletAddress = await getAAWalletAddress(signer);

        setSigner(signer);
        setEoaAddress(address);
        setAaAddress(aaWalletAddress);
        setMode('traditional');
        setIsConnected(true);
    };

    // Connect via Privy social login
    const connectSocial = async () => {
        await login();
    };

    // Handle Privy connection
    useEffect(() => {
        if (authenticated && privyWallets[0]) {
            const setupPrivyWallet = async () => {
                const privyWallet = privyWallets[0];
                console.log(privyWallet,'pv')
                const provider = new ethers.providers.Web3Provider(await privyWallet.getEthereumProvider());
                const signer = provider.getSigner()

                setSigner(signer);
                setEoaAddress(privyWallet.address);
                setAaAddress(privyWallet.address);
                setMode('privy-aa');
            };
            setupPrivyWallet();
        }
    }, [authenticated, privyWallets]);

    const disconnect = () => {
        setMode(null);
        setEoaAddress('');
        setAaAddress('');
        // setSigner('');
        setIsConnected(false);
    };

    return (
        <WalletContext.Provider
            value={{
                mode,
                eoaAddress,
                aaAddress,
                signer,
                connectTraditional,
                connectSocial,
                disconnect,
                isConnected,
                isLoading,
                error
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