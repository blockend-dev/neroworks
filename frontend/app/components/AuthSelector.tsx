'use client';
import { useWallet } from '../contexts/WalletContext';

export const AuthSelector = () => {
  const { 
    mode,
    connectTraditional,
    connectSocial,
    aaAddress
  } = useWallet();

  if (aaAddress) return null; 

  return (
    <div className="flex gap-2">
      <button
        onClick={connectSocial}
        className="px-3 py-1.5 bg-indigo-600 text-white rounded-md text-sm flex items-center gap-2"
      >
        <span>Sign in</span>
      </button>
      <button
        onClick={connectTraditional}
        className="px-3 py-1.5 border border-gray-300 rounded-md text-sm flex items-center gap-2"
      >
        <span>Connect Wallet</span>
      </button>
    </div>
  );
};