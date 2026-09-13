import { Share_Tech_Mono } from 'next/font/google';
import './globals.css';

const techMono = Share_Tech_Mono({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata = {
  title: 'VICE//TRACE — A GTA VI-Inspired Detective Game | Built with Unlayer Image Editor',
  description: 'Step into the shoes of a Vice City detective. Inspect tampered crime scene photos using the Unlayer Image Editor, find the lie, and close the case. An interactive narrative micro-game built for the #BuiltWithImageEditor challenge.',
  keywords: ['GTA VI', 'Vice City', 'detective game', 'image editor', 'Unlayer', 'BuiltWithImageEditor', 'interactive narrative', 'Next.js'],
  authors: [{ name: 'VICE//TRACE' }],
  openGraph: {
    title: 'VICE//TRACE — Find the Lie',
    description: 'An interactive detective micro-game powered by the Unlayer React Image Editor. Inspect evidence. Find what was changed. Close the case.',
    type: 'website',
    siteName: 'VICE//TRACE',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VICE//TRACE — A GTA VI-Inspired Detective Game',
    description: 'Inspect tampered crime scene photos. Find the lie. Close the case. Built with the Unlayer React Image Editor.',
  },
};

export const viewport = {
  themeColor: '#050505',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={techMono.className}>
      <body>{children}</body>
    </html>
  );
}