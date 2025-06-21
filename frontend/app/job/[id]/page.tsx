'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ethers } from 'ethers';
import { getJobByID } from '@/utils/aaUtils';
import { useWallet } from '@/app/contexts/WalletContext';
import {
  FiArrowLeft,
  FiUser,
  FiDollarSign,
  FiUsers,
  FiCheckCircle,
  FiBriefcase,
  FiFlag,
} from 'react-icons/fi';

export default function JobPage() {
  const params = useParams();
  const jobId = parseInt(params.id as string, 10);

  const { signer, aaAddress } = useWallet();

  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJob = async () => {
      if (!signer || isNaN(jobId)) return;

      try {
        const jobData = await getJobByID(signer, jobId);
        setJob(jobData);
      } catch (err) {
        console.error('Error fetching job:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [signer, jobId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <p className="text-center text-gray-600">Loading job...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link
          href="/browse-jobs"
          className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 mb-6"
        >
          <FiArrowLeft /> Back to Jobs
        </Link>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
          <h2 className="text-xl font-medium text-gray-700">Job not found</h2>
        </div>
      </div>
    );
  }

  const isEmployer = aaAddress?.toLowerCase() === job.employer.toLowerCase();
  const hasApplied = job.applicants?.includes(aaAddress?.toLowerCase());
  const isHired = job.hiredFreelancer?.toLowerCase() === aaAddress?.toLowerCase();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link
        href="/browse-jobs"
        className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 mb-6"
      >
        <FiArrowLeft /> Back to Jobs
      </Link>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
              <span
                className={`px-2 py-1 rounded text-xs font-medium ${
                  job.completed
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-green-100 text-green-800'
                }`}
              >
                {job.completed ? 'Completed' : 'Active'}
              </span>
            </div>

            <div className="flex flex-wrap gap-4 mb-4">
              <span className="flex items-center gap-1 text-gray-600">
                <FiUser /> {job.employer.slice(0, 6)}...{job.employer.slice(-4)}
              </span>
              <span className="flex items-center gap-1 text-gray-600">
                <FiDollarSign /> {ethers.utils.formatEther(job.budget)} ETH
              </span>
              {!job.completed && (
                <span className="flex items-center gap-1 text-gray-600">
                  <FiUsers /> {job.applicants?.length || 0} applicants
                </span>
              )}
              {isHired && (
                <span className="flex items-center gap-1 text-green-600">
                  <FiCheckCircle /> {job.completed ? 'Completed by you' : 'Hired'}
                </span>
              )}
            </div>
          </div>
          <FiBriefcase className="text-indigo-500 text-2xl mt-1" />
        </div>

        <div className="border-t border-gray-200 pt-4">
          <h3 className="font-medium text-gray-900 mb-2">Job Description</h3>
          <p className="text-gray-700 whitespace-pre-line">{job.description}</p>
        </div>
      </div>

      <div className="flex gap-4">
        {isEmployer && !job.completed && (
          <Link
            href={`/job/${jobId}/applicants`}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-6 rounded-lg font-medium text-center"
          >
            <FiUsers className="inline mr-2" />
            View Applicants ({job.applicants?.length || 0})
          </Link>
        )}

        {job.completed && (
          <div className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-lg bg-gray-100 text-gray-700">
            <FiFlag className="text-purple-500" />
            {isEmployer ? 'Job completed' : 'This job has been completed'}
          </div>
        )}
      </div>
    </div>
  );
}
