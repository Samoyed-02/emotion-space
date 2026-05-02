import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '감정 우주 — Emotion Universe',
  description: '당신의 감정을 우주로 표현합니다',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
