import fs from 'fs';
import path from 'path';
import defaultStore from '../data/store.json';

export interface SiteSettings {
  site_title?: string;
  hero_badge?: string;
  hero_headline?: string;
  hero_subheadline?: string;
  about_snippet?: string;
  primary_telegram_url?: string;
  synthetics_telegram_url?: string;
  deriv_partner_url?: string;
  youtube_url?: string;
  whatsapp_general_url?: string;
  whatsapp_phone?: string;
  call_phone?: string;
  facebook_url?: string;
  instagram_url?: string;
  hero_image_url?: string;
  hero_btn1_text?: string;
  hero_btn2_text?: string;
  hero_btn2_url?: string;
  hero_stat1_val?: string;
  hero_stat1_lbl?: string;
  hero_stat2_val?: string;
  hero_stat2_lbl?: string;
  hero_stat3_val?: string;
  hero_stat3_lbl?: string;
  about_badge?: string;
  about_heading?: string;
  about_point1?: string;
  about_point2?: string;
  about_point3?: string;
  philosophy_title?: string;
  philosophy_quote?: string;
  philosophy_author?: string;
  philosophy_author_title?: string;
  programs_heading?: string;
  events_heading?: string;
  youtube_heading?: string;
  youtube_btn_text?: string;
  community_heading?: string;
  community_subheading?: string;
  community_btn1_text?: string;
  community_btn2_text?: string;
  font_heading?: string;
  font_body?: string;
  font_scale?: string;
  theme_mode?: string;
  brand_accent_color?: string;
  theme_bg_color?: string;
}

export interface EventItem {
  id: string;
  title: string;
  slug: string;
  short_description: string;
  full_description: string;
  thumbnail_url: string;
  start_date: string;
  end_date: string;
  expiry_date: string;
  time_zone: string;
  venue_type: string;
  location_or_link: string;
  price_amount: number;
  price_currency: string;
  booking_whatsapp: string;
  booking_call: string;
  booking_url: string;
  status: string;
}

export interface ServiceItem {
  id: string;
  title: string;
  category: string;
  slug: string;
  short_description: string;
  full_description: string;
  icon: string;
  price_amount: number;
  price_currency: string;
  delivery_format: string;
  duration: string;
  features: string[];
  cta_text: string;
  cta_whatsapp_message: string;
  status: string;
  display_order: number;
}

export interface VideoItem {
  id: string;
  videoId: string;
  title: string;
  publishedAt: string;
  thumbnailUrl: string;
  videoUrl: string;
}

export interface EnquiryItem {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  service_interest: string;
  message: string;
  status: string;
  created_at: string;
}

export interface StoreData {
  site_settings: SiteSettings;
  events: EventItem[];
  services: ServiceItem[];
  youtube_videos: VideoItem[];
  enquiries: EnquiryItem[];
  activity_log: Array<{ id: string; action: string; detail: string; timestamp: string; type: string }>;
}

const DATA_FILE = path.join(process.cwd(), 'src', 'data', 'store.json');

export function getStore(): StoreData {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf8');
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error reading store.json, using default fallback:', e);
  }
  return defaultStore as StoreData;
}

export function saveStore(data: StoreData): void {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    // If running in read-only environment like Vercel serverless, attempt /tmp
    try {
      const tmpPath = path.join('/tmp', 'store.json');
      fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf8');
    } catch (err) {
      console.error('Error saving store to /tmp:', err);
    }
  }
}

export function logActivity(action: string, detail: string, type = 'general'): void {
  const store = getStore();
  const entry = {
    id: 'act_' + Date.now(),
    action,
    detail,
    timestamp: new Date().toISOString(),
    type
  };
  store.activity_log = [entry, ...(store.activity_log || [])].slice(0, 50);
  saveStore(store);
}
