"use client";
import React, { useState } from "react";
import { useWallet } from "../contexts/WalletContext";
import { FiLogOut, FiUser } from "react-icons/fi";
import { motion } from "framer-motion";

const WalletConnect = () => {
  const {
    isConnected,
    isLoading,
    eoaAddress,
    aaAddress,
    error,
    connectTraditional,
    connectSocial,
    disconnect,
  } = useWallet();

  const [showDropdown, setShowDropdown] = useState(false);

  const handleSocialConnect = (provider: "google" | "discord" | "github") => {
    setShowDropdown(false);
    connectSocial();
  };

  return (
    <div className="relative">
      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -top-8 left-0 right-0 text-xs text-red-500 text-center"
        >
          {error}
        </motion.div>
      )}

      {!isConnected ? (
        <div className="flex items-center gap-3">
          {/* Social Login Dropdown */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowDropdown(!showDropdown)}
              disabled={isLoading}
              className="px-3 py-1.5 bg-indigo-600 text-white rounded-full text-sm flex items-center gap-1 shadow-md"
            >
              <FiUser className="text-sm" />
              <span>Sign In</span>
            </motion.button>

            {showDropdown && (
              <div className="absolute mt-2 left-0 min-w-max rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                <div className="py-1">
                  <button
                    onClick={() => handleSocialConnect("google")}
                    className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
                  >
                    Continue with Google
                  </button>
                  <button
                    onClick={() => handleSocialConnect("discord")}
                    className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
                  >
                    Continue with Discord
                  </button>
                  <button
                    onClick={() => handleSocialConnect("github")}
                    className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
                  >
                    Continue with GitHub
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* MetaMask Wallet Connect */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={connectTraditional}
            disabled={isLoading}
            className="px-3 py-1.5 border border-gray-300 rounded-full text-sm flex items-center gap-1 hover:bg-gray-50"
          >
            {isLoading ? "Connecting..." : "Connect Wallet"}
          </motion.button>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          {/* Address Pill */}
          <div className="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium">
            {aaAddress?.slice(0, 6)}...{aaAddress?.slice(-4)}
          </div>

          {/* Disconnect Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={disconnect}
            className="p-1.5 text-gray-500 hover:text-red-500 rounded-full hover:bg-gray-100"
            title="Disconnect"
          >
            <FiLogOut className="text-sm" />
          </motion.button>
        </div>
      )}
    </div>
  );
};

export default WalletConnect;
