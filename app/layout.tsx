import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Consciousness Networks | Quantum Research',
  description: 'Mapping the architecture of interconnected cosmic consciousness',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
