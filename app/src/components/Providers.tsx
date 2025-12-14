'use client';

import { SessionProvider } from 'next-auth/react';
import { ProgressProvider, Progress } from '@/contexts/ProgressContext';
import { AnnotationProvider } from '@/contexts/AnnotationContext';
import { ReactNode } from 'react';
import type { Session } from 'next-auth';

interface ProvidersProps {
  children: ReactNode;
  session: Session | null;
  initialProgress: Progress[];
}

export function Providers({ children, session, initialProgress }: ProvidersProps) {
  return (
    <SessionProvider session={session}>
      <ProgressProvider initialSession={session} initialProgress={initialProgress}>
        <AnnotationProvider>
          {children}
        </AnnotationProvider>
      </ProgressProvider>
    </SessionProvider>
  );
}
