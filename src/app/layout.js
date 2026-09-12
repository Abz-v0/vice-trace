import { Share_Tech_Mono } from 'next/font/google';
import './globals.css';

const techMono = Share_Tech_Mono({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata = {
  title: 'VICE//TRACE :: VCPD Database',
  description: 'VCPD Evidence Database',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={techMono.className}>
      <body>{children}</body>
    </html>
  );
}