'use client';

import { useEffect, useState } from 'react';
import { getFreelancerByAddress } from '@/utils/aaUtils';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { toast } from 'react-toastify';
import { ethers } from 'ethers';
import { getSigner, getSupportedTokens, initAAClient, initAABuilder } from '@/utils/aaUtils';
import WalletConnect from '../components/WalletConnect';
import { useWallet } from '../contexts/WalletContext';
import { FiDollarSign, FiCheckCircle, FiClock, FiTrendingUp, FiSettings, FiUser, FiBriefcase } from 'react-icons/fi'


export default function FreelancerDashboard() {
    const {
        aaAddress,
        signer,
    } = useWallet();

    const [freelancer, setFreelancer] = useState<any>(null);
    // State to track wallet connection
    const [eoaAddress, setEoaAddress] = useState<string>('');
    const [supportedTokens, setSupportedTokens] = useState<Array<any>>([]);
    const [isFetchingTokens, setIsFetchingTokens] = useState(false);

    useEffect(() => {
        console.log(signer, aaAddress)
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
    }, [signer, aaAddress]);
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


    // if (!freelancer) return <div className="p-6 text-center">Loading your dashboard...</div>;

    return (
    <>
      {freelancer?.registered ? (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white py-8 px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-6xl mx-auto"
          >
            {/* Header Section */}
            <motion.div
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8"
            >
              <div className="flex items-center gap-4">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="relative"
                >
                  <Image
                    src={freelancer.images?.[0] ?? '/default-avatar.png'}
                    alt="Profile"
                    width={96}
                    height={96}
                    className="rounded-full object-cover border-4 border-white shadow-lg"
                  />
                  <div className="absolute bottom-0 right-0 bg-green-500 rounded-full w-6 h-6 border-2 border-white"></div>
                </motion.div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">
                    Welcome, <span className="text-indigo-600">{freelancer.name}</span>
                  </h1>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs font-medium rounded-full">
                      {freelancer.country}
                    </span>
                    <span className="text-gray-500">{freelancer.gigTitle}</span>
                  </div>
                </div>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-2 bg-indigo-600 text-white rounded-full shadow-md hover:bg-indigo-700 transition-colors"
              >
                Edit Profile
              </motion.button>
            </motion.div>

            {/* Stats Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            >
              <StatCard 
                icon={<FiDollarSign className="text-indigo-500" size={24} />}
                label="Available Balance" 
                value={`Ξ ${ethers.utils.formatEther(freelancer.balance || '0')}`}
                change="+2.4%"
              />
              <StatCard 
                icon={<FiCheckCircle className="text-green-500" size={24} />}
                label="Jobs Completed" 
                value={freelancer.jobsCompleted.toString()}
                change="+12 this month"
              />
              <StatCard 
                icon={<FiClock className="text-yellow-500" size={24} />}
                label="Active Projects" 
                value="3"
                change="2 in progress"
              />
              <StatCard 
                icon={<FiTrendingUp className="text-blue-500" size={24} />}
                label="Starting Price" 
                value={`Ξ ${ethers.utils.formatEther(freelancer.starting_price || '0')}`}
                change="+5% from last month"
              />
            </motion.div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column */}
              <div className="lg:col-span-2 space-y-6">
                {/* Skills & Services */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="bg-white rounded-xl shadow-sm p-6"
                >
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Skills & Services</h2>
                  <div className="flex flex-wrap gap-2">
                    {freelancer.skills.split(',').map((skill, index) => (
                      <motion.span
                        key={index}
                        whileHover={{ scale: 1.05 }}
                        className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm"
                      >
                        {skill.trim()}
                      </motion.span>
                    ))}
                  </div>
                  <p className="mt-4 text-gray-600">{freelancer.gitDescription}</p>
                </motion.div>

                {/* Recent Projects */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="bg-white rounded-xl shadow-sm p-6"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">Recent Projects</h2>
                    <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                      View All
                    </button>
                  </div>
                  <div className="space-y-4">
                    {[1, 2, 3].map((item) => (
                      <motion.div
                        key={item}
                        whileHover={{ y: -2 }}
                        className="border-b border-gray-100 pb-4 last:border-0 last:pb-0"
                      >
                        <div className="flex justify-between">
                          <div>
                            <h3 className="font-medium">Website Redesign #{item}</h3>
                            <p className="text-sm text-gray-500">Client: Acme Inc.</p>
                          </div>
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            Completed
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Quick Actions */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="bg-white rounded-xl shadow-sm p-6"
                >
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
                  <div className="space-y-3">
                    <motion.button
                      whileHover={{ x: 5 }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left bg-indigo-50 text-indigo-700 rounded-lg"
                    >
                      <FiBriefcase className="flex-shrink-0" />
                      <span>Create New Gig</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ x: 5 }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left bg-indigo-50 text-indigo-700 rounded-lg"
                    >
                      <FiDollarSign className="flex-shrink-0" />
                      <span>Withdraw Funds</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ x: 5 }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left bg-indigo-50 text-indigo-700 rounded-lg"
                    >
                      <FiSettings className="flex-shrink-0" />
                      <span>Account Settings</span>
                    </motion.button>
                  </div>
                </motion.div>

                {/* Portfolio Preview */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="bg-white rounded-xl shadow-sm p-6"
                >
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Portfolio Preview</h2>
                  {freelancer.images?.[1] ? (
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="relative aspect-video rounded-lg overflow-hidden"
                    >
                      <Image
                        src={freelancer.images[1]}
                        alt="Gig Image"
                        fill
                        className="object-cover"
                      />
                    </motion.div>
                  ) : (
                    <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                      <p className="text-gray-400">No portfolio image added</p>
                    </div>
                  )}
                  <button className="mt-4 w-full py-2 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors">
                    Upload New Work
                  </button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      ) : (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center p-8 max-w-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Freelancer Profile Not Found</h2>
            <p className="text-gray-600 mb-6">You haven't registered as a freelancer yet.</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition-colors"
            >
              Register as Freelancer
            </motion.button>
          </div>
        </div>
      )}
    </>
  )
}

const StatCard = ({ icon, label, value, change }:any) => {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white p-5 rounded-xl shadow-sm border border-gray-100"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 bg-opacity-20 bg-indigo-100 rounded-lg">
          {icon}
        </div>
        <h3 className="text-sm font-medium text-gray-500">{label}</h3>
      </div>
      <div className="flex items-end justify-between">
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        {change && (
          <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
            {change}
          </span>
        )}
      </div>
    </motion.div>
  )
}
