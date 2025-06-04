'use client'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { FiBriefcase, FiUser, FiHome, FiPlusCircle, FiSearch, FiLogOut } from 'react-icons/fi'
import { useWallet } from '../contexts/WalletContext'
import { getFreelancerByAddress, getEmployerByAddress } from '@/utils/aaUtils'
import { ethers } from 'ethers'

const Navbar = () => {
  const pathname = usePathname()
  const router = useRouter()
  const { signer, aaAddress, disconnectWallet } = useWallet()
  const [role, setRole] = useState<'freelancer' | 'employer' | null>(null)
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Check user role from blockchain
  useEffect(() => {
    const checkRole = async () => {
      if (!signer || !aaAddress) {
        setRole(null)
        setLoading(false)
        return
      }

      try {
        // Check if freelancer
        const freelancer = await getFreelancerByAddress(signer, aaAddress)
        if (freelancer?.registered) {
          setRole('freelancer')
          localStorage.setItem('user_role', 'freelancer')
          return
        }

        // Check if employer
        const employer = await getEmployerByAddress(signer, aaAddress)
        if (employer?.registered) {
          setRole('employer')
          localStorage.setItem('user_role', 'employer')
          return
        }

        // No registered role found
        setRole(null)
      } catch (error) {
        console.error('Error checking user role:', error)
        setRole(null)
      } finally {
        setLoading(false)
      }
    }

    checkRole()
  }, [signer, aaAddress, pathname])

  // Don't show Navbar on these pages
  if (pathname === '/' || pathname === '/register') return null

  const handleDisconnect = () => {
    disconnectWallet()
    localStorage.removeItem('user_role')
    router.push('/')
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <motion.div
                whileHover={{ rotate: 10 }}
                className="bg-indigo-600 p-2 rounded-lg mr-2"
              >
                <FiBriefcase className="text-white text-xl" />
              </motion.div>
              <span className="text-xl font-bold text-gray-900">Neroworks</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <AnimatePresence>
              {role === 'freelancer' && (
                <>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <Link href="/freelancer-dashboard" className={`flex items-center gap-2 ${pathname === '/freelancer-dashboard' ? 'text-indigo-600 font-medium' : 'text-gray-700 hover:text-indigo-500'}`}>
                      <FiUser />
                      Dashboard
                    </Link>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: 0.1 }}
                  >
                    <Link href="/browse-jobs" className={`flex items-center gap-2 ${pathname === '/browse-jobs' ? 'text-indigo-600 font-medium' : 'text-gray-700 hover:text-indigo-500'}`}>
                      <FiSearch />
                      Browse Jobs
                    </Link>
                  </motion.div>
                </>
              )}

              {role === 'employer' && (
                <>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <Link href="/employer-dashboard" className={`flex items-center gap-2 ${pathname === '/employer-dashboard' ? 'text-indigo-600 font-medium' : 'text-gray-700 hover:text-indigo-500'}`}>
                      <FiBriefcase />
                      Dashboard
                    </Link>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: 0.1 }}
                  >
                    {/* <Link href="/post-job" className={`flex items-center gap-2 ${pathname === '/post-job' ? 'text-indigo-600 font-medium' : 'text-gray-700 hover:text-indigo-500'}`}>
                      <FiPlusCircle />
                      Post Job
                    </Link> */}
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            {/* Disconnect Button */}
            {aaAddress && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDisconnect}
                className="flex items-center gap-2 text-gray-700 hover:text-red-500"
              >
                <FiLogOut />
                <span className="hidden md:inline">Disconnect</span>
              </motion.button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-indigo-500 focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {role === 'freelancer' && (
                <>
                  <Link
                    href="/freelancer-dashboard"
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium ${pathname === '/freelancer-dashboard' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700 hover:bg-gray-100'}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FiUser />
                    Dashboard
                  </Link>
                  <Link
                    href="/browse-jobs"
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium ${pathname === '/browse-jobs' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700 hover:bg-gray-100'}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FiSearch />
                    Browse Jobs
                  </Link>
                </>
              )}

              {role === 'employer' && (
                <>
                  <Link
                    href="/employer-dashboard"
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium ${pathname === '/employer-dashboard' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700 hover:bg-gray-100'}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FiBriefcase />
                    Dashboard
                  </Link>
                  <Link
                    href="/post-job"
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium ${pathname === '/post-job' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700 hover:bg-gray-100'}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FiPlusCircle />
                    Post Job
                  </Link>
                </>
              )}

              {aaAddress && (
                <button
                  onClick={() => {
                    handleDisconnect()
                    setMobileMenuOpen(false)
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
                >
                  <FiLogOut />
                  Disconnect
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

export default Navbar