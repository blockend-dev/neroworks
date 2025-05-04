"use client"
import React, { useState, useEffect } from 'react';
import { getAllJobs } from '../../utils/aaUtils';
import { toast } from 'react-toastify';
import EmployerJobCard from './EmployerJobCard';
import { ethers } from 'ethers';
import { getSigner } from '../../utils/aaUtils';


const EmployerDashboard = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
const [signer , setSigner] = useState<ethers.providers.JsonRpcSigner | null>(null)
  

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const signer = await getSigner()
      setSigner(signer)
      try {
        const allJobs = await getAllJobs(signer);
        setJobs(allJobs);
      } catch (error) {
        toast.error('Failed to load jobs.');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-3xl font-bold text-center mb-6">Employer Dashboard</h2>

      {loading ? (
        <p className="text-center">Loading jobs...</p>
      ) : (
        <div className="space-y-6">
          {jobs.map((job) => (
            <EmployerJobCard key={job.id} job={job} freelancerAddresses={job.applicants} signer={signer} />
          ))}
        </div>
      )}
    </div>
  );
};

export default EmployerDashboard;
