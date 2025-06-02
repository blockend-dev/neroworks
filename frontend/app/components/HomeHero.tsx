'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { getEmployerByAddress, getFreelancerByAddress } from '@/utils/aaUtils'
import { ethers } from 'ethers'
import Link from 'next/link'
import { FiArrowRight, FiUser, FiBriefcase, FiAward } from 'react-icons/fi'

const HomeHero = ({ signer, aaAddress }: { signer: any, aaAddress: string }) => {
  const [userType, setUserType] = useState<'freelancer' | 'employer' | null>(null)
  const [loading, setLoading] = useState(true)
  const [showParticles, setShowParticles] = useState(false)

  useEffect(() => {
    const checkRole = async () => {
      try {
        if (!signer || !aaAddress) return

        const freelancer = await getFreelancerByAddress(signer, aaAddress)
        if (freelancer?.registered) {
          setUserType('freelancer')
        } else {
          const employer = await getEmployerByAddress(signer, aaAddress)
          if (employer?.registered) {
            setUserType('employer')
          }
        }
      } catch (err) {
        console.error('Error checking user role:', err)
      } finally {
        setLoading(false)
        setShowParticles(true)
      }
    }

    checkRole()
  }, [signer, aaAddress])

  const handleJoin = (role: 'freelancer' | 'employer') => {
    localStorage.setItem('user_role', role)
    window.location.href = '/register'
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-gradient-to-br from-indigo-50 to-white">
        <div className="animate-pulse text-2xl text-indigo-600">Loading...</div>
      </div>
    )
  }

  return (
    <section className="relative min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-600 text-white overflow-hidden">
      {/* Animated Background Elements */}
      {showParticles && (
        <>
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{
                opacity: [0, 0.3, 0],
                scale: [0.5, 1.2, 0.5],
                x: Math.random() * 200 - 100,
                y: Math.random() * 200 - 100
              }}
              transition={{
                duration: 10 + Math.random() * 20,
                repeat: Infinity,
                ease: "linear"
              }}
              className="absolute rounded-full bg-white/20"
              style={{
                width: `${Math.random() * 100 + 50}px`,
                height: `${Math.random() * 100 + 50}px`,
              }}
            />
          ))}
        </>
      )}

      <div className="relative z-10 text-center px-6 py-24 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
            <FiAward className="text-yellow-300" />
            <span className="text-sm font-medium">Trustless Freelance Platform</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-100">
              Neroworks Marketplace
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-indigo-100 max-w-2xl mx-auto">
            {userType === 'freelancer'
              ? 'Welcome back to your freelance hub!'
              : userType === 'employer'
                ? 'Your talent solutions start here!'
                : 'Hire top talent or build your career — decentralized and secure.'}
          </p>
        </motion.div>

        <AnimatePresence>
          {userType ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-10"
            >
              <Link
                href={userType === 'freelancer' ? '/freelancer-dashboard' : '/employer-dashboard'}
                className="inline-flex items-center justify-center gap-2 bg-white text-indigo-700 px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transition-all duration-300 hover:shadow-lg hover:scale-105"
              >
                Go to Dashboard
                <FiArrowRight className="transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-12 flex flex-col sm:flex-row justify-center gap-4"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleJoin('freelancer')}
                className="flex items-center justify-center gap-2 bg-white text-indigo-700 px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transition-all duration-300 hover:shadow-lg"
              >
                <FiUser />
                Join as Freelancer
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleJoin('employer')}
                className="flex items-center justify-center gap-2 bg-indigo-800/90 backdrop-blur-sm px-8 py-4 rounded-full text-white font-semibold hover:bg-indigo-900 transition-all duration-300 hover:shadow-lg border border-indigo-700"
              >
                <FiBriefcase />
                Join as Employer
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
        >
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
            <div className="text-3xl font-bold mb-1">100+</div>
            <div className="text-sm text-indigo-100">Freelancers</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
            <div className="text-3xl font-bold mb-1">50+</div>
            <div className="text-sm text-indigo-100">Employers</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
            <div className="text-3xl font-bold mb-1">200+</div>
            <div className="text-sm text-indigo-100">Jobs Completed</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
            <div className="text-3xl font-bold mb-1">100%</div>
            <div className="text-sm text-indigo-100">Secure Payments</div>
          </div>
        </motion.div>
      </div>

      {/* Floating Elements */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="text-white/50"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M19 12l-7 7-7-7"/>
          </svg>
        </motion.div>
      </motion.div>
    </section>
  )
}

export default HomeHero