import { NextResponse } from 'next/server';
import { getStore, saveStore } from '@/lib/store';

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const store = getStore();
    const newEnquiry = {
      id: 'enq_' + Date.now(),
      full_name: payload.name || 'Anonymous',
      email: payload.email || '',
      phone: payload.phone || '',
      service_interest: payload.service || 'General Enquiry',
      message: payload.message || '',
      status: 'new',
      created_at: new Date().toISOString(),
    };
    store.enquiries = [newEnquiry, ...(store.enquiries || [])];
    saveStore(store);
    return NextResponse.json({ success: true, message: 'Enquiry received successfully.' });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 });
  }
}
