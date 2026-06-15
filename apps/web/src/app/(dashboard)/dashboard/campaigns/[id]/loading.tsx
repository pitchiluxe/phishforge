'use client';
import { TableSkeleton } from '@/components/layout/page-skeleton';
export default function CampaignDetailLoading() {
  return <TableSkeleton title="Campaign" rows={4} />;
}
