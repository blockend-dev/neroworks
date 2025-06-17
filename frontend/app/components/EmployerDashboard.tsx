'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getAllJobs,editEmployer } from '@/utils/aaUtils';
import { ethers } from 'ethers';
import { toast } from 'react-toastify'
import JobCard from './JobCard';

const EmployerDashboard = ({signer,aaAddress} :any) => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
    const [showEditModal, setShowEditModal] = useState(false);
  const [employerData, setEmployerData] = useState(null); 

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const allJobs = await getAllJobs(signer);
        const filtered = allJobs.filter((job: any) => job.employer.toLowerCase() === aaAddress?.toLowerCase());
        setJobs(filtered);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (aaAddress) fetchJobs();
  }, [aaAddress]);

    const handleSaveProfile = async (updatedData) => {
    try {
      // Call your contract function to update employer profile
      await editEmployer(
        updatedData.name,
        updatedData.industry,
        updatedData.country,
        updatedData.imageURI
      );
      
      // Update local state
      setEmployerData(prev => ({
        ...prev,
        ...updatedData
      }));
      
      setShowEditModal(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <motion.h2 className="text-3xl font-bold mb-4 text-indigo-700">
        Welcome Employer 👋
      </motion.h2>

      <div className="mb-6">
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
          Post New Job
        </button>
      </div>

      {loading ? (
        <p>Loading your jobs...</p>
      ) : jobs.length === 0 ? (
        <p className="text-gray-500">No jobs posted yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jobs.map((job, i) => (
            <JobCard title={job.title}
            description={job.description}
            budget={job.budget}
            jobId={job.id} />
          ))}
        </div>
      )}
    </div>
  );
};

export default EmployerDashboard;
