'use client';

import { SessionProvider } from 'next-auth/react';
import { ProgressProvider } from '@/contexts/ProgressContext';
import { ReactNode } from 'react';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <ProgressProvider>{children}</ProgressProvider>
    </SessionProvider>
  );
}
