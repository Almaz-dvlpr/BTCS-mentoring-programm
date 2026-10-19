import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Video Platform (localhost demo)",
  description: "Локальный каркас платформы генерации видео: промпт → превью → черновик → финал",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <div className="mx-auto max-w-4xl px-4 py-8">
          <header className="mb-8 flex items-center justify-between">
            <Link href="/" className="text-lg font-semibold">
              🎬 Video Platform <span className="text-sm text-neutral-500">(localhost)</span>
            </Link>
            <nav className="flex gap-4 text-sm text-neutral-300">
              <Link href="/">Создать</Link>
              <Link href="/history">История</Link>
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
