'use client';

import { Quiz } from './Quiz';
import { getQuizBySlug } from '@/data/quizzes';

interface QuizSectionProps {
  slug: string;
}

export function QuizSection({ slug }: QuizSectionProps) {
  const quiz = getQuizBySlug(slug);

  if (!quiz) {
    return null;
  }

  return <Quiz quiz={quiz} />;
}
