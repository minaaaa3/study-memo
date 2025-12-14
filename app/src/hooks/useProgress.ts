'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';

interface Progress {
  slug: string;
  completed: boolean;
  completedAt: string | null;
}

export function useProgress() {
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

    try {
      const response = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, completed }),
      });

      if (response.ok) {
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
      }
    } catch (error) {
      console.error('Failed to update progress:', error);
    }
    return false;
  };

  const isCompleted = (slug: string) => {
    return progress.find((p) => p.slug === slug)?.completed ?? false;
  };

  const completedCount = progress.filter((p) => p.completed).length;

  return {
    progress,
    isLoading,
    toggleProgress,
    isCompleted,
    completedCount,
    isAuthenticated: status === 'authenticated',
  };
}
