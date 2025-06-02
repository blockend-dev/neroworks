'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { FiArrowRight, FiZap } from 'react-icons/fi'

const HomeCTA = () => {
  return (
    <section className="relative py-24 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white overflow-hidden">
      {/* Animated background elements */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 0.1 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
        className="absolute inset-0 flex items-center justify-center"
      >
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              rotate: 360,
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: 15 + Math.random() * 10,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute border-2 border-white/10 rounded-full"
            style={{
              width: `${100 + i * 100}px`,
              height: `${100 + i * 100}px`,
            }}
          />
        ))}
      </motion.div>

      <div className="relative z-10 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-8"
        >
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
            <FiZap className="text-yellow-300" />
            <span className="text-sm font-medium">Get Started Today</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Ready to revolutionize your <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-100">work experience?</span>
          </h2>
          
          <p className="text-xl text-indigo-100 max-w-2xl mx-auto">
            Join the decentralized future of work. No intermediaries, just direct connections between talent and opportunity.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row justify-center gap-4"
        >
          <Link href="/register" passHref>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center gap-2 bg-white text-indigo-700 px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transition-all duration-300 hover:shadow-lg"
            >
              Create Your Account
              <FiArrowRight className="transition-transform group-hover:translate-x-1" />
            </motion.button>
          </Link>
          
          <Link href="/how-it-works" passHref>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center gap-2 bg-transparent border-2 border-white/30 text-white px-8 py-4 rounded-full font-semibold hover:bg-white/10 transition-all duration-300 hover:shadow-lg"
            >
              Learn How It Works
            </motion.button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          viewport={{ once: true }}
          className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto"
        >
          {[
            { value: '0%', label: 'Platform Fees' },
            { value: 'Instant', label: 'Payments' },
            { value: 'Secure', label: 'Escrow' },
            { value: 'Global', label: 'Network' }
          ].map((item, i) => (
            <div key={i} className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
              <div className="text-2xl font-bold mb-1">{item.value}</div>
              <div className="text-sm text-indigo-100">{item.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default HomeCTA