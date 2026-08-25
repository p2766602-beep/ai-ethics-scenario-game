import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '思辨島｜AI 倫理情境桌遊',
  description: '3–4 人一組，一起說出想法、聽見差異的 AI 倫理情境桌遊。',
  metadataBase: new URL('https://p2766602-beep.github.io/ai-ethics-scenario-game/'),
  openGraph: {
    title: '思辨島｜AI 倫理情境桌遊',
    description: '3–4 人一組，一起說出想法、聽見差異，探索 AI 倫理情境。',
    images: ['og.png'],
    locale: 'zh_TW',
    type: 'website',
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-Hant"><body>{children}</body></html>;
}
