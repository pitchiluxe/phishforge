'use client';
import { CardGridSkeleton } from '@/components/layout/page-skeleton';
export default function KnowledgeLoading() {
  return <CardGridSkeleton title="Knowledge Base" cols={3} cards={6} />;
}
