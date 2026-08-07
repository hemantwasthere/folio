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
    images: "/dread.jpg",
  },
  twitter: {
    images: "/dread.jpg",
    card: "summary",
  },
};

// Matches the dark default above, so the browser chrome does not flash a light
// bar over a dark page for visitors whose OS is set to light.
export const viewport: Viewport = {
  themeColor: "#181a1e",
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
          {/* Dark is the default rather than "system": the palette and the hero
              art are built for it, so a light-mode OS should not decide what a
              first-time visitor sees. The toggle still sets an explicit theme,
              which is remembered from then on. */}
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
            <NextIntlClientProvider>{children}</NextIntlClientProvider>
          </ThemeProvider>
        </PHProvider>
        <Analytics />
      </body>
    </html>
  );
}
