import { Analytics } from "@vercel/analytics/react";
import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";

import { PHProvider } from "@/providers/ph-provider";
import { ThemeProvider } from "@/providers/theme-provider";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://hemant.lol"),
  title: "Hemant",
  description: "Aesthetic, minimalistic, and responsive portfolio website.",
  openGraph: {
    title: "Hemant",
    description: "not the only website ever",
    type: "website",
    url: "https://hemant.lol",
    images: "/dread.png",
  },
  twitter: {
    images: "/dread.png",
    card: "summary",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#dce5e6" },
    { media: "(prefers-color-scheme: dark)", color: "#181a1e" },
  ],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className="font-spacegrotesk relative">
        <PHProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <NextIntlClientProvider>{children}</NextIntlClientProvider>
          </ThemeProvider>
        </PHProvider>
        <Analytics />
      </body>
    </html>
  );
}
