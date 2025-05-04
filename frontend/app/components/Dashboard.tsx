"use client"
import React, { useState, useEffect } from 'react';
import { getAllJobs, getAllFreelancers } from '../../utils/aaUtils';
import { toast } from 'react-toastify';
import { getSigner } from '../../utils/aaUtils';


const Dashboard = () => {
    const [jobs, setJobs] = useState<any[]>([]);
    const [freelancers, setFreelancers] = useState<any[]>([]);
    const [employers, setEmployers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    let connect: any
    if (typeof window !== 'undefined') {
        connect = (window as any).ethereum
    }
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const signer = await getSigner()
                const allJobs = await getAllJobs(signer);
                const allFreelancers = await getAllFreelancers(signer);

                setJobs(allJobs);
                setFreelancers(allFreelancers);
            } catch (error) {
                toast.error('Failed to load data.');
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="container mx-auto p-6">
            <h2 className="text-3xl font-bold text-center mb-6">User Dashboard</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Jobs List */}
                <div className="p-4 bg-white shadow-lg rounded-lg">
                    <h3 className="text-xl font-semibold text-center mb-4">Available Jobs</h3>
                    {loading ? (
                        <p className="text-center">Loading jobs...</p>
                    ) : (
                        <ul>
                            {jobs.map((job, index) => (
                                <li key={index} className="mb-4 p-4 border-b">
                                    <h4 className="font-bold">{job.title}</h4>
                                    <p>{job.description}</p>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Freelancers List */}
                <div className="p-4 bg-white shadow-lg rounded-lg">
                    <h3 className="text-xl font-semibold text-center mb-4">Freelancers</h3>
                    {loading ? (
                        <p className="text-center">Loading freelancers...</p>
                    ) : (
                        <ul>
                            {freelancers.map((freelancer, index) => (
                                <li key={index} className="mb-4 p-4 border-b">
                                    <h4 className="font-bold">{freelancer.name}</h4>
                                    <p>{freelancer.skills}</p>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Employers List */}
                <div className="p-4 bg-white shadow-lg rounded-lg">
                    <h3 className="text-xl font-semibold text-center mb-4">Employers</h3>
                    {loading ? (
                        <p className="text-center">Loading employers...</p>
                    ) : (
                        <ul>
                            {employers.map((employer, index) => (
                                <li key={index} className="mb-4 p-4 border-b">
                                    <h4 className="font-bold">{employer.name}</h4>
                                    <p>{employer.industry}</p>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
