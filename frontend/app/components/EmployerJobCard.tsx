import React from 'react';
import { hireFreelancer } from '../../utils/aaUtils';
import { toast } from 'react-toastify';

const EmployerJobCard = ({ job, freelancerAddresses, signer }: { job: any, freelancerAddresses: any[], signer: any }) => {
  const handleHire = async (freelancerAddress: string) => {
    try {
      const tx = await hireFreelancer(signer, job.id, freelancerAddress);
       console.log(tx.transactionHash);
      toast.success('Freelancer hired successfully!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to hire freelancer.');
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-4 mb-4">
      <h3 className="font-bold text-lg">{job.title}</h3>
      <p>{job.description}</p>
      <p className="text-gray-600">Budget: {job.budget} ETH</p>
      
      <h4 className="font-semibold mt-4">Applicants</h4>
      <ul>
        {freelancerAddresses.map((address, index) => (
          <li key={index} className="flex justify-between items-center p-2">
            <span>Freelancer #{index + 1}</span>
            <button 
              onClick={() => handleHire(address)} 
              className="px-4 py-2 bg-green-500 text-white rounded-lg"
            >
              Hire
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EmployerJobCard;
