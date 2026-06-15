'use client';
import { TableSkeleton } from '@/components/layout/page-skeleton';
export default function ThreatIntelLoading() {
  return <TableSkeleton title="Threat Intel" rows={5} />;
}
