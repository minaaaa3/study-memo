'use client';

import { ReactNode } from 'react';
import { AnnotatableContent } from './AnnotatableContent';

interface DocContentProps {
  slug: string;
  children: ReactNode;
}

export function DocContent({ slug, children }: DocContentProps) {
  return (
    <AnnotatableContent slug={slug}>
      {children}
    </AnnotatableContent>
  );
}
