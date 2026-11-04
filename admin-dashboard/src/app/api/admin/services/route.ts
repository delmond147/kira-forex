import { NextResponse } from 'next/server';
import { getStore, saveStore, logActivity } from '@/lib/store';

export async function GET() {
  const store = getStore();
  return NextResponse.json(store.services || []);
}

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const store = getStore();
    const newService = {
      id: 's_' + Date.now(),
      title: payload.title || 'New Program',
      category: payload.category || 'Course',
      slug: (payload.title || 'course').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      short_description: payload.short_description || '',
      full_description: payload.full_description || '',
      icon: payload.icon || 'BookOpen',
      price_amount: Number(payload.price_amount) || 0,
      price_currency: payload.price_currency || 'USD',
      delivery_format: payload.delivery_format || 'Online',
      duration: payload.duration || '4 Weeks',
      features: Array.isArray(payload.features) ? payload.features : [],
      cta_text: payload.cta_text || 'Enroll via WhatsApp',
      cta_whatsapp_message: payload.cta_whatsapp_message || '',
      status: 'published',
      display_order: (store.services?.length || 0) + 1,
    };
    store.services = [...(store.services || []), newService];
    saveStore(store);
    logActivity('Program Created', `Added '${newService.title}' (${newService.category})`, 'program');
    return NextResponse.json({ success: true, service: newService });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Failed to create program' }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const store = getStore();
    const s = (store.services || []).find((x) => x.id === id);
    store.services = (store.services || []).filter((x) => x.id !== id);
    saveStore(store);
    if (s) {
      logActivity('Program Deleted', `Removed '${s.title}'`, 'program');
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Failed to delete' }, { status: 500 });
  }
}
