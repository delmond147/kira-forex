import { NextResponse } from 'next/server';
import { getStore } from '@/lib/store';

export async function GET() {
  const store = getStore();
  const videos = (store.youtube_videos || []).slice(0, 3);
  return NextResponse.json(videos);
}
