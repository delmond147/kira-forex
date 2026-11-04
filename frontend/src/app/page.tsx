import { Header } from '@/components/Header';
import { HeroParallax } from '@/components/HeroParallax';
import { TradingTools } from '@/components/TradingTools';
import { YouTubeSection } from '@/components/YouTubeSection';
import { Footer } from '@/components/Footer';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col bg-white">
      <Header />
      <HeroParallax />
      <TradingTools />
      <YouTubeSection />
      <Footer />
    </main>
  );
}
