'use client'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { toast } from 'react-toastify'
import axios from 'axios'
import { ethers } from 'ethers'
import { useRouter } from 'next/navigation'
import { FiUpload, FiUser, FiGlobe, FiCode, FiDollarSign, FiFileText, FiCheckCircle } from 'react-icons/fi'
import { useWallet } from '../contexts/WalletContext'
import { getEmployerByAddress, registerFreelancer } from '../../utils/aaUtils'

const RegisterFreelancer = () => {
  const { aaAddress, signer } = useWallet()
  const router = useRouter()

  const [formData, setFormData] = useState({
    freelancerName: '',
    skills: '',
    country: '',
    gigTitle: '',
    gigDesc: '',
    startingPrice: '',
    image: null as File | null
  })

  const [imageUri, setImageUri] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleImageUpload = async (file: File) => {
    setLoading(true)
    setUploadProgress(0)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await axios.post(
        'https://api.pinata.cloud/pinning/pinFileToIPFS',
        formData,
        {
          headers: {
            'pinata_api_key': process.env.NEXT_PUBLIC_PINATA_KEY,
            'pinata_secret_api_key': process.env.NEXT_PUBLIC_SECRET_KEY,
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              )
              setUploadProgress(percentCompleted)
            }
          }
        }
      )

      setImageUri(`https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`)
      toast.success('Image uploaded successfully!')
    } catch (error) {
      toast.error('Error uploading image!')
      console.error('IPFS upload error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    localStorage.removeItem('user_role')

    if (!signer || !aaAddress) {
      toast.error('Wallet not connected!')
      return
    }

    if (!formData.freelancerName || !formData.skills || !formData.country ||
      !formData.gigTitle || !formData.gigDesc || !formData.startingPrice || !formData.image) {
      toast.error('All fields are required!')
      return
    }

    setLoading(true)

    try {
      // Check if already registered as employer
      const isEmployer = await getEmployerByAddress(signer, aaAddress)
      if (isEmployer.employerAddress.toString() !== ethers.constants.AddressZero) {
        toast.error('You already have an employer account!')
        return
      }

      // Convert price to wei
      const price = ethers.utils.parseEther(formData.startingPrice)

      // Register freelancer
      const tx = await registerFreelancer(
        signer,
        formData.freelancerName,
        formData.skills,
        formData.country,
        formData.gigTitle,
        formData.gigDesc,
        [imageUri, imageUri], // Using same image for profile and gig
        price
      )

      if (tx.transactionHash) {
        toast.success('Freelancer registered successfully!')

        setTimeout(() => {
          router.push('/freelancer-dashboard')
        }, 3000)
      }

    } catch (error) {
      console.error('Registration error:', error)
      toast.error(`Registration failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white py-12 px-4 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto"
      >
        <div className="text-center mb-12">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="inline-flex items-center justify-center bg-indigo-100 p-4 rounded-full mb-6"
          >
            <FiUser className="text-indigo-600 text-3xl" />
          </motion.div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Join as a <span className="text-indigo-600">Freelancer</span>
          </h1>
          <p className="text-lg text-gray-600">
            Showcase your skills and connect with clients worldwide
          </p>
        </div>

        <motion.div
          whileHover={{ y: -5 }}
          className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100"
        >
          <div className="p-8">
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                {/* Freelancer Name */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <FiUser className="text-indigo-500" />
                    Your Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    value={formData.freelancerName}
                    onChange={(e) => setFormData({ ...formData, freelancerName: e.target.value })}
                    placeholder="John Doe"
                    required
                  />
                </div>

                {/* Skills */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <FiCode className="text-indigo-500" />
                    Skills (comma separated)
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    value={formData.skills}
                    onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                    placeholder="Web Development, UI/UX, Smart Contracts"
                    required
                  />
                </div>

                {/* Country */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <FiGlobe className="text-indigo-500" />
                    Country
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    placeholder="United States"
                    required
                  />
                </div>

                {/* Gig Title */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <FiFileText className="text-indigo-500" />
                    Gig Title
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    value={formData.gigTitle}
                    onChange={(e) => setFormData({ ...formData, gigTitle: e.target.value })}
                    placeholder="Senior Web3 Developer"
                    required
                  />
                </div>

                {/* Starting Price */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <FiDollarSign className="text-indigo-500" />
                    Starting Price (USDC)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    value={formData.startingPrice}
                    onChange={(e) => setFormData({ ...formData, startingPrice: e.target.value })}
                    placeholder="0.1"
                    required
                  />
                </div>

                {/* Gig Description */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <FiFileText className="text-indigo-500" />
                    Gig Description
                  </label>
                  <textarea
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    value={formData.gigDesc}
                    onChange={(e) => setFormData({ ...formData, gigDesc: e.target.value })}
                    placeholder="Describe your services, experience, and expertise..."
                    rows={4}
                    required
                  />
                </div>

                {/* Image Upload */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <FiUpload className="text-indigo-500" />
                    Profile Image
                  </label>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        {formData.image ? (
                          <>
                            <FiCheckCircle className="w-8 h-8 text-green-500 mb-2" />
                            <p className="text-sm text-gray-500">{formData.image.name}</p>
                          </>
                        ) : (
                          <>
                            <FiUpload className="w-8 h-8 text-gray-400 mb-2" />
                            <p className="text-sm text-gray-500">
                              <span className="font-semibold">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-gray-400">PNG, JPG up to 5MB</p>
                          </>
                        )}
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            const file = e.target.files[0]
                            setFormData({ ...formData, image: file })
                            handleImageUpload(file)
                          }
                        }}
                        required
                      />
                    </label>
                  </div>
                  {loading && (
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-indigo-600 h-2.5 rounded-full"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  )}
                  {imageUri && !loading && (
                    <p className="text-xs text-green-600 mt-1 truncate">
                      Uploaded: {imageUri}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full py-3 px-4 bg-indigo-600 text-white font-medium rounded-lg transition 
                    ${loading ? 'bg-indigo-400 cursor-not-allowed' : 'hover:bg-indigo-700'}`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Registering...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <FiUser />
                      Complete Registration
                    </span>
                  )}
                </motion.button>
              </div>
            </form>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto"
        >
          {[
            { icon: <FiUser className="w-6 h-6" />, text: 'Global Visibility' },
            { icon: <FiDollarSign className="w-6 h-6" />, text: 'Secure Payments' },
            { icon: <FiCode className="w-6 h-6" />, text: 'Diverse Projects' },
            { icon: <FiCheckCircle className="w-6 h-6" />, text: 'Verified Clients' }
          ].map((item, index) => (
            <div key={index} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 text-center">
              <div className="text-indigo-600 mx-auto mb-2">{item.icon}</div>
              <p className="text-sm font-medium text-gray-700">{item.text}</p>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  )
}

export default RegisterFreelancer