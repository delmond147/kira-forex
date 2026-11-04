import { NextResponse } from 'next/server';
import { getStore, saveStore, logActivity } from '@/lib/store';

export async function GET() {
  const store = getStore();
  return NextResponse.json(store.site_settings || {});
}

export async function PUT(req: Request) {
  try {
    const payload = await req.json();
    const store = getStore();
    store.site_settings = {
      ...(store.site_settings || {}),
      ...payload
    };
    saveStore(store);
    logActivity('Settings Updated', 'Website brand parameters and copy updated', 'settings');
    return NextResponse.json({ success: true, message: 'Settings saved successfully' });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Failed to update settings' }, { status: 400 });
  }
}
