'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    setRole(localStorage.getItem('user_role'));
  }, []);

  // Don't show Navbar on these pages
  if (pathname === '/' || pathname === '/register') return null;

  return (
    <nav className="bg-white shadow-md py-4 px-6 flex justify-between items-center">
      <Link href="/" className="text-xl font-bold text-indigo-600">
        Neroworks
      </Link>
      <div className="space-x-6">
        {role === 'freelancer' ? (
          <>
            <Link href="/freelancer-dashboard" className="hover:text-indigo-600">Freelancer Dashboard</Link>
            <Link href="/jobs" className="hover:text-indigo-600">Browse Jobs</Link>
          </>
        ) : role === 'employer' ? (
          <>
            <Link href="/employer-dashboard" className="hover:text-indigo-600">Employer Dashboard</Link>
            <Link href="/post-job" className="hover:text-indigo-600">Post a Job</Link>
          </>
        ) : null}
        {/* <button
          onClick={() => {
            localStorage.clear();
            router.push('/');
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded"
        >
          Logout
        </button> */}
      </div>
    </nav>
  );
};

export default Navbar;
