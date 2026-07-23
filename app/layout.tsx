import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host") ?? "smartcash.ai";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "https";
  const origin = `${protocol}://${host}`;
  const description =
    "Perakaunan pintar berasaskan AI untuk perniagaan kecil dan sederhana Malaysia.";

  return {
    title: {
      default: "SmartCash AI",
      template: "%s | SmartCash AI",
    },
    description,
    openGraph: {
      type: "website",
      locale: "ms_MY",
      title: "SmartCash AI",
      description,
      images: [
        {
          url: `${origin}/og.png`,
          width: 1792,
          height: 1024,
          alt: "SmartCash AI — Akaun lebih kemas, keputusan lebih pantas",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "SmartCash AI",
      description,
      images: [`${origin}/og.png`],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ms">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
