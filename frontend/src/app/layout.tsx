import type { Metadata } from 'next';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'KIRAFOREX — Trading Academy & Digital Platform',
  description: 'Institutional trading education, proven risk management tools, and an empowering community built for serious forex & synthetics traders.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-white text-neutral-900 antialiased selection:bg-emerald-100 selection:text-neutral-950">
        {children}
      </body>
    </html>
  );
}
