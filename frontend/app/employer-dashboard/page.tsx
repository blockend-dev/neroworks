'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ethers } from 'ethers'
import { FiDollarSign, FiBriefcase, FiGlobe, FiCalendar, FiTrendingUp, FiUsers, FiSettings, FiPlus, FiCheck, FiSend } from 'react-icons/fi'
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { toast } from 'react-toastify'
import {
  getAllJobs,
  createJob,
  hireFreelancer,
  depositFunds,
  releaseEscrow,
  completeJob,
  getEmployerEscrow,
  getEmployerByAddress,
  editEmployer
} from '@/utils/aaUtils'
import { useWallet } from '../contexts/WalletContext'
import Image from 'next/image'
import EditEmployerModal from '@/app/components/EditEmployerModal';

type EscrowBalances = {
  [jobId: number]: ethers.BigNumber;
};

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

interface Employer {
  employerAddress: number;
  name: string;
  industry: string;
  balance: ethers.BigNumber;
  country: string;
  image: string;
  registered: boolean;
  registration_date: any;
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  change?: string;
}

const EmployerDashboard = () => {
  const {
    aaAddress,
    signer,
  } = useWallet();


  const [jobs, setJobs] = useState<Job[]>([]);
  const [escrowBalances, setEscrowBalances] = useState<EscrowBalances>({});
  const [employer, setEmployer] = useState<Employer>()
  const [showEditModal, setShowEditModal] = useState(false);

  const [isLoading, setIsLoading] = useState(false)
  const [newJobForm, setNewJobForm] = useState({
    title: '',
    description: '',
    budget: ''
  })

  // Filter jobs by current employer and completion status
  const activeJobs = jobs.filter(job =>
    job.employer.toLowerCase() === aaAddress.toLowerCase() && !job.completed
  );

  const completedJobs = jobs.filter(job =>
    job.employer.toLowerCase() === aaAddress.toLowerCase() && job.completed
  );
  // Fetch all employer data
  useEffect(() => {
    const fetchEmployerData = async () => {
      if (!signer || !aaAddress) return

      setIsLoading(true)
      try {
        const employerData = await getEmployerByAddress(signer, aaAddress)
        setEmployer(employerData)
        const jobsData = await getAllJobs(signer)
        // Filter jobs by employer address
        const employerJobs = jobsData.filter((job: any) =>
          job.employer.toLowerCase() === aaAddress.toLowerCase()
        );
        setJobs(employerJobs)

        // Fetch escrow for each job
        const balances: EscrowBalances = {};
        for (const job of jobsData) {
          balances[job.id] = await getEmployerEscrow(signer, aaAddress, job.id);
        }
        console.log(balances)
        setEscrowBalances(balances);
      } catch (error: any) {
        toast.error(`Error loading data: ${error.message}`)
      } finally {
        setIsLoading(false)
      }
    }

    fetchEmployerData()
  }, [signer, aaAddress])

  useEffect(() => {
    async function refreshData() {
      if (!signer) return
      const employerData = await getEmployerByAddress(signer, aaAddress)
      setEmployer(employerData)
      const jobs = await getAllJobs(signer)
      const employerJobs = jobs.filter((job: any) =>
        job.employer.toLowerCase() === aaAddress.toLowerCase());
      setJobs(employerJobs)
    }

    refreshData()

  }, [signer, jobs]);

  const handleSaveProfile = async (updatedData) => {
    if (!signer) return
    try {
      await editEmployer(
        signer,
        updatedData.name,
        updatedData.industry,
        updatedData.country,
        updatedData.imageURI
      );

      // Update local state
      setEmployer(prev => ({
        ...prev,
        ...updatedData
      }));

      toast.success('Profile updated!')

      setShowEditModal(false);
    } catch (error) {
      toast.error('Error updating profile')
      console.error("Error updating profile:", error);
    }
  };

  // Handle job creation
  const handleCreateJob = async () => {
    if (!newJobForm.title || !newJobForm.description || !newJobForm.budget) {
      toast.error('Please fill all fields')
      return
    }

    try {
      setIsLoading(true)
      const tx = await createJob(
        signer,
        newJobForm.title,
        newJobForm.description,
        ethers.utils.parseEther(newJobForm.budget.toString())
      )
      tx.transactionHash
      toast.success('Job created successfully!')

      setNewJobForm({ title: '', description: '', budget: '' })

    } catch (error: any) {
      toast.error(`Job creation failed: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle freelancer hiring
  const handleHireFreelancer = async (jobId: any, freelancerAddress: any) => {
    try {
      setIsLoading(true)
      await hireFreelancer(signer, jobId, freelancerAddress)
      toast.success('Freelancer hired successfully!')

      // Refresh jobs list
      const updatedJobs = await getAllJobs(signer)
      setJobs(updatedJobs)
    } catch (error: any) {
      toast.error(`Hiring failed: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle fund deposit
  const handleDepositFunds = async (jobId: any, value: any) => {
    try {
      setIsLoading(true)
      await depositFunds(signer, jobId, ethers.utils.parseEther(value))
      toast.success('Funds deposited to escrow!')

      // Refresh escrow balance
      const updatedBalance = await getEmployerEscrow(signer, aaAddress, jobId)
      setEscrowBalances(prev => ({
        ...prev,
        [jobId]: updatedBalance
      }))
    } catch (error: any) {
      toast.error(`Deposit failed: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle escrow release
  const handleReleaseEscrow = async (jobId: any, freelancerAddress: any) => {
    try {
      setIsLoading(true)
      await releaseEscrow(signer, jobId, freelancerAddress)
      toast.success('Payment released to freelancer!')

      // Refresh data
      const [updatedJobs, updatedEscrow] = await Promise.all([
        getAllJobs(signer),
        getEmployerEscrow(signer, aaAddress, jobId)
      ])
      setJobs(updatedJobs)
      setEscrowBalances(prev => ({
        ...prev,
        [jobId]: updatedEscrow
      }))
    } catch (error: any) {
      toast.error(`Payment release failed: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle job completion
  const handleCompleteJob = async (jobId: number, freelancerAddress: string) => {
    try {
      setIsLoading(true)
      await completeJob(signer, jobId, freelancerAddress)
      toast.success('Job marked as completed!')

      // Refresh jobs list
      const updatedJobs = await getAllJobs(signer)
      setJobs(updatedJobs)
    } catch (error: any) {
      toast.error(`Completion failed: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Stats data
  const hiringData = [
    { month: 'Jan', hires: 2 },
    { month: 'Feb', hires: 3 },
    { month: 'Mar', hires: 5 },
    { month: 'Apr', hires: 4 },
    { month: 'May', hires: 6 },
    { month: 'Jun', hires: 8 }
  ]

  // Render active jobs section
  const renderActiveJobs = () => (
    <div className="space-y-4">
      {activeJobs.length > 0 ? (
        activeJobs.map((job) => (
          <motion.div
            key={job.id}
            whileHover={{ y: -2 }}
            className="border border-gray-100 p-4 rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-medium text-lg">{job.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{job.description}</p>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <p className="text-sm font-medium">
                    Budget: <span className="text-blue-600">Ξ {ethers.utils.formatEther(job.budget)}</span>
                  </p>
                  <p className="text-sm font-medium">
                    Escrow: <span className="text-green-600">
                      USDC {escrowBalances[job.id] ? ethers.utils.formatEther(escrowBalances[job.id]) : '0'}
                    </span>
                  </p>
                </div>
                <p className="text-sm mt-1">
                  Applicants: <span className="font-medium">{job.applicants.length}</span>
                </p>
              </div>
              <div className="flex flex-col gap-2">
                {job.hiredFreelancer === ethers.constants.AddressZero ? (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm"
                      onClick={() => {
                        if (job.applicants.length > 0) {
                          handleHireFreelancer(job.id, job.applicants[0])
                        }
                      }}
                    >
                      {job.applicants.length > 0 ? 'Hire Applicant' : 'No Applicants'}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-sm"
                      onClick={() => {
                        const value = prompt('Enter amount to deposit (ETH):', ethers.utils.formatEther(job.budget))
                        if (value) handleDepositFunds(job.id, value)
                      }}
                    >
                      Add Funds
                    </motion.button>
                  </>
                ) : (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-sm"
                      onClick={() => handleReleaseEscrow(job.id, job.hiredFreelancer)}
                    >
                      <FiSend size={14} className="inline mr-1" /> Release Payment
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-sm"
                      onClick={() => handleCompleteJob(job.id, job.hiredFreelancer)}
                    >
                      <FiCheck size={14} className="inline mr-1" /> Mark Complete
                    </motion.button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        ))
      ) : (
        <p className="text-gray-500 text-center py-4">No active jobs found</p>
      )}
    </div>
  );




  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 py-8"
      >
        {/* Profile Header */}
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8 p-6 bg-white rounded-xl shadow-sm"
        >
          <motion.div whileHover={{ scale: 1.05 }} className="relative">
            <Image
              src={employer?.image || '/default-company.png'}
              width={120}
              height={120}
              className="rounded-xl object-cover border-4 border-white shadow-md"
              alt="Company Logo"
            />
            <div className="absolute bottom-0 right-0 bg-green-500 rounded-full w-6 h-6 border-2 border-white"></div>
          </motion.div>

          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-800">
              {employer?.name}
              <span className="ml-2 text-sm px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                Verified Employer
              </span>
            </h1>
            <div className="flex flex-wrap items-center gap-3 mt-3">
              <div className="flex items-center gap-1 text-gray-600">
                <FiGlobe size={16} />
                <span>{employer?.country}</span>
              </div>
              <div className="flex items-center gap-1 text-gray-600">
                <FiBriefcase size={16} />
                <span>{employer?.industry}</span>
              </div>
              <div className="flex items-center gap-1 text-gray-600">
                <FiCalendar size={16} />
                <span>Member since {new Date(employer?.registration_date * 1000).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowEditModal(true)}
            className="px-6 py-2 bg-blue-600 text-white rounded-full shadow-md hover:bg-blue-700 transition-colors"
          >
            Edit Profile
          </button>


          {showEditModal && (
            <EditEmployerModal
              employer={employer}
              onClose={() => setShowEditModal(false)}
              onSave={handleSaveProfile}
            // darkMode={darkMode}
            />
          )}
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <StatCard
            icon={<FiDollarSign className="text-blue-500" size={24} />}
            label="Company Balance"
            value={`$ ${ethers.utils.formatEther(employer?.balance || '0')}`}
          />
          <StatCard
            icon={<FiUsers className="text-green-500" size={24} />}
            label="Total Hires"
            value={0}
          />
          <StatCard
            icon={<FiBriefcase className="text-yellow-500" size={24} />}
            label="Active Jobs"
            value={0}
          />
          {/* <StatCard
            icon={<FiDollarSign className="text-purple-500" size={24} />}
            label="Escrow Balance"
            value={`$ ${escrowBalances.toString()}`}
          /> */}
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Create Job Form */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Create New Job</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                  <input
                    type="text"
                    value={newJobForm.title}
                    onChange={(e) => setNewJobForm({ ...newJobForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="e.g. Senior Web Developer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={newJobForm.description}
                    onChange={(e) => setNewJobForm({ ...newJobForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Budget (ETH)</label>
                  <input
                    type="number"
                    value={newJobForm.budget}
                    onChange={(e) => setNewJobForm({ ...newJobForm, budget: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="0.1"
                    step="0.01"
                    min="0"
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCreateJob}
                  disabled={isLoading}
                  className="flex items-center justify-center gap-2 w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {isLoading ? 'Creating...' : (
                    <>
                      <FiPlus /> Create Job
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>

            {/* Active Jobs */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Active Jobs ({activeJobs.length})</h2>
              {renderActiveJobs()}
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Hiring Trends */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Hiring Trends</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={hiringData}>
                    <defs>
                      <linearGradient id="colorHires" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="hires"
                      stroke="#3B82F6"
                      fill="url(#colorHires)"
                      animationDuration={2000}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Completed Jobs */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Completed Jobs</h2>
              <div className="space-y-3">
                {completedJobs.length > 0 ? (
                  completedJobs.slice(0, 3).map(job => (
                    <div key={job.id} className="border-b border-gray-100 pb-3">
                      <h4 className="font-medium">{job.title}</h4>
                      <p className="text-sm text-gray-500">
                        Paid: Ξ {ethers.utils.formatEther(job.budget)}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-2">No completed jobs yet</p>
                )}
                {completedJobs.length > 3 && (
                  <button className="text-blue-600 text-sm font-medium mt-2">
                    View all completed jobs ({completedJobs.length})
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

const StatCard = ({ icon, label, value, change }: StatCardProps) => {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white p-5 rounded-xl shadow-sm border border-gray-100"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 bg-opacity-20 bg-blue-100 rounded-lg">
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

export default EmployerDashboard