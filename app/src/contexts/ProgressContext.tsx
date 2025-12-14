'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useSession } from 'next-auth/react';

interface Progress {
  slug: string;
  completed: boolean;
  completedAt: string | null;
}

interface ProgressContextType {
  progress: Progress[];
  isLoading: boolean;
  isSessionLoading: boolean;
  toggleProgress: (slug: string, completed: boolean) => Promise<boolean>;
  isCompleted: (slug: string) => boolean;
  completedCount: number;
  isAuthenticated: boolean;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [progress, setProgress] = useState<Progress[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProgress = useCallback(async () => {
    if (status !== 'authenticated') {
      setProgress([]);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/progress');
      if (response.ok) {
        const data = await response.json();
        setProgress(data.progress);
      }
    } catch (error) {
      console.error('Failed to fetch progress:', error);
    } finally {
      setIsLoading(false);
    }
  }, [status]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  const toggleProgress = async (slug: string, completed: boolean) => {
    if (status !== 'authenticated') {
      return false;
    }

    // Optimistic update - immediately update the UI
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

    // Then send the request to the server
    try {
      const response = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, completed }),
      });

      if (!response.ok) {
        // Revert on failure
        setProgress((prev) => {
          const existing = prev.find((p) => p.slug === slug);
          if (existing) {
            return prev.map((p) =>
              p.slug === slug
                ? { ...p, completed: !completed, completedAt: !completed ? new Date().toISOString() : null }
                : p
            );
          }
          return prev.filter((p) => p.slug !== slug);
        });
        return false;
      }
      return true;
    } catch (error) {
      console.error('Failed to update progress:', error);
      // Revert on error
      setProgress((prev) => {
        const existing = prev.find((p) => p.slug === slug);
        if (existing) {
          return prev.map((p) =>
            p.slug === slug
              ? { ...p, completed: !completed, completedAt: !completed ? new Date().toISOString() : null }
              : p
          );
        }
        return prev.filter((p) => p.slug !== slug);
      });
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
        isLoading,
        isSessionLoading: status === 'loading',
        toggleProgress,
        isCompleted,
        completedCount,
        isAuthenticated: status === 'authenticated',
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
