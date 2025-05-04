"use client"
import React, {useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import axios from 'axios';
import { ethers } from 'ethers';
import { getSigner } from '../../utils/aaUtils';
import { registerFreelancer, getSupportedTokens, initAAClient, initAABuilder } from '../../utils/aaUtils';


const RegisterFreelancer = ({signer} :any) => {
  const [freelancerName, setFreelancerName] = useState('');
  const [skills, setSkills] = useState('');
  const [country, setCountry] = useState('');
  const [gigTitle, setGigTitle] = useState('');
  const [gigDesc, setGigDesc] = useState('');
  const [startingPrice, setStartingPrice] = useState<number>();
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [imageUri, setImageUri] = useState<string>('');

  
  

  // Pinata API Key and Secret
  const pinataApiKey = process.env.NEXT_PUBLIC_PINATA_KEY;
  const pinataSecretApiKey = process.env.NEXT_PUBLIC_SECRET_KEY;


   
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
          },
        }
      );

      setImageUri(`https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`);
      console.log(response,'res')
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

    if (!freelancerName || !skills || !country || !gigTitle
       || !gigDesc || !image || !startingPrice || !signer) {
      toast.error('All fields are required!');
      return;
    }

    try {
      // Call the registerFreelancer function from aaUtils
      await registerFreelancer(signer,freelancerName, skills, country, 
        gigTitle, gigDesc, [imageUri,imageUri],startingPrice);

      toast.success('Freelancer registered successfully!');
    } catch (error) {
      toast.error('Error registering freelancer!');
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
      <h2 className="text-3xl font-bold text-center mb-6">Register as Freelancer</h2>

      <form onSubmit={handleSubmit}>
        {/* Freelancer Name */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2" htmlFor="freelancerName">
            Freelancer Name
          </label>
          <input
            type="text"
            id="freelancerName"
            className="w-full px-4 py-2 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={freelancerName}
            onChange={(e) => setFreelancerName(e.target.value)}
            placeholder="Enter your name"
          />
        </div>

        {/* Skills */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2" htmlFor="skills">
            Skills
          </label>
          <input
            type="text"
            id="skills"
            className="w-full px-4 py-2 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            placeholder="Enter your skills"
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

        {/* Gig Title */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2" htmlFor="gigTitle">
            Gig Title
          </label>
          <input
            type="text"
            id="gigTitle"
            className="w-full px-4 py-2 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={gigTitle}
            onChange={(e) => setGigTitle(e.target.value)}
            placeholder="Enter your gig title"
          />
        </div>

          {/* starting price */}
          <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2" htmlFor="gigTitle">
            Starting Price(ETH)
          </label>
          <input
            type="number"
            id="price"
            className="w-full px-4 py-2 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={startingPrice}
            onChange={(e) => setStartingPrice(Number(e.target.value))}
          />
        </div>

        {/* Gig Description */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2" htmlFor="gigDesc">
            Gig Description
          </label>
          <textarea
            id="gigDesc"
            className="w-full px-4 py-2 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={gigDesc}
            onChange={(e) => setGigDesc(e.target.value)}
            placeholder="Describe your gig"
            rows={4}
          />
        </div>

        {/* Image Upload */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2" htmlFor="image">
            Profile Image
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
            Register Freelancer
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default RegisterFreelancer;
