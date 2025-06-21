'use client';
import { PrivyProvider } from '@privy-io/react-auth';
import { WalletProvider } from '@/app/contexts/WalletContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
      config={{
        embeddedWallets: {
          createOnLogin: 'users-without-wallets'
        },
        appearance: {
          theme: 'light',
          logo: '/logo.png',
        }
      }}
    >
      <WalletProvider>
        {children}
      </WalletProvider>
    </PrivyProvider>
  );
}