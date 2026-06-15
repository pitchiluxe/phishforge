'use client';
import { TableSkeleton } from '@/components/layout/page-skeleton';
export default function KnowledgeBaseLoading() {
  return <TableSkeleton title="Knowledge Base" rows={5} />;
}
