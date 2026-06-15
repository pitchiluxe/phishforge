'use client';
import { CardGridSkeleton } from '@/components/layout/page-skeleton';
export default function TemplatesLoading() {
  return <CardGridSkeleton title="Templates" cols={3} cards={6} />;
}
