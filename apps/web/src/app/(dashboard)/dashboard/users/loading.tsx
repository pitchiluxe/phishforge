'use client';
import { TableSkeleton } from '@/components/layout/page-skeleton';
export default function UsersLoading() {
  return <TableSkeleton title="Team Members" rows={4} />;
}
