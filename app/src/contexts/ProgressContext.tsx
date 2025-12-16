'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import type { Session } from 'next-auth';

export interface Progress {
  slug: string;
  completed: boolean;
  completedAt: string | Date | null;
}

interface ProgressContextType {
  progress: Progress[];
  toggleProgress: (slug: string, completed: boolean) => Promise<boolean>;
  isCompleted: (slug: string) => boolean;
  completedCount: number;
  isAuthenticated: boolean;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

interface ProgressProviderProps {
  children: ReactNode;
  initialSession: Session | null;
  initialProgress: Progress[];
}

export function ProgressProvider({ children, initialSession, initialProgress }: ProgressProviderProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const currentSession = session ?? initialSession;
  const userId = currentSession?.user?.id;

  // サーバーから取得した初期データを使用
  const [progress, setProgress] = useState<Progress[]>(initialProgress);

  // 401エラー時にログアウトしてログイン画面へ遷移
  const handleAuthError = async () => {
    await signOut({ redirect: false });
    router.push('/auth/signin');
  };

  const toggleProgress = async (slug: string, completed: boolean) => {
    if (!userId) {
      return false;
    }

    // サーバーにリクエストを送信し、成功した場合のみUIを更新
    try {
      const response = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, completed }),
      });

      if (!response.ok) {
        // 401エラーの場合はログイン画面へ遷移
        if (response.status === 401) {
          await handleAuthError();
          return false;
        }
        return false;
      }

      // サーバーからの応答が成功した場合のみUIを更新
      setProgress((prev) => {
        const existing = prev.find((p) => p.slug === slug);
        if (existing) {
          return prev.map((p) =>
            p.slug === slug
              ? { ...p, completed, completedAt: completed ? new Date().toISOString() : null }
              : p
          );
        }
        return [
          ...prev,
          { slug, completed, completedAt: completed ? new Date().toISOString() : null },
        ];
      });
      return true;
    } catch (error) {
      console.error('Failed to update progress:', error);
      return false;
    }
  };

  const isCompleted = (slug: string) => {
    return progress.find((p) => p.slug === slug)?.completed ?? false;
  };

  const completedCount = progress.filter((p) => p.completed).length;

  return (
    <ProgressContext.Provider
      value={{
        progress,
        toggleProgress,
        isCompleted,
        completedCount,
        isAuthenticated: !!userId,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const context = useContext(ProgressContext);
  if (context === undefined) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
}
