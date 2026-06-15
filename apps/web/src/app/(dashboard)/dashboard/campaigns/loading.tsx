'use client';
import { TableSkeleton } from '@/components/layout/page-skeleton';
export default function CampaignsLoading() {
  return <TableSkeleton title="Campaigns" rows={6} />;
}
