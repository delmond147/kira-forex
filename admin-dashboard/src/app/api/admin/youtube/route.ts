import { NextResponse } from 'next/server';
import { getStore, saveStore, logActivity } from '@/lib/store';

export async function GET() {
  const store = getStore();
  return NextResponse.json(store.youtube_videos || []);
}

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const store = getStore();
    const newVideo = {
      id: 'vid_' + Date.now(),
      videoId: payload.videoId || 'custom',
      title: payload.title || 'New Market Breakdown',
      publishedAt: new Date().toISOString(),
      thumbnailUrl: payload.thumbnailUrl || '/kira_forex_founder.jpg',
      videoUrl: payload.videoUrl || 'https://youtube.com/@kiraforexgh'
    };
    store.youtube_videos = [newVideo, ...(store.youtube_videos || [])];
    saveStore(store);
    logActivity('Video Added', `Added '${newVideo.title}'`, 'video');
    return NextResponse.json({ success: true, video: newVideo });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Failed to add video' }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const store = getStore();
    store.youtube_videos = (store.youtube_videos || []).filter((x) => x.id !== id);
    saveStore(store);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Failed to delete' }, { status: 500 });
  }
}
