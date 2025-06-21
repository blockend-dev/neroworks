'use client';

import { useEffect, useState, useMemo } from 'react';
import { getAllJobs, getFreelancerByAddress, editFreelancer } from '@/utils/aaUtils';
import { motion, useTransform, useMotionValue } from 'framer-motion'
import Image from 'next/image';
import { toast } from 'react-toastify';
import { ethers } from 'ethers';
import { getSigner, getSupportedTokens, initAAClient, initAABuilder } from '@/utils/aaUtils';
import { useWallet } from '../contexts/WalletContext';
import { FiDollarSign, FiCheckCircle, FiClock, FiTrendingUp, FiSettings, FiUser, FiBriefcase, FiAward, FiMoon, FiSun } from 'react-icons/fi'
import { AreaChart, Area, XAxis, ResponsiveContainer } from 'recharts'
import EditFreelancerModal from '@/app/components/EditFreelancerModal'

interface Job {
  id: number;
  employer: string;
  title: string;
  description: string;
  budget: ethers.BigNumber;
  completed: boolean;
  applicants: string[];
  hiredFreelancer: string;
}

export default function FreelancerDashboard() {
  const {
    aaAddress,
    signer,
    isLoading
  } = useWallet();

  const [freelancer, setFreelancer] = useState<any>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  // State to track wallet connection
  const [supportedTokens, setSupportedTokens] = useState<Array<any>>([]);
  const [isFetchingTokens, setIsFetchingTokens] = useState(false);
  const [darkMode, setDarkMode] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false);

  // Filter jobs by freelance and completion status
  const activeJobs = jobs.filter(job =>
    job.hiredFreelancer.toLowerCase() === aaAddress.toLowerCase() && !job.completed
  );

  useEffect(() => {

    if (!signer || !aaAddress) return;
    (async () => {
      try {
        setLoading(true)
        const data = await getFreelancerByAddress(signer, aaAddress.toString());
        console.log(data)
        setFreelancer(data.props ?? data);
        const allJobs = await getAllJobs(signer);
        setJobs(allJobs);
        setLoading(false)
      } catch (err) {
        setLoading(false)
        console.error(err);
      }
    })();
  }, [signer, aaAddress]);

  useEffect(() => {
    // if(!signer) return
    // console.log(aaAddress.toString())

    async function refreshData() {
      const freelancerData = await getFreelancerByAddress(signer, aaAddress.toString())
      setFreelancer(freelancerData)
      const allJobs = await getAllJobs(signer);
      setJobs(allJobs);
    }

    refreshData()

  }, [signer, jobs]);

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

  const handleSave = async (formData:any) => {
    if (!signer) return
    try {
      await editFreelancer(
        signer,
        formData.name,
        formData.skills,
        formData.country,
        formData.gigTitle,
        formData.gigDescription,
        formData.images,
        formData.starting_price
      );

      toast.success('Profile updated!')
      const freelancerData = await getFreelancerByAddress(signer, aaAddress)
      setFreelancer(freelancerData)
    } catch (error) {
      toast.error('Error updating profile!')
      console.error("Error updating profile:", error);
    }
  };


  // State management for the modal
  const handleEditProfile = () => {
    setShowEditModal(true);
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

  const backgroundBalls = useMemo(() => {
    return [...Array(10)].map(() => ({
      width: `${Math.random() * 200 + 100}px`,
      height: `${Math.random() * 200 + 100}px`,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      duration: 15 + Math.random() * 20
    }));
  }, []);


  const BackgroundElements = () => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
      setMounted(true);
    }, []);

    if (!mounted) {
      return null; // Avoid SSR mismatch
    }

    return (
      <div className="fixed inset-0 overflow-hidden z-0 pointer-events-none">
        {backgroundBalls.map((ball, i) => (
          <motion.div
            key={i}
            animate={{
              x: [0, 100, 0],
              y: [0, 50, 0],
              rotate: [0, 180, 360]
            }}
            transition={{
              duration: ball.duration,
              repeat: Infinity,
              ease: "linear"
            }}
            className={`absolute rounded-full ${darkMode ? 'bg-indigo-900' : 'bg-indigo-100'} opacity-20`}
            style={{
              width: ball.width,
              height: ball.height,
              left: ball.left,
              top: ball.top
            }}
          />
        ))}
      </div>
    );
  };

  // 3D Profile Card Component
  const ProfileCard3D = ({ image }: any) => {
    const x = useMotionValue(0)
    const y = useMotionValue(0)

    const rotateX = useTransform(y, [-100, 100], [10, -10])
    const rotateY = useTransform(x, [-100, 100], [-10, 10])

    return (
      <motion.div
        style={{ rotateX, rotateY }}
        whileHover={{ scale: 1.05 }}
        onPointerMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect()
          x.set(e.clientX - rect.left - rect.width / 2)
          y.set(e.clientY - rect.top - rect.height / 2)
        }}
        onPointerLeave={() => {
          x.set(0)
          y.set(0)
        }}
        className="relative w-24 h-24 md:w-32 md:h-32 rounded-2xl shadow-xl border-4 border-white"
      >
        <Image
          src={image || '/default-avatar.png'}
          fill
          className="object-cover rounded-xl"
          alt="3D Profile"
        />
      </motion.div>
    )
  }

  // Earnings Chart Data
  const earningsData = [
    { day: 'Mon', earnings: parseFloat(ethers.utils.formatEther(freelancer?.starting_price || '0')) * 0.5 },
    { day: 'Tue', earnings: parseFloat(ethers.utils.formatEther(freelancer?.starting_price || '0')) * 1.2 },
    { day: 'Wed', earnings: parseFloat(ethers.utils.formatEther(freelancer?.starting_price || '0')) * 0.8 },
    { day: 'Thu', earnings: parseFloat(ethers.utils.formatEther(freelancer?.starting_price || '0')) * 1.5 },
    { day: 'Fri', earnings: parseFloat(ethers.utils.formatEther(freelancer?.starting_price || '0')) * 2.3 },
    { day: 'Sat', earnings: parseFloat(ethers.utils.formatEther(freelancer?.starting_price || '0')) * 1.9 },
    { day: 'Sun', earnings: parseFloat(ethers.utils.formatEther(freelancer?.starting_price || '0')) * 0.7 }
  ]

  // Skills data parsed from the freelancer struct
  const skills = freelancer?.skills.split(',').map((skill: any, index: any) => ({
    name: skill.trim(),
    level: 70 + (index * 5) % 30 // Deterministic based on index
  }))

  // Badges data
  const badges = [
    { id: 1, name: 'Top Performer', color: 'bg-gradient-to-r from-yellow-400 to-yellow-600' },
    { id: 2, name: 'Fast Delivery', color: 'bg-gradient-to-r from-green-400 to-green-600' },
    { id: 3, name: 'Client Favorite', color: 'bg-gradient-to-r from-pink-500 to-rose-500' }
  ]


  // if (!freelancer) return <div className="p-6 text-center">Loading your dashboard...</div>;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gradient-to-br from-indigo-50 to-white text-gray-800'}`}>
      <BackgroundElements />
      {isLoading || loading ? (
        // Show loading indicator
        <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
          <div className="text-center">
            <motion.div
              animate={{
                rotate: 360,
                scale: [1, 1.2, 1]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "linear"
              }}
              className="mx-auto mb-6"
            >
              <FiBriefcase size={64} className={`${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
            </motion.div>
            <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading your profile...</p>
          </div>
        </div>
      ) : freelancer?.registered ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 py-8 relative z-10"
        >
          {/* Header with Dark Mode Toggle */}
          <div className="flex justify-between items-center mb-8">
            <motion.div
              initial={{ x: -20 }}
              animate={{ x: 0 }}
              className="flex items-center gap-2"
            >
              <FiBriefcase className="text-indigo-500" size={24} />
              <h1 className="text-2xl font-bold">FreelancerPro</h1>
            </motion.div>

            <motion.button
              onClick={() => setDarkMode(!darkMode)}
              className={`relative w-14 h-8 rounded-full p-1 flex items-center ${darkMode ? 'bg-indigo-700' : 'bg-gray-300'}`}
              animate={{
                justifyContent: darkMode ? 'flex-end' : 'flex-start'
              }}
              whileHover={{ scale: 1.05 }}
            >
              <motion.div
                layout
                className="w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center"
              >
                {darkMode ? <FiMoon size={12} /> : <FiSun size={12} className="text-yellow-500" />}
              </motion.div>
            </motion.button>
          </div>

          {/* Main Profile Section */}
          <motion.div
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className={`p-6 rounded-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg mb-8`}
          >
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <ProfileCard3D image={freelancer.images?.[0]} />

              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold">
                      {freelancer.name}
                      <span className="ml-2 text-sm px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full">
                        PRO
                      </span>
                    </h1>
                    <p className={`mt-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {freelancer.gigTitle} • {freelancer.country}
                    </p>
                  </div>

                  <button
                    // whileHover={{ scale: 1.03 }}
                    // whileTap={{ scale: 0.98 }}
                    onClick={handleEditProfile}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-full shadow-md hover:bg-indigo-700 transition-colors"
                  >
                    Edit Profile
                  </button>

                  {showEditModal && (
                    <EditFreelancerModal
                      freelancer={freelancer}
                      onClose={() => setShowEditModal(false)}
                      onSave={handleSave}
                      darkMode={darkMode}
                    />
                  )}
                </div>

                <p className={`mt-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {freelancer.gitDescription || "No description provided yet."}
                </p>

                <BadgeCarousel badges={badges} />
              </div>
            </div>
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
              value={`$ ${ethers.utils.formatEther(freelancer.balance || '0')}`}
              change="+2.4%"
              darkMode={darkMode}
            />
            <StatCard
              icon={<FiCheckCircle className="text-green-500" size={24} />}
              label="Jobs Completed"
              value={freelancer.jobsCompleted.toString()}
              change="+12 this month"
              darkMode={darkMode}
            />
            <StatCard
              icon={<FiClock className="text-yellow-500" size={24} />}
              label="Active Projects"
              value={activeJobs.length}
              change={`${activeJobs.length} in progress`}
              darkMode={darkMode}
            />
            <StatCard
              icon={<FiTrendingUp className="text-blue-500" size={24} />}
              label="Starting Price"
              value={`$ ${ethers.utils.formatEther(freelancer.starting_price || '0')}`}
              change="+5% from last month"
              darkMode={darkMode}
            />
          </motion.div>

          {/* Main Content Area */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Earnings Chart */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className={`p-6 rounded-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}
              >
                <h2 className="text-xl font-semibold mb-4">Weekly Earnings</h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={earningsData}>
                      <defs>
                        <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="day"
                        tick={{ fill: darkMode ? '#E5E7EB' : '#6B7280' }}
                      />
                      <Area
                        type="monotone"
                        dataKey="earnings"
                        stroke="#6366F1"
                        fill="url(#colorEarnings)"
                        animationDuration={2000}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* Skills Section */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className={`p-6 rounded-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}
              >
                <h2 className="text-xl font-semibold mb-4">Skills & Expertise</h2>
                <div className="space-y-4">
                  {skills.map((skill: any, index: any) => (
                    <AnimatedSkillBar
                      key={index}
                      skill={skill.name}
                      level={skill.level}
                      darkMode={darkMode}
                    />
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
                className={`p-6 rounded-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}
              >
                <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
                <div className="space-y-3">
                  <motion.button
                    whileHover={{ x: 5 }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-colors ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'}`}
                  >
                    <FiBriefcase className="flex-shrink-0" />
                    <span>Create New Gig</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ x: 5 }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-colors ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'}`}
                  >
                    <FiDollarSign className="flex-shrink-0" />
                    <span>Withdraw Funds</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ x: 5 }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-colors ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'}`}
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
                className={`p-6 rounded-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Portfolio Showcase</h2>
                  <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                    View All
                  </button>
                </div>

                {freelancer.images?.[1] ? (
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="relative aspect-video rounded-lg overflow-hidden mb-4"
                  >
                    <Image
                      src={freelancer.images[1]}
                      alt="Gig Image"
                      fill
                      className="object-cover"
                    />
                  </motion.div>
                ) : (
                  <div className={`aspect-video ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg flex items-center justify-center mb-4`}>
                    <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>No portfolio image added</p>
                  </div>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-2 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
                >
                  Upload New Work
                </motion.button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      ) : (
        <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
          <div className="text-center p-8 max-w-md">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="mb-6"
            >
              <FiBriefcase size={64} className="mx-auto text-indigo-500" />
            </motion.div>
            <h2 className="text-2xl font-bold mb-2">Freelancer Profile Not Found</h2>
            <p className={`mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>You haven't registered as a freelancer yet.</p>
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
    </div>
  )
}

// Component for animated skill bars
const AnimatedSkillBar = ({ skill, level, darkMode }: any) => (
  <div className="mb-3">
    <div className="flex justify-between mb-1">
      <span className="font-medium">{skill}</span>
      <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{level}%</span>
    </div>
    <div className={`h-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full overflow-hidden`}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${level}%` }}
        transition={{ duration: 1.5, delay: 0.5 }}
        className="h-full bg-indigo-500 rounded-full"
      />
    </div>
  </div>
)

// Component for badge carousel
const BadgeCarousel = ({ badges }: any) => (
  <div className="flex space-x-4 overflow-x-auto py-4 scrollbar-hide">
    {badges.map((badge: any) => (
      <motion.div
        key={badge.id}
        whileHover={{ y: -5, rotate: 2 }}
        className={`flex-shrink-0 ${badge.color} text-white px-4 py-2 rounded-full shadow-md flex items-center`}
      >
        <FiAward className="mr-2" />
        <span className="text-xs font-bold">{badge.name}</span>
      </motion.div>
    ))}
  </div>
)

// Stat card component
const StatCard = ({ icon, label, value, change, darkMode }: any) => {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className={`p-5 rounded-xl shadow-sm ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} border`}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-indigo-100'}`}>
          {icon}
        </div>
        <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{label}</h3>
      </div>
      <div className="flex items-end justify-between">
        <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{value}</p>
        {change && (
          <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
            {change}
          </span>
        )}
      </div>
    </motion.div>
  )
}
