'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface Annotation {
  id: string;
  slug: string;
  selectedText: string;
  prefix: string;
  suffix: string;
  comment: string;
  color: string;
  createdAt: string;
}

interface SelectionInfo {
  text: string;
  prefix: string;
  suffix: string;
  range: Range | null;
}

interface AnnotationContextType {
  annotations: Annotation[];
  isLoading: boolean;
  currentSelection: SelectionInfo | null;
  activeAnnotation: Annotation | null;
  fetchAnnotations: (slug: string) => Promise<void>;
  addAnnotation: (data: {
    slug: string;
    selectedText: string;
    prefix: string;
    suffix: string;
    comment: string;
    color?: string;
  }) => Promise<Annotation | null>;
  updateAnnotation: (id: string, data: { comment?: string; color?: string }) => Promise<boolean>;
  deleteAnnotation: (id: string) => Promise<boolean>;
  setCurrentSelection: (selection: SelectionInfo | null) => void;
  setActiveAnnotation: (annotation: Annotation | null) => void;
  clearSelection: () => void;
}

const AnnotationContext = createContext<AnnotationContextType | undefined>(undefined);

interface AnnotationProviderProps {
  children: ReactNode;
}

export function AnnotationProvider({ children }: AnnotationProviderProps) {
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSelection, setCurrentSelection] = useState<SelectionInfo | null>(null);
  const [activeAnnotation, setActiveAnnotation] = useState<Annotation | null>(null);

  const fetchAnnotations = useCallback(async (slug: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/annotations?slug=${encodeURIComponent(slug)}`);
      if (response.ok) {
        const data = await response.json();
        setAnnotations(data.annotations);
      }
    } catch (error) {
      console.error('Failed to fetch annotations:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addAnnotation = useCallback(async (data: {
    slug: string;
    selectedText: string;
    prefix: string;
    suffix: string;
    comment: string;
    color?: string;
  }): Promise<Annotation | null> => {
    try {
      const response = await fetch('/api/annotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const { annotation } = await response.json();
        setAnnotations(prev => [...prev, annotation]);
        return annotation;
      }
      return null;
    } catch (error) {
      console.error('Failed to add annotation:', error);
      return null;
    }
  }, []);

  const updateAnnotation = useCallback(async (
    id: string,
    data: { comment?: string; color?: string }
  ): Promise<boolean> => {
    try {
      const response = await fetch('/api/annotations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...data }),
      });

      if (response.ok) {
        const { annotation } = await response.json();
        setAnnotations(prev =>
          prev.map(a => (a.id === id ? annotation : a))
        );
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to update annotation:', error);
      return false;
    }
  }, []);

  const deleteAnnotation = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/annotations?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setAnnotations(prev => prev.filter(a => a.id !== id));
        setActiveAnnotation(null);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to delete annotation:', error);
      return false;
    }
  }, []);

  const clearSelection = useCallback(() => {
    setCurrentSelection(null);
    window.getSelection()?.removeAllRanges();
  }, []);

  return (
    <AnnotationContext.Provider
      value={{
        annotations,
        isLoading,
        currentSelection,
        activeAnnotation,
        fetchAnnotations,
        addAnnotation,
        updateAnnotation,
        deleteAnnotation,
        setCurrentSelection,
        setActiveAnnotation,
        clearSelection,
      }}
    >
      {children}
    </AnnotationContext.Provider>
  );
}

export function useAnnotations() {
  const context = useContext(AnnotationContext);
  if (context === undefined) {
    throw new Error('useAnnotations must be used within an AnnotationProvider');
  }
  return context;
}
