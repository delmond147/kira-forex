import { NextResponse } from 'next/server';
import { getStore } from '@/lib/store';

export async function GET() {
  const store = getStore();
  const now = Date.now();
  const activeEvents = (store.events || []).filter(e => {
    const isPublished = e.status === 'published';
    const notExpired = new Date(e.expiry_date).getTime() > now;
    return isPublished && notExpired;
  });
  return NextResponse.json(activeEvents);
}
