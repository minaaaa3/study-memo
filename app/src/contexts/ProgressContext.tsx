'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import type { Session } from 'next-auth';

interface Progress {
  slug: string;
  completed: boolean;
  completedAt: string | null;
}

interface ProgressContextType {
  progress: Progress[];
  isLoading: boolean;
  toggleProgress: (slug: string, completed: boolean) => Promise<boolean>;
  isCompleted: (slug: string) => boolean;
  completedCount: number;
  isAuthenticated: boolean;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

const CACHE_KEY = 'study-progress-cache';

interface CachedProgress {
  userId: string;
  progress: Progress[];
  timestamp: number;
}

function getCachedProgress(userId: string): Progress[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    const data: CachedProgress = JSON.parse(cached);
    // 同じユーザーのキャッシュのみ使用（24時間以内）
    if (data.userId === userId && Date.now() - data.timestamp < 24 * 60 * 60 * 1000) {
      return data.progress;
    }
    return null;
  } catch {
    return null;
  }
}

function setCachedProgress(userId: string, progress: Progress[]) {
  if (typeof window === 'undefined') return;
  try {
    const data: CachedProgress = { userId, progress, timestamp: Date.now() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

function clearCachedProgress() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch {
    // ignore
  }
}

interface ProgressProviderProps {
  children: ReactNode;
  initialSession: Session | null;
}

export function ProgressProvider({ children, initialSession }: ProgressProviderProps) {
  const { data: session } = useSession();
  const currentSession = session ?? initialSession;
  const userId = currentSession?.user?.id;

  // キャッシュから初期値を取得
  const [progress, setProgress] = useState<Progress[]>(() => {
    if (userId) {
      return getCachedProgress(userId) ?? [];
    }
    return [];
  });
  const [isLoading, setIsLoading] = useState(false);

  const fetchProgress = useCallback(async () => {
    if (!userId) {
      setProgress([]);
      clearCachedProgress();
      return;
    }

    try {
      const response = await fetch('/api/progress');
      if (response.ok) {
        const data = await response.json();
        setProgress(data.progress);
        setCachedProgress(userId, data.progress);
      }
    } catch (error) {
      console.error('Failed to fetch progress:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  const toggleProgress = async (slug: string, completed: boolean) => {
    if (!userId) {
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
      // Update cache on success
      setProgress((prev) => {
        if (userId) setCachedProgress(userId, prev);
        return prev;
      });
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
