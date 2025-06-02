'use client'
import { motion } from 'framer-motion'
import { FiUserCheck, FiSearch, FiDollarSign, FiShield, FiClock, FiCheckCircle } from 'react-icons/fi'

const HowItWorks = () => {
  const steps = [
    {
      icon: <FiUserCheck className="w-8 h-8" />,
      title: 'Register & Verify',
      desc: 'Sign up as a freelancer or employer with secure on-chain verification.',
      color: 'text-indigo-500',
      bg: 'bg-indigo-50'
    },
    {
      icon: <FiSearch className="w-8 h-8" />,
      title: 'Post or Apply for Jobs',
      desc: 'Employers post opportunities. Freelancers apply with one click using their verified profile.',
      color: 'text-blue-500',
      bg: 'bg-blue-50'
    },
    {
      icon: <FiDollarSign className="w-8 h-8" />,
      title: 'Hire & Pay Securely',
      desc: 'Funds are held in smart contract escrow and automatically released when work is approved.',
      color: 'text-green-500',
      bg: 'bg-green-50'
    },
    {
      icon: <FiShield className="w-8 h-8" />,
      title: 'Work with Confidence',
      desc: 'All work is protected by smart contracts with dispute resolution available if needed.',
      color: 'text-purple-500',
      bg: 'bg-purple-50'
    },
    {
      icon: <FiClock className="w-8 h-8" />,
      title: 'Track Progress',
      desc: 'Real-time updates on job milestones and payment schedules.',
      color: 'text-yellow-500',
      bg: 'bg-yellow-50'
    },
    {
      icon: <FiCheckCircle className="w-8 h-8" />,
      title: 'Complete & Review',
      desc: 'Finalize jobs and leave transparent reviews on the blockchain.',
      color: 'text-teal-500',
      bg: 'bg-teal-50'
    }
  ]

  return (
    <section className="py-24 px-6 bg-gradient-to-b from-white to-indigo-50">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            How Neroworks Works
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            A seamless, trustless freelance experience powered by blockchain technology
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className="group"
            >
              <div className={`h-full p-8 rounded-2xl ${step.bg} border border-transparent group-hover:border-white group-hover:shadow-xl transition-all duration-300`}>
                <div className={`w-16 h-16 ${step.bg} rounded-full flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform`}>
                  <span className={step.color}>{step.icon}</span>
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-800">{step.title}</h3>
                <p className="text-gray-600">{step.desc}</p>
                <div className="mt-6 flex justify-center">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${step.color} ${step.bg}`}>
                    Step {i + 1}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          viewport={{ once: true }}
          className="mt-20 bg-white rounded-2xl shadow-sm p-8 md:p-12 border border-gray-100"
        >
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-2xl font-bold mb-4">Why Choose Neroworks?</h3>
            <p className="text-gray-600 mb-6">
              Our platform combines the flexibility of traditional freelancing with the security and transparency of blockchain technology. No middlemen, no hidden fees, just direct value exchange between talent and employers.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              {[
                { value: '0%', label: 'Platform Fees' },
                { value: '100%', label: 'Payment Security' },
                { value: '24/7', label: 'Support' },
                { value: '∞', label: 'Transparency' }
              ].map((item, i) => (
                <div key={i} className="p-4">
                  <div className="text-3xl font-bold text-indigo-600 mb-2">{item.value}</div>
                  <div className="text-sm text-gray-500">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default HowItWorks