import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Math Padlock Challenge',
  description: 'An interactive educational game where students solve math problems to unlock padlocks',
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
