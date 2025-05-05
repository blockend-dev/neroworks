'use client';

import { useEffect, useState } from 'react';
import { getFreelancerByAddress } from '@/utils/aaUtils';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { toast } from 'react-toastify';
import { ethers } from 'ethers';
import { getSigner, getSupportedTokens, initAAClient, initAABuilder } from '@/utils/aaUtils';
import WalletConnect from '../components/WalletConnect';



export default function FreelancerDashboard() {
    const [freelancer, setFreelancer] = useState<any>(null);
    // State to track wallet connection
    const [signer, setSigner] = useState<any | undefined>(undefined);
    const [eoaAddress, setEoaAddress] = useState<string>('');
    const [aaAddress, setAaAddress] = useState<string>('');
    const [supportedTokens, setSupportedTokens] = useState<Array<any>>([]);
    const [isFetchingTokens, setIsFetchingTokens] = useState(false);

    useEffect(() => {
        if (!signer || !aaAddress) return;
        (async () => {
            try {
                const data = await getFreelancerByAddress(signer, aaAddress);
                console.log(data)
                setFreelancer(data.props ?? data);
            } catch (err) {
                console.error(err);
            }
        })();
    }, [signer]);
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


    // if (!freelancer) return <div className="p-6 text-center">Loading your dashboard...</div>;

    return (
        <>
            <WalletConnect onWalletConnected={handleWalletConnected} />
            {freelancer?.registered && (
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="p-6 max-w-5xl mx-auto space-y-8"
                >
                    {/* Welcome Section */}
                    <div className="flex items-center gap-6">
                        <Image
                            src={freelancer.images?.[0] ?? '/default-avatar.png'}
                            alt="Profile"
                            width={80}
                            height={80}
                            className="rounded-full object-cover border-2 border-indigo-500"
                        />
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-800">
                                Welcome back, {freelancer.name}
                            </h2>
                            <p className="text-gray-500">{freelancer.gigTitle}</p>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <StatCard label="Balance" value={`Ξ ${ethers.utils.formatEther(freelancer.balance || '0')}`} />
                        <StatCard label="Jobs Completed" value={freelancer.jobsCompleted.toString()} />
                        <StatCard label="Starting Price" value={`Ξ ${ethers.utils.formatEther(freelancer.starting_price || '0')}`} />
                    </div>

                    {/* TODO: Tabs or Routes */}
                    <div className="pt-6">
                        {/* Placeholder for job list, withdraw button etc. */}
                        <p className="text-gray-600">More sections coming soon...</p>
                    </div>
                </motion.div>
            )}
            {!freelancer &&(
                <div className="p-6 text-center">Loading your dashboard...</div>
            )}

        </>

    );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
    return (
        <div className="bg-white p-4 rounded-2xl shadow text-center border">
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-xl font-semibold text-indigo-600">{value}</p>
        </div>
    );
}
