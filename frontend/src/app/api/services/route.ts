import { NextResponse } from 'next/server';
import { getStore } from '@/lib/store';

export async function GET() {
  const store = getStore();
  const services = (store.services || []).filter(s => s.status === 'published');
  return NextResponse.json(services);
}
