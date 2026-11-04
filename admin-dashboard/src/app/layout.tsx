import type { Metadata } from 'next';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: 'KIRAFOREX CMS — Executive Administration',
  description: 'Private content management and analytics platform for Kiraforex Trading Academy.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#F8FAF9] text-neutral-900 antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
