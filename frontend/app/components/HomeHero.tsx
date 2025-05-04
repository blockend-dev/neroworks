'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

const HomeHero = () => {
  const router = useRouter();

  const handleJoin = (role: 'freelancer' | 'employer') => {
    localStorage.setItem('user_role', role);
    router.push('/register');
  };

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
        Hire top talent or get hired — fast, secure, and trustless.
      </motion.p>
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
    </section>
  );
};

export default HomeHero;
