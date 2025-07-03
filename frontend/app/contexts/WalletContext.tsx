'use client'
import { createContext, useContext, useState, useEffect } from 'react';
import { usePrivy, useWallets, useCreateWallet } from '@privy-io/react-auth';
import { ethers } from 'ethers';
import { getSigner, getAAWalletAddress } from '../../utils/aaUtils';
import { toast } from 'react-toastify';

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
    hydrated: boolean
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
    const [hydrated, setHydrated] = useState(false);
    // Privy hooks
    const { login, authenticated, user } = usePrivy();
    const { wallets: privyWallets } = useWallets();
    const { createWallet } = useCreateWallet();

    useEffect(() => {
        if (authenticated !== undefined) {
            setHydrated(true);
        }
    }, [authenticated]);

    // Handle Privy connection
    useEffect(() => {

        hydratePrivyWallet();
    }, [authenticated, privyWallets, hydrated]);

    const privyWalletConnect = privyWallets.find((w) => w.walletClientType === "privy");
    const hydratePrivyWallet = async () => {
        if (privyWalletConnect && !signer) {
            try {
                await connectSocial()
                const ethereumProvider = await privyWalletConnect.getEthereumProvider();
                const ethersProvider = new ethers.providers.Web3Provider(
                    ethereumProvider
                );
                setSigner(ethersProvider.getSigner());
                setAaAddress(privyWalletConnect.address);
                setMode('privy-aa');
                setIsConnected(true);
            } catch (err) {
                console.error('Error setting up Privy wallet:', err);
                setError('Failed to initialize wallet');
            } finally {
                setHydrated(true);
            }
        }

    };

    // Connect traditional wallet (MetaMask)
    const connectTraditional = async () => {
        setIsLoading(true);
        setError(null);

        const signer = await getSigner();
        const address = await signer.getAddress();
        const aaWalletAddress = await getAAWalletAddress(signer);
        // console.log(aaWalletAddress,'here')
        setSigner(signer);
        setEoaAddress(address);
        setAaAddress(aaWalletAddress);
        setMode('traditional');
        setIsConnected(true);
    };

    // Connect via Privy social login
    const connectSocial = async () => {
        try {
            if(authenticated && !signer){
                 await createWallet();
            }
            if (!authenticated) {
                login(); // prompts login
            }


        } catch (err) {
            console.error("Social login/wallet creation failed:", err);
            toast.error("Failed to sign in or create wallet.");
        }
    }

    useEffect(() => {
        console.log(user)
        console.log('hydrated?', hydrated);
        console.log('authenticated?', authenticated);
        console.log('privyWallets?', privyWallets);
    }, [hydrated, authenticated, privyWallets]);




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
                error,
                hydrated
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