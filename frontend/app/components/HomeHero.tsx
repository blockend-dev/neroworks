'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { getEmployerByAddress, getFreelancerByAddress } from '@/utils/aaUtils';
import { ethers } from 'ethers';
import Link from 'next/link';

const HomeHero = ({ signer, aaAddress }: any) => {
  const [userType, setUserType] = useState<'freelancer' | 'employer' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkRole = async () => {
      try {
        if (!signer || !aaAddress) return;

        const freelancer = await getFreelancerByAddress(signer, aaAddress);
        if (freelancer?.registered) {
          setUserType('freelancer');
        } else {
          const employer = await getEmployerByAddress(signer, aaAddress);
          if (employer?.registered) {
            setUserType('employer');
          }
        }
      } catch (err) {
        console.error('Error checking user role:', err);
      } finally {
        setLoading(false);
      }
    };

    checkRole();
  }, [signer, aaAddress]);

  const handleJoin = (role: 'freelancer' | 'employer') => {
    localStorage.setItem('user_role', role);
    window.location.href = '/register';
  };

  if (loading) return null;

  return (
    <section className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white py-24 px-6 text-center">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-5xl font-bold mb-4"
      >
        Neroworks Freelance Marketplace
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-lg max-w-xl mx-auto"
      >
        {userType === 'freelancer'
          ? 'Welcome back, Freelancer!'
          : userType === 'employer'
            ? 'Welcome back, Employer!'
            : 'Hire top talent or get hired — fast, secure, and trustless.'}
        {userType && (
          // <div className="mt-6">
            <Link
              href={userType === 'freelancer' ? '/freelancer-dashboard' : '/employer-dashboard'}
              className="inline-block bg-white text-indigo-700 px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition"
            >
              Go to Dashboard
            </Link>
          // </div>
        )}
      </motion.p>

      {!userType && (
        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={() => handleJoin('freelancer')}
            className="bg-white text-indigo-700 px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition"
          >
            Join as Freelancer
          </button>
          <button
            onClick={() => handleJoin('employer')}
            className="bg-indigo-800 px-6 py-3 rounded-full text-white font-semibold hover:bg-indigo-900 transition"
          >
            Join as Employer
          </button>
        </div>
      )}
    </section>
  );
};

export default HomeHero;
