import { NextResponse } from 'next/server';
import { getStore, saveStore, logActivity } from '@/lib/store';

export async function GET() {
  const store = getStore();
  return NextResponse.json(store.enquiries || []);
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Lead ID is required' }, { status: 400 });
    }

    const store = getStore();
    const lead = (store.enquiries || []).find((e) => e.id === id);
    store.enquiries = (store.enquiries || []).filter((e) => e.id !== id);
    saveStore(store);

    if (lead) {
      logActivity('Lead Deleted', `${lead.full_name} (${lead.service_interest}) removed`, 'lead');
    }

    return NextResponse.json({ success: true, message: 'Lead deleted successfully' });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Failed to delete lead' }, { status: 500 });
  }
}
