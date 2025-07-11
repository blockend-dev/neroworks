import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import Navbar from "./components/Navbar";
import { WalletProvider } from "./contexts/WalletContext";
import WalletConnect from "./components/WalletComponent";
import { Providers } from "./providers/provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'Neroworks',
  description: 'Trustless freelance marketplace',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <WalletConnect />
          <Navbar />
          <ToastContainer />
          {children} 
        </Providers>

      </body>
    </html>
  );
}
