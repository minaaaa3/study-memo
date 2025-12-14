'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { NavSection } from '@/lib/navigation';

interface SearchContextType {
  navSections: NavSection[];
}

const SearchContext = createContext<SearchContextType>({
  navSections: [],
});

export function SearchProvider({
  children,
  navSections,
}: {
  children: ReactNode;
  navSections: NavSection[];
}) {
  return (
    <SearchContext.Provider value={{ navSections }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  return useContext(SearchContext);
}
