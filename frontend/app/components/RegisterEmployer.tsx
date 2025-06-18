'use client'
import { motion } from 'framer-motion'
import { useState, useEffect, AnyActionArg } from 'react'
import { toast } from 'react-toastify'
import axios from 'axios'
import { ethers } from 'ethers'
import { useRouter } from 'next/navigation'
import { FiUpload, FiBriefcase, FiGlobe, FiUser, FiCheckCircle } from 'react-icons/fi'
import { FaIndustry } from 'react-icons/fa'
import { getFreelancerByAddress, registerEmployer } from '@/utils/aaUtils'
import { useWallet } from '../contexts/WalletContext'


const RegisterEmployer = () => {

  const {
    aaAddress,
    signer,
  } = useWallet();


  const [formData, setFormData] = useState({
    employerName: '',
    industry: '',
    country: '',
    image: null as File | null
  })
  const [imageUri, setImageUri] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const router = useRouter()

  const handleImageUpload = async (file: File) => {
    setLoading(true);
    setUploadProgress(0);
    const formData = new FormData();
    formData.append('file', file);

    // Add optional metadata
    formData.append('pinataMetadata', JSON.stringify({
      name: file.name,
      keyvalues: {
        uploadedBy: 'neroworks-employer-registration',
        timestamp: new Date().toISOString()
      }
    }));

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
              );
              setUploadProgress(percentCompleted);
            }
          },
          maxBodyLength: Infinity, // Needed for larger files
          maxContentLength: Infinity,
        }
      );

      if (response.data.IpfsHash) {
        const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
        setImageUri(ipfsUrl);
        // toast.success('Image uploaded to IPFS successfully!');
        return ipfsUrl;
      } else {
        throw new Error('Invalid response from Pinata');
      }
    } catch (error) {
      console.error('IPFS upload error:', error);

      let errorMessage = 'Failed to upload image to IPFS';
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.error ||
          error.message ||
          'Network error during upload';
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
      throw error; // Re-throw for handling in calling function
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.removeItem('user_role');

    const newErrors = {
      employerName: !formData.employerName ? 'Company name is required' : '',
      industry: !formData.industry ? 'Industry is required' : '',
      country: !formData.country ? 'Country is required' : '',
      image: !formData.image ? 'Company logo is required' : '',
    };
    setErrors(newErrors);

    // If there are any errors, do not proceed
    if (Object.values(newErrors).some((err) => err !== '')) {
      toast.error('Please fix the form errors before submitting');
      return;
    }

    if (!signer || !aaAddress) {
      toast.error('Please connect your wallet first!');
      return;
    }

    setLoading(true);
    try {
      const isFreelancer = await getFreelancerByAddress(signer, aaAddress);
      if (isFreelancer?.registered) {
        toast.error('You already have a freelancer account!');
        return;
      }

      const tx = await registerEmployer(
        signer,
        formData.employerName,
        formData.industry,
        formData.country,
        imageUri
      );

      if (tx.transactionHash) {
        toast.success('Employer registered successfully!');
        setTimeout(() => {
          router.push('/employer-dashboard');
        }, 3000);
      }
    } catch (error) {
      toast.error(`Registration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };


  const [errors, setErrors] = useState({
    employerName: '',
    industry: '',
    country: '',
    image: '',
  });

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
            <FiBriefcase className="text-indigo-600 text-3xl" />
          </motion.div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Register Your <span className="text-indigo-600">Company</span>
          </h1>
          <p className="text-lg text-gray-600">
            Join our network of employers and find top talent for your projects
          </p>
        </div>

        <motion.div
          whileHover={{ y: -5 }}
          className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100"
        >
          <div className="p-8">
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                {/* Employer Name */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <FiUser className="text-indigo-500" />
                    Company Name
                  </label>
                  <input
                    type="text"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 transition ${errors.employerName ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:ring-indigo-500'
                      }`}
                    value={formData.employerName}
                    onChange={(e) => {
                      setFormData({ ...formData, employerName: e.target.value });
                      setErrors({ ...errors, employerName: '' });
                    }}
                    placeholder="Acme Inc."
                  />
                  {errors.employerName && <p className="text-sm text-red-600 mt-1">{errors.employerName}</p>}

                </div>

                {/* Industry */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <FaIndustry className="text-indigo-500" />
                    Industry
                  </label>
                  <select
                    className={`w-full px-4 py-3 rounded-lg transition 
    ${errors.industry ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:ring-indigo-500'} 
    border focus:border-indigo-500 focus:ring-2`}
                    value={formData.industry}
                    onChange={(e) => {
                      setFormData({ ...formData, industry: e.target.value });
                      setErrors({ ...errors, industry: '' });
                    }}
                  >
                    <option value="">Select your industry</option>
                    <option value="Technology">Technology</option>
                    <option value="Finance">Finance</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Education">Education</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.industry && <p className="text-sm text-red-600 mt-1">{errors.industry}</p>}

                </div>

                {/* Country */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <FiGlobe className="text-indigo-500" />
                    Country
                  </label>
                  <input
                    type="text"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 transition 
        ${errors.country ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:ring-indigo-500'}`}
                    value={formData.country}
                    onChange={(e) => {
                      setFormData({ ...formData, country: e.target.value });
                      setErrors({ ...errors, country: '' });
                    }}
                    placeholder="United States"
                  />
                  {errors.country && <p className="text-sm text-red-600 mt-1">{errors.country}</p>}

                </div>

                {/* Image Upload */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <FiUpload className="text-indigo-500" />
                    Company Logo
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
                        id="dropzone-file"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            const file = e.target.files[0];
                            if (!['image/jpeg', 'image/png'].includes(file.type)) {
                              toast.error('Only JPG and PNG files are allowed');
                              return;
                            }
                            if (file.size > 5 * 1024 * 1024) {
                              toast.error('Image must be under 5MB');
                              return;
                            }

                            setFormData({ ...formData, image: file });
                            setErrors({ ...errors, image: '' });
                            handleImageUpload(file);
                          }
                        }}

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
                      <FiBriefcase />
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
            { icon: <FiBriefcase className="w-6 h-6" />, text: 'Post Unlimited Jobs' },
            { icon: <FiUser className="w-6 h-6" />, text: 'Access Top Talent' },
            { icon: <FiCheckCircle className="w-6 h-6" />, text: 'Verified Freelancers' },
            { icon: <FiGlobe className="w-6 h-6" />, text: 'Global Reach' }
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

export default RegisterEmployer