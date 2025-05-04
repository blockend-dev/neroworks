"use client"
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import axios from 'axios';
import { registerEmployer } from '../../utils/aaUtils';
import { registerFreelancer, getSupportedTokens, initAAClient, initAABuilder } from '../../utils/aaUtils';
import PaymentTypeSelector from './PaymentTypeSelector';
import { ethers } from 'ethers';
import { getSigner } from '../../utils/aaUtils';


interface NFTMinterProps {
  signer?: ethers.Signer;
  aaWalletAddress?: string;
}

const RegisterEmployer = () => {
  const [employerName, setEmployerName] = useState('');
  const [industry, setIndustry] = useState('');
  const [country, setCountry] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [imageUri, setImageUri] = useState<string>('');
  const [signer , setSigner] = useState<ethers.providers.JsonRpcSigner | null>(null)
  // Payment type state
  const [paymentType, setPaymentType] = useState(0);
  const [selectedToken, setSelectedToken] = useState('');
  const [supportedTokens, setSupportedTokens] = useState<Array<any>>([]);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [isFetchingTokens, setIsFetchingTokens] = useState(false);

  // Pinata API Key and Secret
  const pinataApiKey = process.env.NEXT_PUBLIC_PINATA_KEY;
  const pinataSecretApiKey = process.env.NEXT_PUBLIC_SECRET_KEY;

  // Load supported tokens when component mounts and signer is available
  useEffect(() => {
    const loadTokens = async () => {
    const signer = await getSigner()
    setSigner(signer)
      // Only run if signer is defined
      if (signer) {
        try {
          // Check if signer has getAddress method
          if (typeof signer.getAddress !== 'function') {
            console.error("Invalid signer: missing getAddress method");
            setError("Wallet connection issue: please reconnect your wallet");
            return;
          }

          // Verify signer is still connected by calling getAddress
          await signer.getAddress();

          // If connected, fetch tokens
          fetchSupportedTokens();
        } catch (error) {
          console.error("Signer validation error:", error);
          setError("Wallet connection issue: please reconnect your wallet");
        }
      } else {
        // Reset tokens if signer is not available
        setSupportedTokens([]);
        console.log("Signer not available, tokens reset");
      }
    };

    loadTokens();
  }, [signer]);

    const fetchSupportedTokens = async () => {
      if (!signer) {
        console.log("Signer not available");
        return;
      }
  
      // Verify signer has getAddress method
      if (typeof signer.getAddress !== 'function') {
        console.error("Invalid signer: missing getAddress method");
        setError("Wallet connection issue: please reconnect your wallet");
        return;
      }
  
      try {
        setIsFetchingTokens(true);
        setError(null);
  
        // This is a placeholder implementation
        // Replace with your implementation based on the tutorial
        const client = await initAAClient(signer);
        const builder = await initAABuilder(signer);
        
        // Fetch supported tokens
        const tokens = await getSupportedTokens(client, builder);
        setSupportedTokens(tokens);
      } catch (error: any) {
        console.error("Error fetching supported tokens:", error);
        setError(`Token loading error: ${error.message || "Unknown error"}`);
      } finally {
        setIsFetchingTokens(false);
      }
    };
  
    /**
     * Handle payment type change
     */
    const handlePaymentTypeChange = (type: number, token?: string) => {
      setPaymentType(type);
      if (token) {
        setSelectedToken(token);
      } else {
        setSelectedToken('');
      }
    };

  // Handle image upload to Pinata
  const handleImageUpload = async (file: File) => {
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(
        'https://api.pinata.cloud/pinning/pinFileToIPFS',
        formData,
        {
          headers: {
            'pinata_api_key': pinataApiKey,
            'pinata_secret_api_key': pinataSecretApiKey,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setImageUri(`https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`);
      toast.success('Image uploaded successfully!');
    } catch (error) {
      toast.error('Error uploading image!');
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if(!signer){
      toast.error('Invalid signer!');
      return;
    }

    if (!employerName || !industry || !country || !image) {
      toast.error('All fields are required!');
      return;
    }

    try {
      // Call the registerEmployer function from aaUtils
      await registerEmployer(signer,employerName, industry, country, imageUri);

      toast.success('Employer registered successfully!');
    } catch (error) {
      toast.error('Error registering employer!');
      console.error(error);
    }
  };

  return (
    <motion.div
      className="w-full max-w-md mx-auto mt-12 p-6 bg-white rounded-xl shadow-lg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <h2 className="text-3xl font-bold text-center mb-6">Register as Employer</h2>

      <form onSubmit={handleSubmit}>
        {/* Employer Name */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2" htmlFor="employerName">
            Employer Name
          </label>
          <input
            type="text"
            id="employerName"
            className="w-full px-4 py-2 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={employerName}
            onChange={(e) => setEmployerName(e.target.value)}
            placeholder="Enter your company name"
          />
        </div>

        {/* Industry */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2" htmlFor="industry">
            Industry
          </label>
          <input
            type="text"
            id="industry"
            className="w-full px-4 py-2 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            placeholder="Enter the industry"
          />
        </div>

        {/* Country */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2" htmlFor="country">
            Country
          </label>
          <input
            type="text"
            id="country"
            className="w-full px-4 py-2 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            placeholder="Enter your country"
          />
        </div>

        {/* Image Upload */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2" htmlFor="image">
            Company Logo / Image
          </label>
          <input
            type="file"
            id="image"
            className="w-full px-4 py-2 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => {
              if (e.target.files) {
                setImage(e.target.files[0]);
                handleImageUpload(e.target.files[0]);
              }
            }}
          />
          {loading && <p className="text-blue-500 mt-2">Uploading...</p>}
          {imageUri && (
            <p className="text-green-500 mt-2">Image uploaded: <a href={imageUri} target="_blank" rel="noopener noreferrer">{imageUri}</a></p>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-center">
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Register Employer
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default RegisterEmployer;
