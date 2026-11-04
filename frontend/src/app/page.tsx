import { getStore } from '@/lib/store';
import { Header } from '@/components/Header';
import { HeroSection } from '@/components/HeroSection';
import { AboutSection } from '@/components/AboutSection';
import { ServicesSection } from '@/components/ServicesSection';
import { EventsSection } from '@/components/EventsSection';
import { TradingTools } from '@/components/TradingTools';
import { YouTubeSection } from '@/components/YouTubeSection';
import { TelegramSection } from '@/components/TelegramSection';
import { ContactSection } from '@/components/ContactSection';
import { Footer } from '@/components/Footer';
import { WhatsAppButton } from '@/components/WhatsAppButton';

export const revalidate = 0; // Dynamic server-rendered

export default function HomePage() {
  const store = getStore();
  const settings = store.site_settings || {};
  const services = (store.services || []).filter((s) => s.status === 'published');
  const now = Date.now();
  const activeEvents = (store.events || []).filter((e) => {
    return e.status === 'published' && new Date(e.expiry_date).getTime() > now;
  });

  return (
    <main className="min-h-screen flex flex-col bg-white">
      <Header />
      <HeroSection settings={settings} />
      <AboutSection settings={settings} />
      <ServicesSection services={services} settings={settings} />
      <EventsSection events={activeEvents} settings={settings} />
      <TradingTools />
      <YouTubeSection />
      <TelegramSection settings={settings} />
      <ContactSection services={services} settings={settings} />
      <Footer />
      <WhatsAppButton 
        phone={settings.whatsapp_phone} 
        url={settings.whatsapp_general_url} 
      />
    </main>
  );
}
