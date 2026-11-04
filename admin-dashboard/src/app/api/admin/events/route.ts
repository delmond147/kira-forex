import { NextResponse } from 'next/server';
import { getStore, saveStore, logActivity } from '@/lib/store';

export async function GET() {
  const store = getStore();
  return NextResponse.json(store.events || []);
}

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const store = getStore();
    const newEvent = {
      id: 'e_' + Date.now(),
      title: payload.title || 'New Event',
      slug: (payload.title || 'event').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      short_description: payload.short_description || '',
      full_description: payload.full_description || '',
      thumbnail_url: payload.thumbnail_url || '/events/beginner_class_event_flyer.jpg',
      start_date: payload.start_date || new Date().toISOString(),
      end_date: payload.end_date || new Date().toISOString(),
      expiry_date: payload.expiry_date || new Date(Date.now() + 86400000 * 30).toISOString(),
      time_zone: payload.time_zone || 'GMT / UTC',
      venue_type: payload.venue_type || 'Online',
      location_or_link: payload.location_or_link || '',
      price_amount: Number(payload.price_amount) || 0,
      price_currency: payload.price_currency || 'USD',
      booking_whatsapp: payload.booking_whatsapp || '+233 502 75 8608',
      booking_call: payload.booking_call || '+233 594 86 2521',
      booking_url: payload.booking_url || '',
      status: 'published'
    };
    store.events = [...(store.events || []), newEvent];
    saveStore(store);
    logActivity('Event Published', `${newEvent.title} created`, 'event');
    return NextResponse.json({ success: true, event: newEvent });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Failed to create event' }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const store = getStore();
    store.events = (store.events || []).filter((x) => x.id !== id);
    saveStore(store);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Failed to delete' }, { status: 500 });
  }
}
