import type { Metadata, Viewport } from "next";
import "./globals.css";

const siteUrl = "https://psychologists-rivixxxs-projects.vercel.app";
const siteTitle = "MindPlace — психологическая поддержка рядом";
const siteDescription =
  "Подберите психолога под свой запрос. Изучите профили и специализации, отправьте обращение и начните путь к эмоциональному благополучию.";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "MindPlace",
  title: {
    default: siteTitle,
    template: "%s | MindPlace",
  },
  description: siteDescription,
  keywords: [
    "психолог онлайн",
    "подбор психолога",
    "психологическая помощь",
    "тревога и стресс",
    "отношения",
    "самооценка",
  ],
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    url: siteUrl,
    siteName: "MindPlace",
    title: siteTitle,
    description: siteDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: [
      {
        url: "/opengraph-image",
        alt: "MindPlace — психологическая поддержка рядом",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
