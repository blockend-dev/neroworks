'use client';

import { motion } from 'framer-motion';

type JobCardProps = {
  title: string;
  description: string;
  budget: string;
  jobId: number;
};

const JobCard = ({ title, description, budget, jobId }: JobCardProps) => {
  return (
    <motion.div
      className="bg-white rounded-2xl shadow-md p-6 w-full max-w-md border border-gray-100"
      whileHover={{ scale: 1.02 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="mb-2">
        <h3 className="text-xl font-bold text-indigo-700">{title}</h3>
        <p className="text-sm text-gray-500">Job ID: #{jobId}</p>
      </div>

      <p className="text-gray-700 mt-2 text-sm">{description}</p>

      <div className="mt-4 flex flex-wrap justify-between text-sm text-gray-600">
        <span><strong>Budget:</strong> {budget}</span>
      </div>

      <div className="mt-6 text-right">
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-full text-sm hover:bg-indigo-700 transition">
          View Details
        </button>
      </div>
    </motion.div>
  );
};

export default JobCard;
