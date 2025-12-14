'use client';

import { SessionProvider } from 'next-auth/react';
import { ProgressProvider } from '@/contexts/ProgressContext';
import { ReactNode } from 'react';
import type { Session } from 'next-auth';

interface ProvidersProps {
  children: ReactNode;
  session: Session | null;
}

export function Providers({ children, session }: ProvidersProps) {
  return (
    <SessionProvider session={session}>
      <ProgressProvider initialSession={session}>{children}</ProgressProvider>
    </SessionProvider>
  );
}
