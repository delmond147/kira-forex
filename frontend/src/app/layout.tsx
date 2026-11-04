import type { Metadata } from 'next';
import '@/styles/globals.css';
import { getStore } from '@/lib/store';

export async function generateMetadata(): Promise<Metadata> {
  const store = getStore();
  const settings = store.site_settings || {};
  return {
    title: settings.site_title || 'KIRAFOREX — Trading Academy & Digital Platform',
    description: 'Institutional trading education, proven risk management tools, and an empowering community built for serious forex & synthetics traders.',
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const store = getStore();
  const settings = store.site_settings || {};

  const fontHeading = settings.font_heading || 'Outfit';
  const fontBody = settings.font_body || 'Inter';
  const fontScale = settings.font_scale || '1';

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800&family=DM+Sans:wght@400;500;700&family=Inter:wght@400;500;600;700;800&family=Manrope:wght@500;600;700;800&family=Montserrat:wght@500;600;700;800;900&family=Outfit:wght@600;700;800;900&family=Playfair+Display:wght@600;700;800&family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Poppins:wght@500;600;700;800&family=Space+Grotesk:wght@500;600;700&family=Syne:wght@700;800&family=Urbanist:wght@500;600;700;800&display=swap" 
          rel="stylesheet" 
        />
        <style dangerouslySetInnerHTML={{
          __html: `
            :root {
              --font-scale: ${fontScale};
              --font-heading: '${fontHeading}', sans-serif;
              --font-body: '${fontBody}', sans-serif;
            }
            html {
              font-size: calc(16px * var(--font-scale));
            }
            body {
              font-family: var(--font-body);
            }
            h1, h2, h3, h4, h5, h6 {
              font-family: var(--font-heading);
            }
          `
        }} />
      </head>
      <body suppressHydrationWarning className="bg-white text-neutral-900 antialiased selection:bg-emerald-100 selection:text-neutral-950">
        {children}
      </body>
    </html>
  );
}
