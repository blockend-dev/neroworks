'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { FiSearch, FiBriefcase, FiDollarSign, FiClock, FiMapPin, FiFilter, FiArrowRight, FiUser } from 'react-icons/fi'
import { useWallet } from '../contexts/WalletContext'
import { getAllJobs, applyForJob } from '@/utils/aaUtils'
import { toast } from 'react-toastify'
import Link from 'next/link'

interface Job {
  id: number
  employer: string
  title: string
  description: string
  budget: ethers.BigNumber
  completed: boolean
  applicants: string[]
  hiredFreelancer: string
}

const BrowseJobs = () => {
  const { signer, aaAddress } = useWallet()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    minBudget: '',
    maxBudget: '',
    remoteOnly: false
  })
  const [applyingJobId, setApplyingJobId] = useState<number | null>(null)

  // Fetch all jobs
  useEffect(() => {
    const fetchJobs = async () => {
      if (!signer) return
      
      try {
        const allJobs = await getAllJobs(signer)
        setJobs(allJobs)
      } catch (error) {
        toast.error('Failed to load jobs')
        console.error('Error fetching jobs:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchJobs()
  }, [signer])

  // Handle job application
  const handleApply = async (jobId: number) => {
    if (!signer || !aaAddress) {
      toast.error('Please connect your wallet first')
      return
    }

    setApplyingJobId(jobId)
    try {
      await applyForJob(signer, jobId)
      toast.success('Application submitted successfully!')
      
      // Update local state to reflect application
      setJobs(prev => prev.map(job => 
        job.id === jobId 
          ? { ...job, applicants: [...job.applicants, aaAddress] }
          : job
      ))
    } catch (error) {
      toast.error(`Application failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setApplyingJobId(null)
    }
  }

  // Filter jobs based on search and filters
  const filteredJobs = jobs.filter(job => {
    // Skip completed jobs
    if (job.completed) return false
    
    // Search term filter
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         job.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    // Budget filters
    const jobBudget = parseFloat(ethers.utils.formatEther(job.budget))
    const matchesMinBudget = !filters.minBudget || jobBudget >= parseFloat(filters.minBudget)
    const matchesMaxBudget = !filters.maxBudget || jobBudget <= parseFloat(filters.maxBudget)
    
    return matchesSearch && matchesMinBudget && matchesMaxBudget
  })

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto text-center">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold mb-6"
          >
            Find Your Next <span className="text-yellow-300">Opportunity</span>
          </motion.h1>
          <p className="text-xl text-indigo-100 max-w-3xl mx-auto">
            Browse through hundreds of Web3 jobs and find the perfect match for your skills
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6">
        {/* Search and Filter Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-100"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Search jobs by title or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition">
              <FiFilter />
              <span>Filters</span>
            </button>
          </div>

          {/* Expanded Filters (collapsed by default) */}
          <AnimatePresence>
            {false && ( 
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 overflow-hidden"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Min Budget (ETH)</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={filters.minBudget}
                      onChange={(e) => setFilters({...filters, minBudget: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Budget (ETH)</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={filters.maxBudget}
                      onChange={(e) => setFilters({...filters, maxBudget: e.target.value})}
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="remoteOnly"
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      checked={filters.remoteOnly}
                      onChange={(e) => setFilters({...filters, remoteOnly: e.target.checked})}
                    />
                    <label htmlFor="remoteOnly" className="ml-2 block text-sm text-gray-700">
                      Remote Only
                    </label>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Jobs Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
              >
                <div className="p-6 animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3 mb-6"></div>
                  <div className="h-10 bg-gray-200 rounded w-full"></div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : filteredJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map((job) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">{job.title}</h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-6 line-clamp-3">{job.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center gap-2 text-gray-700">
                      <FiDollarSign className="text-indigo-500" />
                      <span>{ethers.utils.formatEther(job.budget)} ETH</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <FiUser className="text-indigo-500" />
                      <span>{job.applicants.length} applicants</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => handleApply(job.id)}
                      disabled={applyingJobId === job.id || job.applicants.includes(aaAddress || '')}
                      className={`w-full py-2 px-4 rounded-lg font-medium transition
                        ${job.applicants.includes(aaAddress || '') 
                          ? 'bg-green-100 text-green-800 cursor-default'
                          : applyingJobId === job.id
                            ? 'bg-indigo-400 text-white cursor-wait'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                    >
                      {job.applicants.includes(aaAddress || '') 
                        ? 'Already Applied'
                        : applyingJobId === job.id
                          ? 'Applying...'
                          : 'Apply Now'}
                    </button>
                    <Link href={`/job/${job.id}`} passHref>
                      <button className="w-full flex items-center justify-center gap-2 py-2 px-4 text-indigo-600 hover:text-indigo-800 font-medium">
                        View Details <FiArrowRight />
                      </button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center"
          >
            <FiBriefcase className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
            <p className="text-gray-500">
              {searchTerm 
                ? 'Try adjusting your search or filters'
                : 'There are currently no available jobs matching your criteria'}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default BrowseJobs